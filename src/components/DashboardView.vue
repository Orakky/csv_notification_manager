<script setup>
import { computed } from 'vue';
import { formatNumber, formatDate } from '../utils/formatters';

const props = defineProps({
  fileHistory: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['select-file', 'view-history', 'navigate']);

// 计算属性
const totalFiles = computed(() => props.fileHistory.length);

const totalRows = computed(() => {
  return props.fileHistory.reduce((sum, item) => sum + item.rowCount, 0);
});

const totalContacts = computed(() => {
  return props.fileHistory.reduce((sum, item) => {
    return sum + item.contactColumns.reduce((colSum, col) => colSum + item.rowCount, 0);
  }, 0);
});

function handleSelectFile() {
  emit('select-file');
}

function handleViewHistory(item) {
  emit('view-history', item);
}

function handleNavigate(view) {
  emit('navigate', view);
}
</script>

<template>
  <div class="dashboard-view">
    <div class="page-header">
      <div>
        <h1 class="page-title">Architectural Overview</h1>
        <p class="page-subtitle">Monitor your data ingestion pipelines and extraction performance metrics.</p>
      </div>
      <button @click="handleSelectFile" :disabled="loading" class="primary-button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        {{ loading ? 'Importing...' : 'New Data Import' }}
      </button>
    </div>

    <!-- Quick Stats -->
    <div class="quick-stats">
      <div class="stat-item">
        <div class="stat-icon primary">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">Files Imported</p>
          <h3 class="stat-value">{{ formatNumber(totalFiles) }}</h3>
        </div>
      </div>
      
      <div class="stat-item">
        <div class="stat-icon tertiary">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
          </svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">Contacts Found</p>
          <h3 class="stat-value">{{ formatNumber(totalContacts) }}</h3>
        </div>
      </div>
    </div>

    <!-- Recent Data Imports -->
    <div class="content-grid">
      <div class="recent-imports">
        <div class="section-header">
          <h2 class="section-title">Recent Data Imports</h2>
          <button @click="handleNavigate('history')" class="link-button">
            View All History
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>
        
        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Filename</th>
                <th>Import Date</th>
                <th>Rows</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in fileHistory.slice(0, 5)" :key="item.id" @click="handleViewHistory(item)" class="table-row">
                <td class="filename">{{ item.fileName }}</td>
                <td class="date">{{ formatDate(item.timestamp) }}</td>
                <td class="rows">{{ formatNumber(item.rowCount) }}</td>
                <td>
                  <span class="status-badge success">Successful</span>
                </td>
                <td>
                  <button class="action-button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="1"/>
                      <circle cx="19" cy="12" r="1"/>
                      <circle cx="5" cy="12" r="1"/>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Sidebar Content -->
      <div class="dashboard-sidebar">
        <!-- Recent Files Summary -->
        <div class="sidebar-card">
          <h3 class="card-title">Recent Activity</h3>
          <div class="recent-summary">
            <div class="summary-item">
              <span class="summary-label">Last Import</span>
              <span class="summary-value">{{ fileHistory.length > 0 ? formatDate(fileHistory[0].timestamp) : 'Never' }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Total Contacts</span>
              <span class="summary-value">{{ formatNumber(totalContacts) }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Total Rows</span>
              <span class="summary-value">{{ formatNumber(totalRows) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-view {
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

.primary-button:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.primary-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.stat-card {
  background: var(--surface-container-lowest);
  padding: var(--spacing-lg);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow);
  border: 1px solid var(--outline-variant);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.primary {
  background: rgba(0, 72, 141, 0.1);
  color: var(--primary);
}

.stat-icon.tertiary {
  background: rgba(0, 77, 112, 0.1);
  color: var(--tertiary);
}

.stat-icon.secondary {
  background: rgba(81, 95, 116, 0.1);
  color: var(--secondary);
}

.stat-badge {
  font-size: var(--text-xs);
  font-weight: 700;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  background: var(--surface-container);
  color: var(--on-surface-variant);
}

.stat-badge.success {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.stat-badge.warning {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.stat-label {
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--on-surface-variant);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: var(--spacing-xs);
}

.stat-value {
  font-size: var(--text-3xl);
  font-weight: 800;
  color: var(--on-surface);
  font-family: var(--font-headline);
  margin-bottom: var(--spacing-md);
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--text-xs);
  font-weight: 700;
}

.stat-trend.positive {
  color: #059669;
}

.stat-trend.neutral {
  color: var(--on-surface-variant);
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.stat-item {
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
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon.primary {
  background: rgba(0, 72, 141, 0.1);
  color: var(--primary);
}

.stat-icon.tertiary {
  background: rgba(0, 77, 112, 0.1);
  color: var(--tertiary);
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--on-surface-variant);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: var(--spacing-xs);
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: 800;
  color: var(--on-surface);
  font-family: var(--font-headline);
}

.recent-summary {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--outline-variant);
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-label {
  font-size: var(--text-sm);
  color: var(--on-surface-variant);
}

.summary-value {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--on-surface);
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-xl);
}

.recent-imports {
  background: var(--surface-container-lowest);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  background: var(--surface-container-low);
  border-bottom: 1px solid var(--outline-variant);
}

.section-title {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--on-surface);
  font-family: var(--font-headline);
}

.link-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: transparent;
  border: none;
  color: var(--primary);
  font-size: var(--text-sm);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.link-button:hover {
  text-decoration: underline;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  padding: var(--spacing-md) var(--spacing-lg);
  text-align: left;
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--on-surface-variant);
  text-transform: uppercase;
  letter-spacing: 1px;
  background: var(--surface-container-low);
  border-bottom: 1px solid var(--outline-variant);
}

.data-table td {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--text-base);
  color: var(--on-surface);
  border-bottom: 1px solid rgba(194, 198, 212, 0.1);
}

.table-row {
  cursor: pointer;
  transition: all 0.2s ease;
}

.table-row:hover {
  background: var(--surface-container-high);
}

.filename {
  font-weight: 600;
}

.date {
  color: var(--on-surface-variant);
  font-size: var(--text-sm);
}

.rows {
  font-family: monospace;
  font-size: var(--text-sm);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-lg);
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
}

.status-badge.success {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.action-button {
  padding: var(--spacing-xs);
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--on-surface-variant);
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover {
  background: var(--surface-container);
  color: var(--on-surface);
}

.dashboard-sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.sidebar-card {
  background: var(--surface-container-lowest);
  padding: var(--spacing-lg);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow);
  border: 1px solid var(--outline-variant);
}

.card-title {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--on-surface);
  font-family: var(--font-headline);
  margin-bottom: var(--spacing-lg);
}

