<script setup>
import { ref, computed } from 'vue';
import { formatDate } from '../utils/formatters';

const props = defineProps({
  fileHistory: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['select', 'cancel']);

// 搜索查询
const searchQuery = ref('');

// 过滤后的历史文件列表
const filteredHistory = computed(() => {
  if (!searchQuery.value) return props.fileHistory;
  
  const query = searchQuery.value.toLowerCase();
  return props.fileHistory.filter(item => 
    item.fileName.toLowerCase().includes(query)
  );
});

// 选择文件
function handleSelect(item) {
  emit('select', item);
}

// 取消
function handleCancel() {
  emit('cancel');
}

// 格式化文件大小
function formatFileSize(bytes) {
  if (!bytes) return '未知';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
</script>

<template>
  <div class="query-file-select-view">
    <div class="page-header">
      <button @click="handleCancel" class="back-button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        返回
      </button>
      <div>
        <h1 class="page-title">选择数据文件</h1>
        <p class="page-subtitle">从历史导入的文件中选择一个用于创建查询</p>
      </div>
    </div>

    <!-- 搜索 -->
    <div class="search-section">
      <div class="search-input-wrapper">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <input 
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="搜索文件名..."
        />
      </div>
    </div>

    <!-- 文件列表 -->
    <div v-if="filteredHistory.length === 0" class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
      <h3>暂无历史文件</h3>
      <p>请先在"数据导入"页面导入文件</p>
    </div>

    <div v-else class="files-list">
      <div 
        v-for="item in filteredHistory" 
        :key="item.id"
        class="file-card"
        @click="handleSelect(item)"
      >
        <div class="file-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        
        <div class="file-info">
          <h3 class="file-name">{{ item.fileName }}</h3>
          <div class="file-meta">
            <span class="meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="9" y1="21" x2="9" y2="9"/>
              </svg>
              {{ item.data?.headers?.length || 0 }} 列
            </span>
            <span class="meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="17" y1="10" x2="3" y2="10"/>
                <line x1="21" y1="6" x2="3" y2="6"/>
                <line x1="21" y1="14" x2="3" y2="14"/>
                <line x1="17" y1="18" x2="3" y2="18"/>
              </svg>
              {{ item.data?.rows?.length || 0 }} 行
            </span>
            <span class="meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              {{ formatDate(item.timestamp) }}
            </span>
          </div>
          <div v-if="item.data?.headers" class="file-columns">
            <span class="columns-label">列名：</span>
            <span class="columns-preview">{{ item.data.headers.slice(0, 5).join(', ') }}{{ item.data.headers.length > 5 ? '...' : '' }}</span>
          </div>
        </div>
        
        <div class="select-action">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.query-file-select-view {
  padding: var(--spacing-xl);
}

.page-header {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.back-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--surface-container);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-md);
  color: var(--on-surface);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-button:hover {
  background: var(--surface-container-high);
  border-color: var(--primary);
}

.page-title {
  font-size: var(--text-3xl);
  font-weight: 800;
  color: var(--on-surface);
  font-family: var(--font-headline);
  letter-spacing: -0.5px;
  margin-bottom: var(--spacing-xs);
}

.page-subtitle {
  font-size: var(--text-base);
  color: var(--on-surface-variant);
}

/* 搜索区域 */
.search-section {
  margin-bottom: var(--spacing-xl);
}

.search-input-wrapper {
  position: relative;
  max-width: 400px;
}

.search-input-wrapper svg {
  position: absolute;
  left: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  color: var(--on-surface-variant);
}

.search-input {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-md) var(--spacing-md) calc(var(--spacing-md) + 24px);
  background: var(--surface-container-lowest);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  color: var(--on-surface);
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0, 72, 141, 0.1);
}

.search-input::placeholder {
  color: var(--on-surface-variant);
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  color: var(--on-surface-variant);
  text-align: center;
}

.empty-state svg {
  margin-bottom: var(--spacing-lg);
  opacity: 0.5;
}

.empty-state h3 {
  font-size: var(--text-lg);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
  color: var(--on-surface);
}

.empty-state p {
  font-size: var(--text-sm);
}

/* 文件列表 */
.files-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.file-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  background: var(--surface-container-lowest);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow);
  border: 1px solid var(--outline-variant);
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-card:hover {
  box-shadow: var(--shadow-lg);
  border-color: var(--primary);
  transform: translateY(-2px);
}

.file-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, rgba(0, 72, 141, 0.1) 0%, rgba(0, 95, 184, 0.1) 100%);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  flex-shrink: 0;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--on-surface);
  margin-bottom: var(--spacing-sm);
  word-break: break-all;
}

.file-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--text-sm);
  color: var(--on-surface-variant);
}

.meta-item svg {
  color: var(--primary);
}

.file-columns {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-xs);
  font-size: var(--text-sm);
}

.columns-label {
  color: var(--on-surface-variant);
  flex-shrink: 0;
}

.columns-preview {
  color: var(--on-surface);
  word-break: break-all;
}

.select-action {
  color: var(--on-surface-variant);
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.file-card:hover .select-action {
  color: var(--primary);
  transform: translateX(4px);
}

/* 响应式 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .file-card {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .select-action {
    align-self: flex-end;
  }
}
</style>