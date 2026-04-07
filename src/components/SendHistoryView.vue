<script setup>
import { ref, computed, onMounted } from 'vue';
import { formatDate } from '../utils/formatters';

const props = defineProps({
  sendHistory: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['retry-failed', 'delete-history', 'clear-history', 'resend-history']);

const selectedHistory = ref(null);
const showDetailModal = ref(false);

// 计算统计信息
const totalStats = computed(() => {
  const total = props.sendHistory.length;
  const totalMessages = props.sendHistory.reduce((sum, item) => sum + item.messageCount, 0);
  const totalSuccess = props.sendHistory.reduce((sum, item) => sum + item.stats.success, 0);
  const totalFailed = props.sendHistory.reduce((sum, item) => sum + item.stats.failed, 0);
  
  return {
    total,
    totalMessages,
    totalSuccess,
    totalFailed,
    successRate: totalMessages > 0 ? Math.round((totalSuccess / totalMessages) * 100) : 0
  };
});

function handleViewDetail(item) {
  selectedHistory.value = item;
  showDetailModal.value = true;
}

function handleCloseDetail() {
  showDetailModal.value = false;
  selectedHistory.value = null;
}

function handleRetryFailed(item) {
  emit('retry-failed', item);
}

function handleResendHistory(item) {
  emit('resend-history', item);
}

function handleDeleteHistory(id) {
  emit('delete-history', id);
}

function handleClearHistory() {
  if (confirm('确定要清空所有发送历史吗？')) {
    emit('clear-history');
  }
}

function getStatusClass(success) {
  return success ? 'status-success' : 'status-failed';
}

function getStatusText(success) {
  return success ? '成功' : '失败';
}
</script>

<template>
  <div class="send-history-view">
    <div class="page-header">
      <div>
        <h1 class="page-title">发送历史记录</h1>
        <p class="page-subtitle">查看邮件发送历史，支持重发失败消息</p>
      </div>
      <div class="header-actions">
        <button 
          v-if="sendHistory.length > 0"
          @click="handleClearHistory"
          class="secondary-button danger-button"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          清空历史
        </button>
      </div>
    </div>

    <!-- 统计概览 -->
    <div v-if="sendHistory.length > 0" class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ totalStats.total }}</span>
          <span class="stat-label">发送批次</span>
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
          <span class="stat-value">{{ totalStats.totalSuccess }}</span>
          <span class="stat-label">发送成功</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon error">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ totalStats.totalFailed }}</span>
          <span class="stat-label">发送失败</span>
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
          <span class="stat-value">{{ totalStats.successRate }}%</span>
          <span class="stat-label">成功率</span>
        </div>
      </div>
    </div>

    <!-- 历史记录列表 -->
    <div v-if="sendHistory.length === 0" class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
      <h3>暂无发送历史</h3>
      <p>发送消息后，历史记录将显示在这里</p>
    </div>

    <div v-else class="history-list">
      <div 
        v-for="item in sendHistory" 
        :key="item.id" 
        class="history-card"
      >
        <div class="history-header">
          <div class="history-info">
            <span class="history-time">{{ formatDate(item.timestamp) }}</span>
            <span class="history-count">{{ item.messageCount }} 条消息</span>
          </div>
          <div class="history-stats">
            <span class="stat-badge success">{{ item.stats.success }} 成功</span>
            <span v-if="item.stats.failed > 0" class="stat-badge error">{{ item.stats.failed }} 失败</span>
          </div>
        </div>
        
        <div class="history-body">
          <div class="progress-bar">
            <div 
              class="progress-fill success" 
              :style="{ width: `${item.stats.successRate}%` }"
            ></div>
          </div>
          <span class="success-rate">成功率: {{ item.stats.successRate }}%</span>
        </div>
        
        <div class="history-actions">
          <button 
            @click="handleViewDetail(item)"
            class="action-button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            查看详情
          </button>
          
          <button 
            v-if="item.stats.failed > 0"
            @click="handleRetryFailed(item)"
            class="action-button retry-button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            重发失败
          </button>
          
          <button 
            @click="handleResendHistory(item)"
            class="action-button resend-button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            重新发送
          </button>
          
          <button 
            @click="handleDeleteHistory(item.id)"
            class="action-button delete-button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            删除
          </button>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <div v-if="showDetailModal" class="modal-overlay" @click="handleCloseDetail">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>发送详情</h3>
          <button @click="handleCloseDetail" class="close-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="detail-stats">
            <div class="detail-stat">
              <span class="detail-label">发送时间</span>
              <span class="detail-value">{{ formatDate(selectedHistory.timestamp) }}</span>
            </div>
            <div class="detail-stat">
              <span class="detail-label">总消息数</span>
              <span class="detail-value">{{ selectedHistory.messageCount }}</span>
            </div>
            <div class="detail-stat">
              <span class="detail-label">成功数</span>
              <span class="detail-value success">{{ selectedHistory.stats.success }}</span>
            </div>
            <div class="detail-stat">
              <span class="detail-label">失败数</span>
              <span class="detail-value error">{{ selectedHistory.stats.failed }}</span>
            </div>
          </div>
          
          <div class="results-list">
            <h4>发送结果</h4>
            <div 
              v-for="result in selectedHistory.results" 
              :key="result.index"
              class="result-item"
            >
              <div class="result-info">
                <span class="contact">{{ result.contact }}</span>
                <span :class="['status', getStatusClass(result.success)]">
                  {{ getStatusText(result.success) }}
                </span>
              </div>
              <div v-if="result.error" class="result-error">
                {{ result.error }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.send-history-view {
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

.secondary-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--surface-container-lowest);
  color: var(--on-surface-variant);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.secondary-button:hover {
  background: var(--surface-container);
  color: var(--on-surface);
}

.danger-button:hover {
  background: var(--error-container);
  color: var(--on-error-container);
  border-color: var(--error);
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

.stat-icon.error {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
  color: #dc2626;
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

/* 历史记录列表 */
.history-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.history-card {
  background: var(--surface-container-lowest);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow);
  border: 1px solid var(--outline-variant);
  transition: all 0.2s ease;
}

.history-card:hover {
  box-shadow: var(--shadow-lg);
  border-color: var(--primary);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.history-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.history-time {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--on-surface);
}

.history-count {
  font-size: var(--text-xs);
  color: var(--on-surface-variant);
}

.history-stats {
  display: flex;
  gap: var(--spacing-sm);
}

.stat-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: 600;
}

.stat-badge.success {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.stat-badge.error {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.history-body {
  margin-bottom: var(--spacing-md);
}

.progress-bar {
  height: 6px;
  background: var(--surface-container);
  border-radius: var(--radius-sm);
  overflow: hidden;
  margin-bottom: var(--spacing-xs);
}

.progress-fill {
  height: 100%;
  border-radius: var(--radius-sm);
  transition: width 0.3s ease;
}

.progress-fill.success {
  background: linear-gradient(90deg, #059669, #10b981);
}

.success-rate {
  font-size: var(--text-xs);
  color: var(--on-surface-variant);
}

.history-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
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

.retry-button:hover {
  background: rgba(16, 185, 129, 0.1);
  border-color: #059669;
  color: #059669;
}

.delete-button:hover {
  background: var(--error-container);
  border-color: var(--error);
  color: var(--on-error-container);
}

/* 弹窗样式 */
.modal-overlay {
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
}

.modal-content {
  background: var(--surface-container-lowest);
  border-radius: var(--radius-xl);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--outline-variant);
}

.modal-header h3 {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--on-surface);
}

.close-button {
  padding: var(--spacing-xs);
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--on-surface-variant);
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: var(--surface-container);
  color: var(--on-surface);
}

.modal-body {
  padding: var(--spacing-lg);
  max-height: 60vh;
  overflow-y: auto;
}

.detail-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.detail-stat {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.detail-label {
  font-size: var(--text-sm);
  color: var(--on-surface-variant);
}

.detail-value {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--on-surface);
}

.detail-value.success {
  color: #059669;
}

.detail-value.error {
  color: #dc2626;
}

.results-list h4 {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--on-surface);
  margin-bottom: var(--spacing-md);
}

.result-item {
  padding: var(--spacing-md);
  background: var(--surface-container);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-sm);
}

.result-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xs);
}

.contact {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--on-surface);
}

.status {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: 600;
}

.status-success {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.status-failed {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.result-error {
  font-size: var(--text-xs);
  color: var(--error);
  margin-top: var(--spacing-xs);
}

/* 响应式 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
  
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .history-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .history-actions {
    flex-direction: column;
  }
  
  .detail-stats {
    grid-template-columns: 1fr;
  }
}
</style>