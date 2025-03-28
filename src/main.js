import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import path from 'node:path';
import fs from 'node:fs/promises';
import Store from 'electron-store';
import started from 'electron-squirrel-startup';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

// 初始化electron-store
const store = new Store();

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#ffffff', // 设置窗口背景色，包括标题栏
    // titleBarStyle: 'hidden', // 可选，如果你想自定义整个标题栏
    autoHideMenuBar: true, // 是否隐藏菜单栏
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 创建新文件夹
ipcMain.handle('fs:createDirectory', async (event, dirPath) => {
  try {
    await fs.mkdir(dirPath);
    return true;
  } catch (error) {
    console.error('创建文件夹失败:', error);
    throw error;
  }
});

// 创建新文件
ipcMain.handle('fs:createFile', async (event, filePath) => {
  try {
    await fs.writeFile(filePath, '', 'utf-8');
    return true;
  } catch (error) {
    console.error('创建文件失败:', error);
    throw error;
  }
});



// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 处理选择目录
ipcMain.handle('dialog:openDirectory', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });

  if (!canceled) {
    const selectedPath = filePaths[0];
    store.set('lastDirectory', selectedPath);
    return selectedPath;
  }
  return undefined;
});

// 读取目录内容
ipcMain.handle('fs:readDirectory', async (event, dirPath) => {
  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true });

    return items.map(item => ({
      name: item.name,
      isDirectory: item.isDirectory(),
      path: path.join(dirPath, item.name)
    }));
  } catch (error) {
    console.error('读取目录失败:', error);
    throw error;
  }
});

// 获取上次打开的目录
ipcMain.handle('store:getLastDirectory', () => {
  return store.get('lastDirectory');
});

// 读取文件内容
ipcMain.handle('fs:readFile', async (event, filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error('读取文件失败:', error);
    throw error;
  }
});

// 写入文件内容
ipcMain.handle('fs:writeFile', async (event, filePath, content) => {
  try {
    await fs.writeFile(filePath, content, 'utf-8');
    return true;
  } catch (error) {
    console.error('写入文件失败:', error);
    throw error;
  }
});

// 重命名文件
ipcMain.handle('fs:renameFile', async (event, oldPath, newPath) => {
  try {
    await fs.rename(oldPath, newPath);
    return true;
  } catch (error) {
    console.error('重命名文件失败:', error);
    throw error;
  }
});
