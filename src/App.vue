<template>
  <div class="container">
    <div class="sidebar">
      <Header />
      <FolderList ref="folderList" @file-selected="handleFileSelected" />
    </div>
    <div class="content">
      <FileEditor :filePath="selectedFilePath" @file-renamed="handleFileRenamed" @content-updated="handleContentUpdate" />
    </div>
    <TocSidebar :headings="currentHeadings" />
  </div>
</template>

<script>
import Header from './components/Header.vue';
import FolderList from './components/FolderList.vue';
import FileEditor from './components/FileEditor.vue';
import TocSidebar from './components/TocSidebar.vue';

export default {
  components: {
    Header,
    FolderList,
    FileEditor,
    TocSidebar,
  },
  data() {
    return {
      selectedFilePath: ''
    }
  },
  methods: {
    handleFileSelected(filePath) {
      this.selectedFilePath = filePath;
    },
    async handleFileRenamed(newPath) {
      this.selectedFilePath = newPath;
      const folderList = this.$refs.folderList;
      if (folderList) {
        await folderList.loadDirectory(folderList.currentPath);
      }
    }
  }
}
</script>

<style>
.container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.sidebar {
  width: 250px;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}

.folder-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
</style>