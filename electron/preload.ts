import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('electron', {
  store: {
    getEntries: () => ipcRenderer.invoke('get-entries'),
    setEntries: (entries) => ipcRenderer.send('set-entries', entries),
    getVaults: () => ipcRenderer.invoke('get-vaults'),
    setVaults: (vaults) => ipcRenderer.send('set-vaults', vaults),
    getMasterHash: () => ipcRenderer.invoke('get-master-hash'),
    setMasterHash: (hash) => ipcRenderer.send('set-master-hash', hash),
  },
})

contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  // ...
})
