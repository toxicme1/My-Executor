import { app, BrowserWindow, ipcMain } from "electron";
import { autoUpdater } from "electron-updater";
import path from "node:path";
import { runScript } from "./runtime";

let mainWindow: BrowserWindow | undefined;
let floatingWindow: BrowserWindow | undefined;

function sendUpdateStatus(status: string): void {
  mainWindow?.webContents.send("update:status", status);
}

function createFloatingWindow(): BrowserWindow {
  if (floatingWindow && !floatingWindow.isDestroyed()) return floatingWindow;

  floatingWindow = new BrowserWindow({
    width: 430,
    height: 270,
    minWidth: 320,
    minHeight: 180,
    alwaysOnTop: true,
    backgroundColor: "#0f1117",
    title: "My Executor Output",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  void floatingWindow.loadFile(path.join(__dirname, "..", "ui", "floating.html"));
  floatingWindow.on("closed", () => {
    floatingWindow = undefined;
  });
  return floatingWindow;
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1120,
    height: 760,
    minWidth: 820,
    minHeight: 560,
    backgroundColor: "#0f1117",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  void mainWindow.loadFile(path.join(__dirname, "..", "ui", "index.html"));
}

ipcMain.handle("script:run", async (_event, source: unknown) => {
  if (typeof source !== "string") {
    return { ok: false, output: "", error: "Script must be text." };
  }

  const result = runScript(source);
  const panel = createFloatingWindow();
  if (panel.webContents.isLoading()) {
    panel.webContents.once("did-finish-load", () => {
      panel.webContents.send("floating:output", result);
    });
  } else {
    panel.webContents.send("floating:output", result);
  }
  return result;
});

ipcMain.handle("window:toggle-floating", () => {
  const panel = createFloatingWindow();
  if (panel.isVisible()) panel.hide();
  else panel.show();
  return panel.isVisible();
});

ipcMain.handle("update:check", async () => {
  if (!app.isPackaged) return "Updates are available after installing a packaged release.";
  try {
    await autoUpdater.checkForUpdates();
    return "Checking for updates...";
  } catch (error) {
    return `Update check failed: ${error instanceof Error ? error.message : "unknown error"}`;
  }
});

autoUpdater.on("checking-for-update", () => sendUpdateStatus("Checking for updates..."));
autoUpdater.on("update-available", () => sendUpdateStatus("Update available."));
autoUpdater.on("update-not-available", () => sendUpdateStatus("You are up to date."));
autoUpdater.on("download-progress", (progress) => {
  sendUpdateStatus(`Downloading update ${Math.round(progress.percent)}%`);
});
autoUpdater.on("update-downloaded", () => {
  sendUpdateStatus("Update ready. Restarting...");
  autoUpdater.quitAndInstall();
});
autoUpdater.on("error", (error) => sendUpdateStatus(`Update error: ${error.message}`));

app.whenReady().then(() => {
  createWindow();
  if (app.isPackaged) void autoUpdater.checkForUpdatesAndNotify();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
