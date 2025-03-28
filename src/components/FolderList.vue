<template>
  <div class="folder-list-container">
    <div class="folder-header">
      <h3>Note</h3>
      <button class="select-folder-btn" @click="selectFolder">选择目录</button>
    </div>
    <div class="folder-tree" @contextmenu.prevent="showContextMenu($event, null)">
      <div v-if="currentPath" class="current-path">{{ currentPath }}</div>
      <div v-if="files.length === 0" class="empty-message">
        暂无文件，请选择目录
      </div>
      <div v-else class="file-list">
        <div v-for="file in files" :key="file.path" class="file-item-container">
          <div class="file-item" @click="file.isDirectory ? toggleFolder(file) : handleFileClick(file)"
            @contextmenu.prevent="showContextMenu($event, file)">
            <span class="file-icon">{{ file.isDirectory ? (expandedFolders[file.path] ? '📂' : '📁') : '📄' }}</span>
            <span class="file-name">{{ file.isDirectory ? file.name : removeExtension(file.name) }}</span>
          </div>
          <div v-if="file.isDirectory && expandedFolders[file.path]" class="subfolder-list">
            <div v-for="subFile in file.children" :key="subFile.path" class="file-item"
              @click.stop="subFile.isDirectory ? toggleFolder(subFile) : handleFileClick(subFile)"
              @contextmenu.prevent="showContextMenu($event, subFile)">
              <span class="file-icon">{{ subFile.isDirectory ? (expandedFolders[subFile.path] ? '📂' : '📁') : '📄'
                }}</span>
              <span class="file-name">{{ subFile.isDirectory ? subFile.name : removeExtension(subFile.name) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 右键菜单 -->
    <div v-if="showMenu" class="context-menu" :style="menuPosition">
      <div class="menu-item" @click="createNewItem('folder')">
        <span class="menu-icon">📁</span>
        <span>新建文件夹</span>
      </div>
      <div class="menu-item" @click="createNewItem('file')">
        <span class="menu-icon">📄</span>
        <span>新建文件</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FolderList',
  data() {
    return {
      currentPath: '',
      files: [],
      showMenu: false,
      menuPosition: {
        top: '0px',
        left: '0px'
      },
      selectedFile: null,
      expandedFolders: {}
    }
  },
  async created() {
    const lastDirectory = await window.electronAPI.getLastDirectory();
    if (lastDirectory) {
      this.currentPath = lastDirectory;
      await this.loadDirectory(lastDirectory);
    }
  },
  methods: {
    removeExtension(filename) {
      return filename.endsWith('.md') ? filename.slice(0, -3) : filename;
    },
    showContextMenu(event, file) {
      event.preventDefault();
      this.showMenu = true;
      this.menuPosition = {
        top: `${event.clientY}px`,
        left: `${event.clientX}px`
      };
      this.selectedFile = file;
      document.addEventListener('click', this.hideContextMenu);
    },
    hideContextMenu() {
      this.showMenu = false;
      this.selectedFile = null;
      document.removeEventListener('click', this.hideContextMenu);
    },
    async createNewItem(type) {
      if (!this.currentPath) return;

      // 使用根目录或选中的文件夹目录
      const basePath = this.selectedFile?.isDirectory ? this.selectedFile.path : this.currentPath;
      const name = type === 'folder' ? '新建文件夹' : '新建文件.md';
      const baseName = type === 'folder' ? '新建文件夹' : '新建文件';
      const ext = type === 'folder' ? '' : '.md';

      let newPath = `${basePath}/${name}`;
      let counter = 1;

      try {
        // 检查文件是否已存在并处理文件名冲突
        while (true) {
          try {
            if (type === 'folder') {
              await window.electronAPI.createDirectory(newPath);
            } else {
              await window.electronAPI.createFile(newPath);
            }
            break; // 如果创建成功，跳出循环
          } catch (error) {
            if (error.message.includes('EEXIST')) {
              // 文件已存在，尝试新的名称
              newPath = `${basePath}/${baseName} (${counter})${ext}`;
              counter++;
            } else {
              // 其他错误，直接抛出
              throw error;
            }
          }
        }

        // 如果是在子文件夹中创建，需要确保父文件夹是展开的
        if (this.selectedFile?.isDirectory) {
          this.expandedFolders[this.selectedFile.path] = true;
        }

        // 重新加载目录
        await this.loadDirectory(this.currentPath);
      } catch (error) {
        console.error(`创建${type === 'folder' ? '文件夹' : '文件'}失败:`, error);
      }
      this.hideContextMenu();
    },
    async selectFolder() {
      try {
        const path = await window.electronAPI.selectDirectory();
        if (path) {
          this.currentPath = path;
          await this.loadDirectory(path);
        }
      } catch (error) {
        console.error('选择目录失败:', error);
      }
    },
    async loadDirectory(path) {
      try {
        const files = await window.electronAPI.readDirectory(path);
        files.sort((a, b) => b.isDirectory - a.isDirectory);
        for (const file of files) {
          if (file.isDirectory) {
            file.children = await window.electronAPI.readDirectory(file.path);
          }
        }
        this.files = files;
      } catch (error) {
        console.error('读取目录失败:', error);
        this.files = [];
      }
    },
    async handleFileClick(file) {
      if (!file.isDirectory) {
        this.$emit('file-selected', file.path);
      }
    },
    toggleFolder(folder) {
      if (folder.isDirectory) {
        const newExpandedFolders = { ...this.expandedFolders };
        newExpandedFolders[folder.path] = !newExpandedFolders[folder.path];
        this.expandedFolders = newExpandedFolders;
      }
    }
  }
}
</script>

<style>
.folder-list-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.folder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid #e0e0e0;
}

.folder-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.select-folder-btn {
  padding: 4px 8px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.select-folder-btn:hover {
  background-color: #e0e0e0;
}

.folder-tree {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.current-path {
  font-size: 12px;
  color: #666;
  padding: 4px 8px;
  margin-bottom: 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
  word-break: break-all;
}

.empty-message {
  color: #999;
  text-align: center;
  padding: 20px;
}

.file-list {
  margin-top: 8px;
}

.file-item-container {
  margin-bottom: 2px;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 4px;
}

.file-item:hover {
  background-color: #f5f5f5;
}

.file-icon {
  margin-right: 8px;
  font-size: 14px;
}

.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

.subfolder-list {
  margin-left: 24px;
}

.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 4px 0;
  z-index: 1000;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 5px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 14px;
}

.menu-item:hover {
  background-color: #f5f5f5;
}

.menu-icon {
  margin-right: 8px;
}
</style>