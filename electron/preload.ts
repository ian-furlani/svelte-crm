import { contextBridge, ipcRenderer } from 'electron'

// Example: expose a typed API to the renderer
contextBridge.exposeInMainWorld('electronAPI', {
  ping: () => ipcRenderer.invoke('ping'),
})