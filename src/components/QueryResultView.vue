<script setup>
import { ref, computed } from 'vue';
import { formatDate } from '../utils/formatters';

const props = defineProps({
  querySession: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['back', 'export']);

// 导出状态
const exporting = ref(false);

// 分页
const currentPage = ref(1);
const pageSize = ref(20);

// 排序
const sortColumn = ref('');
const sortOrder = ref('asc'); // 'asc' or 'desc'

// 计算分页数据
const paginatedResults = computed(() => {
  let results = [...props.querySession.results];
  
  // 排序
  if (sortColumn.value) {
    results.sort((a, b) => {
      const aVal = a.data[sortColumn.value] || '';
      const bVal = b.data[sortColumn.value] || '';
      const comparison = String(aVal).localeCompare(String(bVal));
      return sortOrder.value === 'asc' ? comparison : -comparison;
    });
  }
  
  // 分页
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return results.slice(start, end);
});

// 总页数
const totalPages = computed(() => {
  return Math.ceil(props.querySession.results.length / pageSize.value);
});

// 表头列表
const headers = computed(() => {
  if (!props.querySession.results || props.querySession.results.length === 0) return [];
  return Object.keys(props.querySession.results[0].data);
});

// 返回
function handleBack() {
  emit('back');
}

// 导出结果
async function handleExport() {
  exporting.value = true;
  try {
    // 模拟最小导出时间，让用户看到动画
    await new Promise(resolve => setTimeout(resolve, 800));
    emit('export', props.querySession);
    // 等待一小段时间后关闭弹窗
    await new Promise(resolve => setTimeout(resolve, 500));
  } finally {
    exporting.value = false;
  }
}

// 排序
function handleSort(column) {
  if (sortColumn.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn.value = column;
    sortOrder.value = 'asc';
  }
}

// 上一页
function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}

// 下一页
function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
}

// 跳转到指定页
function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
}

// 获取统计信息
const stats = computed(() => {
  const total = props.querySession.totalCount;
  const matched = props.querySession.matchedCount;
  const matchRate = total > 0 ? Math.round((matched / total) * 100) : 0;
  return { total, matched, matchRate };
});
</script>

<template>
  <div class="query-result-view">
    <div class="result-header">
      <button @click="handleBack" class="back-button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        返回
      </button>
      
      <div class="result-title">
        <h1>查询结果</h1>
        <p>{{ querySession.config.name }}</p>
      </div>
      
      <button @click="handleExport" class="export-button" :disabled="exporting">
        <svg v-if="!exporting" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        <svg v-else class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
        </svg>
        {{ exporting ? '导出中...' : '导出结果' }}
      </button>
    </div>

    <!-- 统计概览 -->
    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ stats.total }}</span>
          <span class="stat-label">总数据行</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon success">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ stats.matched }}</span>
          <span class="stat-label">匹配行</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="20" x2="12" y2="10"/>
            <line x1="18" y1="20" x2="18" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="16"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ stats.matchRate }}%</span>
          <span class="stat-label">匹配率</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ formatDate(querySession.executedAt) }}</span>
          <span class="stat-label">查询时间</span>
        </div>
      </div>
    </div>

    <!-- 查询条件 -->
    <div class="query-conditions">
      <h3>查询条件</h3>
      <div class="conditions-tags">
        <span 
          v-for="(condition, index) in querySession.config.conditions" 
          :key="index"
          class="condition-tag"
        >
          {{ condition.column_name }} {{ condition.operator === 'not_empty' ? '不为空' : `= "${querySession.parameters[condition.column_name] || condition.value}"` }}
        </span>
      </div>
    </div>

    <!-- 结果表格 -->
    <div class="result-table-container">
      <div v-if="querySession.results.length === 0" class="empty-results">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <h3>未找到匹配结果</h3>
        <p>请尝试调整查询条件</p>
      </div>
      
      <div v-else class="result-table">
        <table>
          <thead>
            <tr>
              <th class="row-number">#</th>
              <th 
                v-for="header in headers" 
                :key="header"
                @click="handleSort(header)"
                :class="{ sorted: sortColumn === header }"
              >
                {{ header }}
                <svg v-if="sortColumn === header" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline v-if="sortOrder === 'asc'" points="18 15 12 9 6 15"/>
                  <polyline v-else points="6 9 12 15 18 9"/>
                </svg>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="result in paginatedResults" :key="result.rowIndex">
              <td class="row-number">{{ result.rowIndex }}</td>
              <td v-for="header in headers" :key="header">
                {{ result.data[header] }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="totalPages > 1" class="pagination">
      <button 
        @click="prevPage" 
        :disabled="currentPage === 1"
        class="page-button"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        上一页
      </button>
      
      <div class="page-info">
        <span>第 {{ currentPage }} 页，共 {{ totalPages }} 页</span>
        <span class="page-stats">显示 {{ paginatedResults.length }} 条，共 {{ querySession.results.length }} 条</span>
      </div>
      
      <button 
        @click="nextPage" 
        :disabled="currentPage === totalPages"
        class="page-button"
      >
        下一页
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </div>

    <!-- 导出加载弹窗 -->
    <div v-if="exporting" class="export-overlay">
      <div class="export-modal">
        <div class="export-spinner-container">
          <svg class="export-spinner" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" stroke-dasharray="62.83" stroke-dashoffset="15.71" stroke-linecap="round"/>
          </svg>
        </div>
        <h3>正在导出</h3>
        <p>正在生成导出文件，请稍候...</p>
        <div class="export-progress-bar">
          <div class="export-progress-fill"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.query-result-view {
  padding: var(--spacing-xl);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

.result-title {
  flex: 1;
  margin-left: var(--spacing-lg);
}

.result-title h1 {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--on-surface);
  font-family: var(--font-headline);
  margin-bottom: var(--spacing-xs);
}

.result-title p {
  font-size: var(--text-sm);
  color: var(--on-surface-variant);
}

.export-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--primary);
  color: var(--on-primary);
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.export-button:hover:not(:disabled) {
  background: var(--primary-container);
  transform: translateY(-1px);
}

