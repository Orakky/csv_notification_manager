<script setup>
import { ref, computed, onMounted } from 'vue';
import { QueryOperatorLabels } from '../types';

const props = defineProps({
  queryConfigs: {
    type: Array,
    default: () => []
  },
  fileHistory: {
    type: Array,
    default: () => []
  }
});

// 调试信息
onMounted(() => {
  console.log('[QueryManagerView] 组件已挂载');
  console.log('[QueryManagerView] queryConfigs:', props.queryConfigs);
  console.log('[QueryManagerView] fileHistory:', props.fileHistory);
});

const emit = defineEmits(['create', 'edit', 'delete', 'execute', 'select-file']);

// 搜索查询
const searchQuery = ref('');

// 过滤后的配置列表
const filteredConfigs = computed(() => {
  if (!searchQuery.value) return props.queryConfigs;
  
  const query = searchQuery.value.toLowerCase();
  return props.queryConfigs.filter(config => 
    config.name.toLowerCase().includes(query) ||
    config.fileName.toLowerCase().includes(query)
  );
});

// 创建新查询
function handleCreate() {
  emit('select-file');
}

// 编辑查询配置
function handleEdit(config) {
  emit('edit', config);
}

// 删除查询配置
function handleDelete(config) {
  if (confirm(`确定要删除查询配置"${config.name}"吗？`)) {
    emit('delete', config.id);
  }
}

// 执行查询
function handleExecute(config) {
  emit('execute', config);
}

// 获取条件描述
function getConditionDescription(condition) {
  const operatorLabel = QueryOperatorLabels[condition.operator] || condition.operator;
  if (condition.operator === 'not_empty') {
    return `${condition.column_name} ${operatorLabel}`;
  }
  return `${condition.column_name} ${operatorLabel}`;
}

// 格式化日期
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// 获取查询链接
function getQueryLink(configId) {
  return `?query=${configId}`;
}

// 复制查询链接
async function copyQueryLink(configId) {
  try {
    const link = `${window.location.origin}${window.location.pathname}?query=${configId}`;
    await navigator.clipboard.writeText(link);
    alert('链接已复制到剪贴板');
  } catch (error) {
    console.error('复制失败:', error);
    // 降级方案
    const textArea = document.createElement('textarea');
    textArea.value = `${window.location.origin}${window.location.pathname}?query=${configId}`;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('链接已复制到剪贴板');
  }
}
</script>

<template>
  <div class="query-manager-view">
    <div class="page-header">
      <div>
        <h1 class="page-title">查询管理</h1>
        <p class="page-subtitle">创建和管理数据查询配置，生成可分享的查询链接</p>
      </div>
      <div class="header-actions">
        <button @click="handleCreate" class="primary-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          创建查询
        </button>
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
          placeholder="搜索查询配置..."
        />
      </div>
    </div>

    <!-- 查询配置列表 -->
    <div v-if="filteredConfigs.length === 0" class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
      <h3>暂无查询配置</h3>
      <p>点击上方"创建查询"按钮开始创建您的第一个查询配置</p>
    </div>

    <div v-else class="configs-list">
      <div 
        v-for="config in filteredConfigs" 
        :key="config.id"
        class="config-card"
      >
        <div class="config-header">
          <div class="config-info">
            <h3 class="config-name">{{ config.name }}</h3>
            <p class="config-file">基于文件: {{ config.fileName }}</p>
            <p class="config-time">创建时间: {{ formatDate(config.createdAt) }}</p>
          </div>
          <div class="config-actions">
            <button 
              @click="handleExecute(config)"
              class="action-button execute-button"
              title="执行查询"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              查询
            </button>
            
            <button 
              @click="handleEdit(config)"
              class="action-button edit-button"
              title="编辑配置"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              编辑
            </button>
            
            <button 
              @click="handleDelete(config)"
              class="action-button delete-button"
              title="删除配置"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              删除
            </button>
          </div>
        </div>
        
        <div class="config-conditions">
          <h4>查询条件</h4>
          <div class="conditions-tags">
            <span 
              v-for="(condition, index) in config.conditions" 
              :key="index"
              class="condition-tag"
            >
              {{ getConditionDescription(condition) }}
            </span>
          </div>
        </div>
        
        <div class="config-link">
          <h4>分享链接</h4>
          <div class="link-container">
            <input 
              type="text" 
              :value="getQueryLink(config.id)"
              readonly
              class="link-input"
            />
            <button 
              @click="copyQueryLink(config.id)"
              class="copy-button"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              复制
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.query-manager-view {
  padding: var(--spacing-xl);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
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

.header-actions {
  display: flex;
  gap: var(--spacing-md);
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

/* 配置列表 */
.configs-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.config-card {
  background: var(--surface-container-lowest);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow);
  border: 1px solid var(--outline-variant);
  transition: all 0.2s ease;
}

.config-card:hover {
  box-shadow: var(--shadow-lg);
  border-color: var(--primary);
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-lg);
}

.config-info {
  flex: 1;
}

.config-name {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--on-surface);
  margin-bottom: var(--spacing-xs);
}

.config-file {
  font-size: var(--text-sm);
  color: var(--on-surface-variant);
  margin-bottom: var(--spacing-xs);
}

.config-time {
  font-size: var(--text-xs);
  color: var(--on-surface-variant);
}

.config-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.action-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--surface-container);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--on-surface);
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover {
  background: var(--surface-container-high);
  border-color: var(--primary);
}

.execute-button:hover {
  background: rgba(16, 185, 129, 0.1);
  border-color: #059669;
  color: #059669;
}

.delete-button:hover {
  background: var(--error-container);
  border-color: var(--error);
  color: var(--on-error-container);
}

/* 条件区域 */
.config-conditions {
  margin-bottom: var(--spacing-lg);
}

.config-conditions h4 {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--on-surface);
  margin-bottom: var(--spacing-sm);
}

.conditions-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.condition-tag {
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--primary);
  color: var(--on-primary);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
}

/* 链接区域 */
.config-link h4 {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--on-surface);
  margin-bottom: var(--spacing-sm);
}

.link-container {
  display: flex;
  gap: var(--spacing-sm);
}

.link-input {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--surface-container);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--on-surface);
}

.copy-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--surface-container);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--on-surface);
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-button:hover {
  background: var(--surface-container-high);
  border-color: var(--primary);
}

/* 响应式 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
  
  .config-header {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .config-actions {
    width: 100%;
    justify-content: flex-start;
  }
  
  .link-container {
    flex-direction: column;
  }
}
</style>