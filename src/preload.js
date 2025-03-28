const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // 选择文件夹
  selectDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  // 读取目录内容
  readDirectory: (path) => ipcRenderer.invoke('fs:readDirectory', path),
  // 获取上次打开的目录
  getLastDirectory: () => ipcRenderer.invoke('store:getLastDirectory'),
  // 读取文件内容
  readFile: (filePath) => ipcRenderer.invoke('fs:readFile', filePath),
  // 写入文件内容
  writeFile: (filePath, content) => ipcRenderer.invoke('fs:writeFile', filePath, content),
  // 创建文件夹
  createDirectory: (dirPath) => ipcRenderer.invoke('fs:createDirectory', dirPath),
  // 创建文件
  createFile: (filePath) => ipcRenderer.invoke('fs:createFile', filePath),
  // 重命名文件
  renameFile: (oldPath, newPath) => ipcRenderer.invoke('fs:renameFile', oldPath, newPath)
});