.export-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 导出加载弹窗 */
.export-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.export-modal {
  background: var(--surface-container-lowest);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  min-width: 320px;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

.export-spinner-container {
  margin-bottom: var(--spacing-lg);
}

.export-spinner {
  animation: spin 1s linear infinite;
  color: var(--primary);
}

.export-modal h3 {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--on-surface);
  margin-bottom: var(--spacing-sm);
  font-family: var(--font-headline);
}

.export-modal p {
  font-size: var(--text-sm);
  color: var(--on-surface-variant);
  margin-bottom: var(--spacing-lg);
}

.export-progress-bar {
  width: 100%;
  height: 4px;
  background: var(--surface-container);
  border-radius: 2px;
  overflow: hidden;
}

.export-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary) 0%, var(--primary-container) 100%);
  border-radius: 2px;
  animation: progress 1.3s ease-in-out infinite;
}

@keyframes progress {
  0% { width: 0%; margin-left: 0; }
  50% { width: 70%; margin-left: 15%; }
  100% { width: 0%; margin-left: 100%; }
}

/* 统计概览 */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.stat-card {
  background: var(--surface-container-lowest);
  padding: var(--spacing-lg);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow);
  border: 1px solid var(--outline-variant);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba(0, 72, 141, 0.1) 0%, rgba(0, 95, 184, 0.1) 100%);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
}

.stat-icon.success {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%);
  color: #059669;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: 800;
  color: var(--on-surface);
  font-family: var(--font-headline);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--on-surface-variant);
}

/* 查询条件 */
.query-conditions {
  background: var(--surface-container);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  border: 1px solid var(--outline-variant);
}

.query-conditions h3 {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--on-surface);
  margin-bottom: var(--spacing-md);
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

/* 结果表格 */
.result-table-container {
  background: var(--surface-container-lowest);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow);
  border: 1px solid var(--outline-variant);
  margin-bottom: var(--spacing-xl);
  overflow: hidden;
}

.empty-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  text-align: center;
}

.empty-results svg {
  color: var(--on-surface-variant);
  margin-bottom: var(--spacing-lg);
  opacity: 0.5;
}

.empty-results h3 {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--on-surface);
  margin-bottom: var(--spacing-sm);
}

.empty-results p {
  font-size: var(--text-sm);
  color: var(--on-surface-variant);
}

.result-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: var(--surface-container);
}

th {
  padding: var(--spacing-md);
  text-align: left;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--on-surface);
  border-bottom: 1px solid var(--outline-variant);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

th:hover {
  background: var(--surface-container-high);
}

th.sorted {
  background: var(--primary);
  color: var(--on-primary);
}

th svg {
  margin-left: var(--spacing-xs);
  vertical-align: middle;
}

.row-number {
  width: 60px;
  text-align: center;
  color: var(--on-surface-variant);
  font-weight: 500;
}

td {
  padding: var(--spacing-md);
  font-size: var(--text-sm);
  color: var(--on-surface);
  border-bottom: 1px solid var(--outline-variant);
  white-space: nowrap;
}

tr:hover td {
  background: var(--surface-container);
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  background: var(--surface-container-lowest);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow);
  border: 1px solid var(--outline-variant);
}

.page-button {
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

.page-button:hover:not(:disabled) {
  background: var(--surface-container-high);
  border-color: var(--primary);
}

.page-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}

.page-info span {
  font-size: var(--text-sm);
  color: var(--on-surface);
}

.page-stats {
  font-size: var(--text-xs) !important;
  color: var(--on-surface-variant) !important;
}

/* 响应式 */
@media (max-width: 768px) {
  .result-header {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .result-title {
    margin-left: 0;
  }
  
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .pagination {
    flex-direction: column;
    gap: var(--spacing-md);
  }
}
</style>