.chart-container {
  display: flex;
  justify-content: center;
  margin-bottom: var(--spacing-lg);
}

.donut-chart {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: conic-gradient(
    var(--primary) 0deg 234deg,
    var(--tertiary) 234deg 324deg,
    var(--secondary) 324deg 360deg
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.donut-chart::before {
  content: '';
  position: absolute;
  width: 100px;
  height: 100px;
  background: var(--surface-container-lowest);
  border-radius: 50%;
}

.chart-center {
  position: relative;
  z-index: 1;
  text-align: center;
}

.chart-label {
  font-size: var(--text-xs);
  color: var(--on-surface-variant);
  font-weight: 700;
  text-transform: uppercase;
}

.chart-value {
  font-size: var(--text-xl);
  font-weight: 800;
  color: var(--on-surface);
  font-family: var(--font-headline);
}

.chart-legend {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-dot.primary {
  background: var(--primary);
}

.legend-dot.tertiary {
  background: var(--tertiary);
}

.legend-dot.secondary {
  background: var(--secondary);
}

.legend-text {
  flex: 1;
  font-size: var(--text-sm);
  color: var(--on-surface-variant);
}

.legend-value {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--on-surface);
}

.system-status {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.status-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--surface-container-lowest);
  border-radius: var(--radius-lg);
  border: 1px solid var(--outline-variant);
}

.status-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-icon.success {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.status-icon.primary {
  background: rgba(0, 72, 141, 0.1);
  color: var(--primary);
}

.status-icon.secondary {
  background: rgba(81, 95, 116, 0.1);
  color: var(--secondary);
}

.status-info {
  flex: 1;
}

.status-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--on-surface-variant);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.status-value {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--on-surface);
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-indicator.success {
  background: #059669;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
}

.progress-bar {
  width: 48px;
  height: 6px;
  background: var(--surface-container);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary);
  border-radius: var(--radius-sm);
}
</style>