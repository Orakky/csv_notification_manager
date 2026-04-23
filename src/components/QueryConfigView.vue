<script setup>
import { ref, computed, watch } from 'vue';
import { QueryOperators, QueryOperatorLabels } from '../types';

const props = defineProps({
  fileData: {
    type: Object,
    default: null
  },
  existingConfig: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['save', 'cancel']);

// 查询配置名称
const configName = ref('');

// 查询条件列表
const conditions = ref([]);

// 可用列列表
const availableColumns = computed(() => {
  if (!props.fileData || !props.fileData.headers) return [];
  return props.fileData.headers.map((header, index) => ({
    index,
    name: header
  }));
});

// 操作符选项
const operatorOptions = [
  { value: QueryOperators.EQUALS, label: QueryOperatorLabels[QueryOperators.EQUALS] },
  { value: QueryOperators.CONTAINS, label: QueryOperatorLabels[QueryOperators.CONTAINS] },
  { value: QueryOperators.STARTS_WITH, label: QueryOperatorLabels[QueryOperators.STARTS_WITH] },
  { value: QueryOperators.ENDS_WITH, label: QueryOperatorLabels[QueryOperators.ENDS_WITH] },
  { value: QueryOperators.NOT_EMPTY, label: QueryOperatorLabels[QueryOperators.NOT_EMPTY] }
];

// 初始化
watch(() => props.existingConfig, (config) => {
  if (config) {
    configName.value = config.name || '';
    conditions.value = config.conditions ? [...config.conditions] : [];
  } else {
    configName.value = '';
    conditions.value = [];
  }
}, { immediate: true });

// 添加查询条件
function addCondition() {
  if (availableColumns.value.length === 0) return;
  
  conditions.value.push({
    column_index: availableColumns.value[0].index,
    column_name: availableColumns.value[0].name,
    operator: QueryOperators.CONTAINS
  });
}

// 删除查询条件
function removeCondition(index) {
  conditions.value.splice(index, 1);
}

// 更新条件列
function updateConditionColumn(conditionIndex, columnIndex) {
  const column = availableColumns.value.find(c => c.index === parseInt(columnIndex));
  if (column) {
    conditions.value[conditionIndex].column_index = column.index;
    conditions.value[conditionIndex].column_name = column.name;
  }
}

// 保存配置
function handleSave() {
  if (!configName.value.trim()) {
    alert('请输入查询配置名称');
    return;
  }
  
  if (conditions.value.length === 0) {
    alert('请至少添加一个查询条件');
    return;
  }
  
  emit('save', {
    name: configName.value.trim(),
    conditions: [...conditions.value]
  });
}

// 取消
function handleCancel() {
  emit('cancel');
}

// 重置
function handleReset() {
  configName.value = '';
  conditions.value = [];
}
</script>

<template>
  <div class="query-config-view">
    <div class="page-header">
      <div>
        <h1 class="page-title">查询配置</h1>
        <p class="page-subtitle">设置查询条件，生成可分享的查询链接</p>
      </div>
      <div class="header-actions">
        <button @click="handleReset" class="secondary-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="1 4 1 10 7 10"/>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
          </svg>
          重置
        </button>
      </div>
    </div>

    <!-- 文件信息 -->
    <div v-if="fileData" class="file-info-card">
      <div class="file-info">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <div class="file-details">
          <span class="file-name">{{ fileData.fileName || '未命名文件' }}</span>
          <span class="file-stats">{{ fileData.headers?.length || 0 }} 列 × {{ fileData.rows?.length || 0 }} 行</span>
        </div>
      </div>
    </div>

    <!-- 配置名称 -->
    <div class="config-section">
      <label class="section-label">查询配置名称</label>
      <input 
        v-model="configName"
        type="text"
        class="config-name-input"
        placeholder="输入查询配置名称，例如：按姓名和部门查询"
      />
    </div>

    <!-- 查询条件 -->
    <div class="conditions-section">
      <div class="section-header">
        <label class="section-label">查询条件</label>
        <button 
          @click="addCondition"
          class="add-condition-button"
          :disabled="availableColumns.length === 0"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          添加条件
        </button>
      </div>

      <div v-if="conditions.length === 0" class="empty-conditions">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <p>暂无查询条件</p>
        <span>点击上方"添加条件"按钮开始配置</span>
      </div>

      <div v-else class="conditions-list">
        <div 
          v-for="(condition, index) in conditions" 
          :key="index"
          class="condition-item"
        >
          <div class="condition-index">{{ index + 1 }}</div>
          
          <div class="condition-config">
            <div class="condition-row">
              <div class="condition-field">
                <label>查询列</label>
                <select 
                  :value="condition.column_index"
                  @change="updateConditionColumn(index, $event.target.value)"
                  class="condition-select"
                >
                  <option 
                    v-for="column in availableColumns" 
                    :key="column.index"
                    :value="column.index"
                  >
                    {{ column.name }}
                  </option>
                </select>
              </div>
              
              <div class="condition-field">
                <label>操作符</label>
                <select 
                  v-model="condition.operator"
                  class="condition-select"
                >
                  <option 
                    v-for="option in operatorOptions" 
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </div>
              
            </div>
          </div>
          
          <button 
            @click="removeCondition(index)"
            class="remove-condition-button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <button @click="handleCancel" class="secondary-button">
        取消
      </button>
      <button 
        @click="handleSave"
        class="primary-button"
        :disabled="!configName.trim() || conditions.length === 0"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
          <polyline points="17 21 17 13 7 13 7 21"/>
          <polyline points="7 3 7 8 15 8"/>
        </svg>
        保存配置
      </button>
    </div>
  </div>
</template>

<style scoped>
.query-config-view {
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

/* 文件信息卡片 */
.file-info-card {
  background: var(--surface-container-lowest);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  box-shadow: var(--shadow);
  border: 1px solid var(--outline-variant);
}

.file-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.file-info svg {
  color: var(--primary);
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.file-name {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--on-surface);
}

.file-stats {
  font-size: var(--text-sm);
  color: var(--on-surface-variant);
}

/* 配置区域 */
.config-section {
  margin-bottom: var(--spacing-xl);
}

.section-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--on-surface);
  margin-bottom: var(--spacing-sm);
}

