<script setup>
import { formatNumber, formatDate } from '../utils/formatters';

const props = defineProps({
  fileHistory: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['view-history', 'delete-history', 'select-file']);

function handleViewHistory(item) {
  emit('view-history', item);
}

function handleDeleteHistory(id) {
  emit('delete-history', id);
}

function handleSelectFile() {
  emit('select-file');
}
</script>

<template>
  <div class="history-view">
    <div class="page-header">
      <div>
        <h1 class="page-title">Historical Data Library</h1>
        <p class="page-subtitle">Browse and manage your previously imported datasets.</p>
      </div>
    </div>

    <div v-if="fileHistory.length === 0" class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="12" y1="18" x2="12" y2="12"/>
        <line x1="9" y1="15" x2="15" y2="15"/>
      </svg>
      <h3>暂无历史记录</h3>
      <p>点击"New Data Import"按钮开始</p>
      <button @click="handleSelectFile" class="primary-button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        New Data Import
      </button>
    </div>

    <div v-else class="history-grid">
      <div 
        v-for="item in fileHistory" 
        :key="item.id" 
        class="history-card"
        @click="handleViewHistory(item)"
      >
        <div class="history-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <div class="history-content">
          <h3 class="history-title">{{ item.fileName }}</h3>
          <div class="history-meta">
            <span class="meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="9" y1="9" x2="15" y2="9"/>
                <line x1="9" y1="15" x2="15" y2="15"/>
                <line x1="9" y1="12" x2="12" y2="12"/>
              </svg>
              {{ item.headers.length }} 列
            </span>
            <span class="meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
              {{ formatNumber(item.rowCount) }} 行
            </span>
          </div>
          <div class="history-time">{{ formatDate(item.timestamp) }}</div>
        </div>
        <button @click.stop="handleDeleteHistory(item.id)" class="delete-button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.history-view {
  padding: var(--spacing-xl);
}

.page-header {
  margin-bottom: var(--spacing-xl);
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
  margin-bottom: var(--spacing-lg);
}

.primary-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  color: var(--on-primary);
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 72, 141, 0.3);
}

.primary-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.history-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.history-card {
  background: var(--surface-container-lowest);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow);
  border: 1px solid var(--outline-variant);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.history-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary);
}

.history-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba(0, 72, 141, 0.1) 0%, rgba(0, 95, 184, 0.1) 100%);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  margin-bottom: var(--spacing-md);
}

.history-content {
  flex: 1;
}

.history-title {
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--on-surface);
  margin-bottom: var(--spacing-sm);
  word-break: break-word;
}

.history-meta {
  display: flex;
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

.history-time {
  font-size: var(--text-xs);
  color: var(--on-surface-variant);
}

.delete-button {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  padding: var(--spacing-xs);
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--on-surface-variant);
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
}

.history-card:hover .delete-button {
  opacity: 1;
}

.delete-button:hover {
  background: var(--error-container);
  color: var(--on-error-container);
}
</style>