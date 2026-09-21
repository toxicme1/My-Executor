import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { runScript } from "./runtime";

let mainWindow: BrowserWindow | undefined;

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

  return runScript(source);
});

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
