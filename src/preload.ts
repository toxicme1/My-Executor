import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("executor", {
  run: (source: string) => ipcRenderer.invoke("script:run", source)
});
