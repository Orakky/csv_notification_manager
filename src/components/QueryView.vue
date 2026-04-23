<script setup>
import { ref, watch } from 'vue';
import { QueryOperatorLabels, QueryOperators } from '../types';

const props = defineProps({
  queryConfig: {
    type: Object,
    required: true
  },
  fileData: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['execute', 'back']);

// 查询参数
const parameters = ref({});

// 查询状态
const querying = ref(false);

// 初始化参数
watch(() => props.queryConfig, (config) => {
  if (config && config.conditions) {
    const params = {};
    config.conditions.forEach(condition => {
      if (condition.operator !== QueryOperators.NOT_EMPTY) {
        params[condition.column_name] = '';
      }
    });
    parameters.value = params;
  }
}, { immediate: true });

// 执行查询
async function handleExecute() {
  querying.value = true;
  
  try {
    // 验证参数
    for (const condition of props.queryConfig.conditions) {
      if (condition.operator !== QueryOperators.NOT_EMPTY) {
        const value = parameters.value[condition.column_name];
        if (!value || !value.trim()) {
          alert(`请填写 ${condition.column_name} 的查询值`);
          querying.value = false;
          return;
        }
      }
    }
    
    emit('execute', {
      config: props.queryConfig,
      parameters: { ...parameters.value }
    });
  } finally {
    querying.value = false;
  }
}

// 返回
function handleBack() {
  emit('back');
}

// 清空参数
function handleClear() {
  Object.keys(parameters.value).forEach(key => {
    parameters.value[key] = '';
  });
}

// 获取条件描述
function getConditionDescription(condition) {
  const operatorLabel = QueryOperatorLabels[condition.operator] || condition.operator;
  return `${condition.column_name} ${operatorLabel}`;
}
</script>

<template>
  <div class="query-view">
    <div class="query-header">
      <button @click="handleBack" class="back-button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        返回
      </button>
      <div class="query-title">
        <h1>{{ queryConfig.name }}</h1>
        <p>基于文件: {{ queryConfig.fileName }}</p>
      </div>
    </div>

    <div class="query-form">
      <div class="form-section">
        <h2>查询条件</h2>
        <p class="form-description">以下查询条件将在数据中进行筛选</p>
        
        <div class="conditions-list">
          <div 
            v-for="(condition, index) in queryConfig.conditions" 
            :key="index"
            class="condition-item"
          >
            <div class="condition-header">
              <div class="condition-tag">
                <span class="condition-index">{{ index + 1 }}</span>
                <span class="condition-label">
                  {{ getConditionDescription(condition) }}
                </span>
              </div>
            </div>
            <div v-if="condition.operator !== QueryOperators.NOT_EMPTY" class="condition-input-wrapper">
              <input 
                v-model="parameters[condition.column_name]"
                type="text"
                class="condition-input"
                :placeholder="`请输入${condition.column_name}的查询值`"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="action-buttons">
        <button 
          @click="handleExecute"
          class="primary-button"
          :disabled="querying"
        >
          <svg v-if="!querying" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <svg v-else class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
          </svg>
          {{ querying ? '查询中...' : '执行查询' }}
        </button>
      </div>
    </div>

    <div class="query-info">
      <div class="info-card">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        <div class="info-content">
          <h3>查询说明</h3>
          <ul>
            <li>所有条件之间是"且"关系，即必须同时满足</li>
            <li>支持模糊匹配和精确匹配</li>
            <li>查询结果将显示所有匹配的数据行</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.query-view {
  min-height: 100vh;
  background: var(--background);
  padding: var(--spacing-xl);
}

.query-header {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
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

.query-title h1 {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--on-surface);
  font-family: var(--font-headline);
  margin-bottom: var(--spacing-xs);
}

.query-title p {
  font-size: var(--text-sm);
  color: var(--on-surface-variant);
}

.query-form {
  max-width: 600px;
  margin-bottom: var(--spacing-2xl);
}

.form-section {
  background: var(--surface-container-lowest);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow);
  border: 1px solid var(--outline-variant);
  margin-bottom: var(--spacing-xl);
}

.form-section h2 {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--on-surface);
  margin-bottom: var(--spacing-xs);
}

.form-description {
  font-size: var(--text-sm);
  color: var(--on-surface-variant);
  margin-bottom: var(--spacing-xl);
}

.conditions-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.condition-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.condition-header {
  display: flex;
  align-items: center;
}

.condition-input-wrapper {
  padding-left: 48px;
}

.condition-input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--surface-container);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--on-surface);
  transition: all 0.2s ease;
}

.condition-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0, 72, 141, 0.1);
}

.condition-input::placeholder {
  color: var(--on-surface-variant);
}

.condition-tag {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--primary);
  color: var(--on-primary);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
}

.condition-index {
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  font-weight: 700;
}

.action-buttons {
  display: flex;
  gap: var(--spacing-md);
}

.primary-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  color: var(--on-primary);
  border: none;
  box-shadow: 0 4px 12px rgba(0, 72, 141, 0.3);
}

.primary-button:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.primary-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.query-info {
  max-width: 600px;
}

.info-card {
  display: flex;
  gap: var(--spacing-md);
  background: var(--surface-container);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
  border: 1px solid var(--outline-variant);
}

.info-card svg {
  color: var(--primary);
  flex-shrink: 0;
}

.info-content h3 {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--on-surface);
  margin-bottom: var(--spacing-sm);
}

.info-content ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-content li {
  font-size: var(--text-sm);
  color: var(--on-surface-variant);
  margin-bottom: var(--spacing-xs);
  padding-left: var(--spacing-md);
  position: relative;
}

.info-content li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--primary);
}

/* 响应式 */
@media (max-width: 768px) {
  .query-header {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>