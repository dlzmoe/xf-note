<template>
  <div class="toc-sidebar">
    <div class="toc-header">
      <h4>目录</h4>
    </div>
    <div class="toc-items" v-if="headings.length">
      <div 
        v-for="heading in headings" 
        :key="heading.id"
        class="toc-item"
        :style="{ paddingLeft: (heading.level - 2) * 16 + 'px' }"
        >
          {{ heading.text }}
        </div>
    </div>
    <div v-else class="empty-toc">
      暂无目录
    </div>
  </div>
</template>

<script>
export default {
  props: {
    headings: {
      type: Array,
      default: () => []
    }
  },
  methods: {}
};
</script>

<style>
.toc-sidebar {
  width: 240px;
  height: 100%;
  border-left: 1px solid #e0e0e0;
  padding: 16px;
  overflow-y: auto;
}

.toc-header {
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
  margin-bottom: 12px;
}

.toc-header h4 {
  margin: 0;
  font-size: 14px;
  color: #333;
}

.toc-item {
  padding: 6px 0;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.toc-item:hover {
  color: #007bff;
  transform: translateX(4px);
}

.empty-toc {
  color: #999;
  text-align: center;
  padding: 20px 0;
}
</style>