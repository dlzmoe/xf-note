<template>
  <div class="file-editor">
    <div class="editor-header">
      <input
        v-if="filePath"
        v-model="editingFileName"
        class="file-name-input"
        @blur="handleFileNameChange"
        @keyup.enter="$event.target.blur()"
      />
      <h3 v-else>{{ fileName }}</h3>
    </div>
    <textarea
      v-model="content"
      class="editor-content"
      @input="handleInput"
      :placeholder="placeholder"
    ></textarea>
  </div>
</template>

<script>
export default {
  name: 'FileEditor',
  props: {
    filePath: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      content: '',
      isModified: false,
      originalContent: '',
      editingFileName: ''
    }
  },
  computed: {
    fileName() {
      if (!this.filePath) return '未选择文件';
      const name = this.filePath.split('\\').pop();
      return name.endsWith('.md') ? name.slice(0, -3) : name;
    },
    placeholder() {
      return this.filePath ? '' : '请选择一个文件以查看内容'
    }
  },
  watch: {
    fileName: {
      immediate: true,
      handler(newName) {
        this.editingFileName = newName
      }
    },
    async filePath(newPath) {
      if (newPath) {
        await this.loadFileContent()
      } else {
        this.content = ''
        this.originalContent = ''
        this.isModified = false
      }
    },
    content: {
      handler(newVal) {
        // 统一解析Markdown标题
        const headingRegex = /^(#{1,6})\s+(.+)$/gm;
        const matches = [...newVal.matchAll(headingRegex)];
        const headings = matches.map(match => ({
          level: match[1].length,
          text: match[2].trim(),
          id: match[2].trim()
            .toLowerCase()
            .replace(/[^\w\u4e00-\u9fa5]/g, '-')
            .replace(/^-+|-$/g, '')
        }));
        this.$emit('content-updated', headings);
      },
      immediate: true
    }
  },
  methods: {

    async loadFileContent() {
      try {
        const content = await window.electronAPI.readFile(this.filePath)
        this.content = content
        this.originalContent = content
        this.isModified = false
      } catch (error) {
        console.error('读取文件失败:', error)
        this.content = ''
        this.originalContent = ''
      }
    },
    handleInput() {
      this.isModified = this.content !== this.originalContent
      this.saveFile()
    },
    async saveFile() {
      try {
        await window.electronAPI.writeFile(this.filePath, this.content)
        this.originalContent = this.content
        this.isModified = false
      } catch (error) {
        console.error('保存文件失败:', error)
      }
    },
    async handleFileNameChange() {
      if (!this.filePath || this.editingFileName === this.fileName) return
      
      const oldPath = this.filePath
      const newPath = oldPath.substring(0, oldPath.lastIndexOf('\\') + 1) + this.editingFileName + '.md'
      
      try {
        await window.electronAPI.renameFile(oldPath, newPath)
        this.$emit('file-renamed', newPath)
      } catch (error) {
        console.error('重命名文件失败:', error)
        this.editingFileName = this.fileName
      }
    }
  }
}
</script>

<style>
.file-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid #e0e0e0;
}

.editor-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.save-btn {
  padding: 4px 12px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.save-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.save-btn:not(:disabled):hover {
  background-color: #1565c0;
}

.editor-content {
  flex: 1;
  padding: 16px;
  font-size: 14px;
  line-height: 1.6;
  border: none;
  resize: none;
  outline: none;
  font-family: monospace;
}

.editor-content::placeholder {
  color: #999;
}

.file-name-input {
  font-size: 16px;
  color: #333;
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 4px 8px;
  margin: 0;
  width: 100%;
  background: transparent;
  outline: none;
  border: none;
}

/* .file-name-input:hover {
  border-color: #e0e0e0;
}

.file-name-input:focus {
  border-color: #1976d2;
  background-color: white;
} */
</style>