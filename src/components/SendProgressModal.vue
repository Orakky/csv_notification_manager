<script setup>
import { computed } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  sending: {
    type: Boolean,
    default: false
  },
  progress: {
    type: Number,
    default: 0
  },
  results: {
    type: Array,
    default: () => []
  },
  error: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close', 'retry']);

const stats = computed(() => {
  const total = props.results.length;
  const success = props.results.filter(r => r.success).length;
  const failed = total - success;
  return { total, success, failed };
});

function handleClose() {
  emit('close');
}

function handleRetry() {
  emit('retry');
}
</script>

<template>
  <div v-if="visible" class="modal-overlay" @click.self="handleClose">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">消息发送进度</h3>
        <button @click="handleClose" class="modal-close" :disabled="sending">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      
      <div class="modal-body">
        <!-- Progress Bar -->
        <div class="progress-section">
          <div class="progress-header">
            <span class="progress-label">发送进度</span>
            <span class="progress-value">{{ progress }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progress + '%' }"></div>
          </div>
          <div class="progress-stats">
            <span v-if="sending" class="sending-status">
              <svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
              </svg>
              正在发送...
            </span>
            <span v-else-if="error" class="error-status">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              发送失败
            </span>
            <span v-else class="complete-status">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              发送完成
            </span>
          </div>
        </div>

        <!-- Statistics -->
        <div class="stats-section">
          <div class="stat-item">
            <span class="stat-value">{{ stats.total }}</span>
            <span class="stat-label">总计</span>
          </div>
          <div class="stat-item success">
            <span class="stat-value">{{ stats.success }}</span>
            <span class="stat-label">成功</span>
          </div>
          <div class="stat-item error">
            <span class="stat-value">{{ stats.failed }}</span>
            <span class="stat-label">失败</span>
          </div>
        </div>

        <!-- Results List -->
        <div v-if="results.length > 0" class="results-section">
          <h4 class="results-title">发送详情</h4>
          <div class="results-list">
            <div 
              v-for="result in results.slice(0, 10)" 
              :key="result.index" 
              :class="['result-item', { success: result.success, error: !result.success }]"
            >
              <div class="result-icon">
                <svg v-if="result.success" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </div>
              <div class="result-info">
                <span class="result-contact">{{ result.contact }}</span>
                <span class="result-status">{{ result.success ? '发送成功' : result.error }}</span>
              </div>
            </div>
          </div>
          <div v-if="results.length > 10" class="results-more">
            还有 {{ results.length - 10 }} 条记录...
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="handleClose" class="secondary-button" :disabled="sending">
          关闭
        </button>
        <button 
          v-if="!sending && stats.failed > 0"
          @click="handleRetry" 
          class="primary-button"
        >
          重发失败消息 ({{ stats.failed }})
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--surface-container-lowest);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--outline-variant);
}

.modal-title {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--on-surface);
  font-family: var(--font-headline);
}

.modal-close {
  padding: var(--spacing-sm);
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--on-surface-variant);
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close:hover:not(:disabled) {
  background: var(--surface-container);
  color: var(--on-surface);
}

.modal-close:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-body {
  padding: var(--spacing-lg);
}

/* Progress Section */
.progress-section {
  margin-bottom: var(--spacing-lg);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.progress-label {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--on-surface);
}

.progress-value {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--primary);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--surface-container);
  border-radius: var(--radius-sm);
  overflow: hidden;
  margin-bottom: var(--spacing-sm);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary) 0%, var(--primary-container) 100%);
  border-radius: var(--radius-sm);
  transition: width 0.3s ease;
}

.progress-stats {
  display: flex;
  justify-content: center;
}

.sending-status,
.error-status,
.complete-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--text-sm);
  font-weight: 500;
}

.sending-status {
  color: var(--primary);
}

.error-status {
  color: var(--error);
}

.complete-status {
  color: #059669;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.spinner {
  animation: spin 1s linear infinite;
}

/* Statistics Section */
.stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.stat-item {
  text-align: center;
  padding: var(--spacing-md);
  background: var(--surface-container);
  border-radius: var(--radius-md);
}

.stat-item.success {
  background: rgba(16, 185, 129, 0.1);
}

.stat-item.error {
  background: rgba(255, 59, 48, 0.1);
}

.stat-value {
  display: block;
  font-size: var(--text-xl);
  font-weight: 800;
  color: var(--on-surface);
  font-family: var(--font-headline);
}

.stat-label {
  display: block;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--on-surface-variant);
  text-transform: uppercase;
  margin-top: var(--spacing-xs);
}

/* Results Section */
.results-section {
  margin-top: var(--spacing-lg);
}

.results-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--on-surface);
  margin-bottom: var(--spacing-md);
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  max-height: 200px;
  overflow-y: auto;
}

.result-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  background: var(--surface-container);
}

.result-item.success {
  background: rgba(16, 185, 129, 0.05);
  border-left: 3px solid #059669;
}

.result-item.error {
  background: rgba(255, 59, 48, 0.05);
  border-left: 3px solid var(--error);
}

.result-icon {
  flex-shrink: 0;
}

.result-icon svg {
  width: 16px;
  height: 16px;
}

.result-item.success .result-icon svg {
  color: #059669;
}

.result-item.error .result-icon svg {
  color: var(--error);
}

.result-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.result-contact {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--on-surface);
}

.result-status {
  font-size: var(--text-xs);
  color: var(--on-surface-variant);
}

.result-item.error .result-status {
  color: var(--error);
}

.results-more {
  text-align: center;
  font-size: var(--text-sm);
  color: var(--on-surface-variant);
  padding: var(--spacing-sm);
}

/* Modal Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
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

.secondary-button:hover:not(:disabled) {
  background: var(--surface-container);
  color: var(--on-surface);
}

.secondary-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>