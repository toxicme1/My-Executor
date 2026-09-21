import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("executor", {
  run: (source: string) => ipcRenderer.invoke("script:run", source),
  toggleFloating: () => ipcRenderer.invoke("window:toggle-floating"),
  checkForUpdates: () => ipcRenderer.invoke("update:check"),
  onUpdateStatus: (callback: (status: string) => void) => {
    ipcRenderer.on("update:status", (_event, status: string) => callback(status));
  },
  onFloatingOutput: (callback: (result: unknown) => void) => {
    ipcRenderer.on("floating:output", (_event, result: unknown) => callback(result));
  }
});