.config-name-input {
  width: 100%;
  padding: var(--spacing-md);
  background: var(--surface-container-lowest);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  color: var(--on-surface);
  transition: all 0.2s ease;
}

.config-name-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0, 72, 141, 0.1);
}

.config-name-input::placeholder {
  color: var(--on-surface-variant);
}

/* 条件区域 */
.conditions-section {
  margin-bottom: var(--spacing-xl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.add-condition-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--primary);
  color: var(--on-primary);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-condition-button:hover:not(:disabled) {
  background: var(--primary-container);
  transform: translateY(-1px);
}

.add-condition-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 空状态 */
.empty-conditions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  background: var(--surface-container);
  border-radius: var(--radius-xl);
  text-align: center;
}

.empty-conditions svg {
  color: var(--on-surface-variant);
  margin-bottom: var(--spacing-md);
  opacity: 0.5;
}

.empty-conditions p {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--on-surface);
  margin-bottom: var(--spacing-xs);
}

.empty-conditions span {
  font-size: var(--text-sm);
  color: var(--on-surface-variant);
}

/* 条件列表 */
.conditions-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.condition-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  background: var(--surface-container-lowest);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow);
  border: 1px solid var(--outline-variant);
}

.condition-index {
  width: 32px;
  height: 32px;
  background: var(--primary);
  color: var(--on-primary);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-sm);
  font-weight: 700;
  flex-shrink: 0;
}

.condition-config {
  flex: 1;
}

.condition-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--spacing-md);
}

.condition-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.condition-field label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--on-surface-variant);
  text-transform: uppercase;
}

.condition-select,
.condition-input {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--surface-container);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--on-surface);
  transition: all 0.2s ease;
}

.condition-select:focus,
.condition-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0, 72, 141, 0.1);
}

.condition-input::placeholder {
  color: var(--on-surface-variant);
}

.remove-condition-button {
  padding: var(--spacing-sm);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--on-surface-variant);
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-condition-button:hover {
  background: var(--error-container);
  color: var(--on-error-container);
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--outline-variant);
}

.primary-button,
.secondary-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.primary-button {
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

.secondary-button {
  background: var(--surface-container-lowest);
  color: var(--on-surface-variant);
  border: 1px solid var(--outline-variant);
}

.secondary-button:hover {
  background: var(--surface-container);
  color: var(--on-surface);
}

/* 响应式 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
  
  .condition-row {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>