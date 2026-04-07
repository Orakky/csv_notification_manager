<script setup>
import { ref, computed, onMounted } from 'vue';
import { formatNumber } from '../utils/formatters';
import { getCellImage } from '../utils';
import { useMessageTemplates } from '../composables/useMessageTemplates';
import { useAddressHistory } from '../composables/useAddressHistory';

const props = defineProps({
  fileData: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  selectedContactColumn: {
    type: Object,
    default: null
  },
  selectedContentColumns: {
    type: Array,
    default: () => []
  },
  messageTemplate: {
    type: String,
    default: ''
  },
  generatedMessages: {
    type: Array,
    default: () => []
  },
  addressSourceType: {
    type: String,
    default: 'excel'
  },
  customAddresses: {
    type: Array,
    default: () => []
  }
});

const { activeTemplates, loadTemplates } = useMessageTemplates();
const { 
  addressHistory, 
  loadAddressHistory, 
  addToAddressHistory, 
  getRecentAddresses,
  getFrequentAddresses
} = useAddressHistory();

const emit = defineEmits([
  'select-file',
  'update-contact-column',
  'update-content-columns',
  'update-template',
  'generate-messages',
  'send-messages',
  'navigate',
  'update-address-source-type',
  'update-custom-addresses'
]);

const recentAddresses = ref([]);
const frequentAddresses = ref([]);
const showAddressHistory = ref(true);

onMounted(() => {
  loadTemplates();
  loadAddressHistory();
  updateAddressLists();
});

function updateAddressLists() {
  recentAddresses.value = getRecentAddresses(8);
  frequentAddresses.value = getFrequentAddresses(8);
}

function handleSelectFile() {
  emit('select-file');
}

function handleContactColumnChange(event) {
  const col = props.fileData?.contact_columns.find(c => c.index === parseInt(event.target.value));
  emit('update-contact-column', col);
}

function handleContentColumnChange(index, checked) {
  const newColumns = checked 
    ? [...props.selectedContentColumns, index]
    : props.selectedContentColumns.filter(i => i !== index);
  emit('update-content-columns', newColumns);
}

function handleTemplateChange(event) {
  emit('update-template', event.target.value);
}

function handleGenerateMessages() {
  emit('generate-messages');
}

function handleSendMessages() {
  emit('send-messages');
}

function handleNavigate(view) {
  emit('navigate', view);
}

function handleAddressSourceTypeChange(type) {
  emit('update-address-source-type', type);
}

function handleCustomAddressesChange(event) {
  const text = event.target.value;
  // 按行分割，过滤空行，去除空格
  const addresses = text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  emit('update-custom-addresses', addresses);
}

// 添加单个地址到输入框
function addSingleAddress(address) {
  if (!props.customAddresses.includes(address)) {
    const newAddresses = [...props.customAddresses, address];
    emit('update-custom-addresses', newAddresses);
  }
}

// 一键导入全部历史地址
function importAllAddresses() {
  const allAddresses = addressHistory.value.map(item => item.address);
  const mergedAddresses = [...new Set([...props.customAddresses, ...allAddresses])];
  emit('update-custom-addresses', mergedAddresses);
}


const canGenerate = computed(() => {
  if (!props.fileData || !props.messageTemplate) {
    return false;
  }
  
  if (props.addressSourceType === 'excel') {
    return !!props.selectedContactColumn;
  } else {
    return props.customAddresses.length > 0;
  }
});
</script>

<template>
  <div class="import-view">
    <div class="page-header">
      <div>
        <h1 class="page-title">Data Import & Parsing</h1>
        <p class="page-subtitle">Ingest, validate, and extract identifiers from architectural datasets.</p>
      </div>
      <div class="header-actions">
        <button class="secondary-button" @click="handleNavigate('history')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export Logs
        </button>
        <button class="primary-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
          Map Columns
        </button>
      </div>
    </div>

    <!-- Drop Zone -->
    <div class="upload-section">
      <div @click="handleSelectFile" :disabled="loading" :class="['drop-zone', { 'loading': loading }]">
        <div class="drop-icon">
          <div v-if="loading" class="loading-spinner">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <div class="spinner-overlay">
              <div class="spinner"></div>
            </div>
          </div>
          <svg v-else width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <h3 class="drop-title">{{ loading ? '正在解析文件...' : 'Drop your data files here' }}</h3>
        <p class="drop-subtitle">{{ loading ? '请稍候，正在处理您的数据' : 'Supports Excel (.xlsx) and CSV datasets up to 50MB' }}</p>
        <div v-if="!loading" class="drop-features">
          <span class="feature">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            Auto-detect
          </span>
          <span class="feature">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            Regex Validation
          </span>
          <span class="feature">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            De-duplication
          </span>
        </div>
      </div>
    </div>

    <!-- Data Preview -->
    <div v-if="fileData" class="data-preview-section">
      <div class="section-header">
        <h3 class="section-title">Data Preview</h3>
        <span class="preview-info">共 {{ formatNumber(fileData.rows.length + 1) }} 行数据</span>
      </div>
      
      <div class="data-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th class="row-number">#</th>
              <th v-for="(header, index) in fileData.headers" :key="index">
                {{ header }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rowIndex) in fileData.rows.slice(0, 50)" :key="rowIndex">
              <td class="row-number">{{ rowIndex + 1 }}</td>
              <td v-for="(cell, cellIndex) in row" :key="cellIndex">
                <div class="cell-content">
                  <img 
                    v-if="getCellImage(fileData, rowIndex, cellIndex)"
                    :src="getCellImage(fileData, rowIndex, cellIndex)"
                    class="cell-image"
                    :alt="`图片 ${cellIndex + 1}`"
                  />
                  <span v-if="cell">{{ cell || '-' }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="fileData.rows.length > 50" class="preview-more">
          还有 {{ formatNumber(fileData.rows.length - 50) }} 行数据未显示...
        </div>
      </div>
    </div>

    <!-- Configuration Section -->
    <div v-if="fileData" class="config-section">
      <div class="config-grid">
        <!-- Address Source Type Selector -->
        <div class="config-card address-source-card">
          <h4 class="config-title">接收消息地址来源</h4>
          <div class="address-source-selector">
            <label 
              :class="['source-option', { active: addressSourceType === 'excel' }]"
            >
              <input 
                type="radio" 
                name="addressSource" 
                value="excel"
                :checked="addressSourceType === 'excel'"
                @change="handleAddressSourceTypeChange('excel')"
              />
              <div class="source-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <div class="source-content">
                <span class="source-title">从Excel提取</span>
                <span class="source-desc">使用Excel文件中的联系方式列</span>
              </div>
            </label>
            
            <label 
              :class="['source-option', { active: addressSourceType === 'custom' }]"
            >
              <input 
                type="radio" 
                name="addressSource" 
                value="custom"
                :checked="addressSourceType === 'custom'"
                @change="handleAddressSourceTypeChange('custom')"
              />
              <div class="source-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
              <div class="source-content">
                <span class="source-title">自定义地址</span>
                <span class="source-desc">手动输入接收消息的地址</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Contact Column Selector (for Excel source) -->
        <div v-if="addressSourceType === 'excel'" class="config-card">
          <h4 class="config-title">选择联系方式列</h4>
          <select 
            :value="selectedContactColumn?.index" 
            @change="handleContactColumnChange"
            class="config-select"
          >
            <option value="">请选择...</option>
            <option v-for="col in fileData.contact_columns" :key="col.index" :value="col.index">
              {{ col.name }} ({{ col.contact_type }})
            </option>
          </select>
        </div>

        <!-- Custom Address Input (for custom source) -->
        <div v-if="addressSourceType === 'custom'" class="config-card custom-address-card">
          <h4 class="config-title">自定义地址列表</h4>
          
          <!-- Address History Section -->
          <div v-if="addressHistory.length > 0" class="address-history-section">
            <div class="history-header" @click="showAddressHistory = !showAddressHistory">
              <span class="history-title">📋 历史地址</span>
              <svg class="history-toggle-icon" 
                   :class="{ 'rotated': showAddressHistory }"
                   width="16" height="16" viewBox="0 0 24 24" 
                   fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
            
            <div v-show="showAddressHistory" class="history-content">
              <div v-if="frequentAddresses.length > 0" class="history-group">
                <span class="history-group-title">常用地址</span>
                <div class="history-tags">
                  <button 
                    v-for="item in frequentAddresses" 
                    :key="item.id"
                    @click="addSingleAddress(item.address)"
                    class="history-tag"
                    :title="`使用次数: ${item.usedCount}`"
                  >
                    {{ item.address }}
                    <span class="count-badge">{{ item.usedCount }}</span>
                  </button>
                </div>
              </div>
              
              <div v-if="recentAddresses.length > 0" class="history-group">
                <span class="history-group-title">最近使用</span>
                <div class="history-tags">
                  <button 
                    v-for="item in recentAddresses" 
                    :key="item.id"
                    @click="addSingleAddress(item.address)"
                    class="history-tag"
                  >
                    {{ item.address }}
                  </button>
                </div>
              </div>
              
              <div class="history-actions">
                <button class="import-all-button" @click="importAllAddresses">
                  📥 一键导入全部历史地址
                </button>
              </div>
            </div>
          </div>
          
          <textarea 
            :value="customAddresses.join('\n')"
            @input="handleCustomAddressesChange"
            placeholder="请输入接收消息的地址，每行一个&#10;支持邮箱、手机号、QQ号&#10;例如：&#10;example@email.com&#10;13800138000&#10;123456789"
            class="config-textarea custom-address-textarea"
          ></textarea>
          <p class="form-hint">每行输入一个地址，支持邮箱、手机号、QQ号，系统会自动识别类型</p>
        </div>

        <div class="config-card">
          <h4 class="config-title">选择内容列</h4>
          <div class="checkbox-grid">
            <label v-for="(header, index) in fileData.headers" :key="index" class="checkbox-item">
              <input 
                type="checkbox" 
                :checked="selectedContentColumns.includes(index)"
                @change="(e) => handleContentColumnChange(index, e.target.checked)"
              />
              <span class="checkbox-label">{{ header }}</span>
            </label>
          </div>
        </div>

        <div class="config-card">
          <h4 class="config-title">消息模板</h4>
          
          <!-- Template Selector -->
          <div v-if="activeTemplates.length > 0" class="template-selector">
            <label class="form-label">选择预设模板</label>
            <div class="template-chips">
              <button 
                v-for="template in activeTemplates.slice(0, 3)" 
                :key="template.id"
                @click="handleTemplateChange({ target: { value: template.content } })"
                :class="['template-chip', { active: messageTemplate === template.content }]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                {{ template.name }}
              </button>
            </div>
            <button 
              v-if="activeTemplates.length > 3"
              @click="handleNavigate('templates')"
              class="view-all-templates"
            >
              查看全部模板 ({{ activeTemplates.length }})
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>

          <textarea 
            :value="messageTemplate"
            @input="handleTemplateChange"
            placeholder="输入消息模板，使用 {{列名}} 作为占位符"
            class="config-textarea"
          ></textarea>
          <p class="form-hint">使用 {{列名}} 格式作为动态内容占位符，例如：亲爱的 {{name}}，...</p>
          
          <button 
            @click="handleGenerateMessages" 
            :disabled="!canGenerate"
            class="generate-button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            生成消息
          </button>
        </div>
      </div>
    </div>

    <!-- Generated Messages -->
    <div v-if="generatedMessages.length > 0" class="messages-section">
      <div class="section-header">
        <h3 class="section-title">生成的消息 ({{ generatedMessages.length }})</h3>
        <button @click="handleSendMessages" class="send-button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
          批量发送
        </button>
      </div>
      
      <div class="messages-list">
        <div v-for="msg in generatedMessages" :key="msg.index" class="message-card">
          <div class="message-header">
            <span class="contact-badge" :class="msg.contactType">
              {{ msg.contactType }}
            </span>
            <span class="contact-value">{{ msg.contact }}</span>
          </div>
          <div class="message-body">{{ msg.message }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.import-view {
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

.upload-section {
  margin-bottom: var(--spacing-xl);
}

.drop-zone {
  position: relative;
  height: 256px;
  background: var(--surface-container-low);
  border: 2px dashed var(--outline-variant);
  border-radius: var(--radius-xl);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.drop-zone:hover {
  background: var(--surface-container-high);
  border-color: var(--primary);
}

.drop-icon {
  width: 64px;
  height: 64px;
  background: var(--surface-container-lowest);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow-lg);
  transition: all 0.3s ease;
}

.drop-zone:hover .drop-icon {
  transform: scale(1.1);
}

.drop-title {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--on-surface);
  font-family: var(--font-headline);
  margin-bottom: var(--spacing-xs);
}

.drop-subtitle {
  font-size: var(--text-sm);
  color: var(--on-surface-variant);
  margin-bottom: var(--spacing-lg);
}

.drop-features {
  display: flex;
  gap: var(--spacing-lg);
}

.feature {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--outline);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.feature svg {
  color: var(--primary);
}

/* Loading Spinner Styles */
.loading-spinner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  border-radius: var(--radius-xl);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--outline-variant);
  border-top: 3px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.drop-zone.loading {
  pointer-events: none;
  opacity: 0.7;
}

.drop-zone.loading .drop-icon {
  transform: scale(0.95);
}

.data-preview-section {
  margin-bottom: var(--spacing-xl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.section-title {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--on-surface);
  font-family: var(--font-headline);
}

.preview-info {
  font-size: var(--text-sm);
  color: var(--on-surface-variant);
  background: var(--surface-container);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
}

.data-table-container {
  background: var(--surface-container-lowest);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow);
  max-height: 500px;
  overflow-y: auto;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
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
  position: sticky;
  top: 0;
  z-index: 10;
}

.data-table td {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--text-base);
  color: var(--on-surface);
  border-bottom: 1px solid rgba(194, 198, 212, 0.1);
}

.row-number {
  width: 50px;
  text-align: center;
  color: var(--on-surface-variant);
  font-weight: 600;
  font-family: monospace;
  font-size: var(--text-sm);
}

.cell-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.cell-image {
  width: 32px;
  height: 32px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: 1px solid var(--outline-variant);
}

.preview-more {
  padding: var(--spacing-md);
  text-align: center;
  color: var(--on-surface-variant);
  font-size: var(--text-sm);
  background: var(--surface-container);
  border-top: 1px solid var(--outline-variant);
}

.config-section {
  margin-bottom: var(--spacing-xl);
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.config-card {
  background: var(--surface-container-lowest);
  padding: var(--spacing-lg);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow);
  border: 1px solid var(--outline-variant);
}

.config-title {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--on-surface);
  font-family: var(--font-headline);
  margin-bottom: var(--spacing-md);
}

.config-select {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  background: var(--surface-container-low);
  color: var(--on-surface);
  cursor: pointer;
  transition: all 0.2s ease;
}

.config-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0, 72, 141, 0.1);
}

.checkbox-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--surface-container-low);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.checkbox-item:hover {
  background: var(--surface-container);
}

.checkbox-item input {
  width: 16px;
  height: 16px;
  accent-color: var(--primary);
}

.checkbox-label {
  font-size: var(--text-sm);
  color: var(--on-surface);
  font-weight: 500;
}

.config-textarea {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  resize: vertical;
  min-height: 100px;
  background: var(--surface-container-low);
  color: var(--on-surface);
  font-family: inherit;
  margin-bottom: var(--spacing-md);
  transition: all 0.2s ease;
}

.config-textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0, 72, 141, 0.1);
}

.generate-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
}

.generate-button:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.generate-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.messages-section {
  background: var(--surface-container-lowest);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow);
}

.messages-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.send-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--primary);
  color: var(--on-primary);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.send-button:hover {
  background: var(--primary-container);
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  max-height: 400px;
  overflow-y: auto;
}

.message-card {
  padding: var(--spacing-md);
  background: var(--surface-container);
  border-radius: var(--radius-md);
  border: 1px solid var(--outline-variant);
}

.message-header { 
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.contact-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
}

.contact-badge.email {
  background: rgba(0, 72, 141, 0.1);
  color: var(--primary);
}

.contact-badge.phone {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.contact-badge.qq {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.contact-value {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--on-surface);
}

.message-body {
  font-size: var(--text-sm);
  color: var(--on-surface-variant);
  line-height: 1.5;
}

/* Template Selector Styles */
.template-selector {
  margin-bottom: var(--spacing-lg);
}

.form-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--on-surface);
  margin-bottom: var(--spacing-sm);
}

.template-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.template-chip {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--surface-container);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--on-surface);
  cursor: pointer;
  transition: all 0.2s ease;
}

.template-chip:hover {
  background: var(--surface-container-high);
  border-color: var(--primary);
}

.template-chip.active {
  background: rgba(0, 72, 141, 0.1);
  border-color: var(--primary);
  color: var(--primary);
}

.view-all-templates {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: transparent;
  border: none;
  color: var(--primary);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: var(--spacing-xs) 0;
}

.view-all-templates:hover {
  text-decoration: underline;
}

.form-hint {
  font-size: var(--text-xs);
  color: var(--on-surface-variant);
  margin-top: var(--spacing-xs);
}

/* Address Source Selector Styles */
.address-source-card {
  grid-column: 1 / -1;
}

.address-source-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

.source-option {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--surface-container-low);
  border: 2px solid var(--outline-variant);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s ease;
}

.source-option:hover {
  background: var(--surface-container);
  border-color: var(--primary);
}

.source-option.active {
  background: rgba(0, 72, 141, 0.05);
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0, 72, 141, 0.1);
}

.source-option input[type="radio"] {
  display: none;
}

.source-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-container-lowest);
  border-radius: var(--radius-md);
  color: var(--on-surface-variant);
  flex-shrink: 0;
}

.source-option.active .source-icon {
  background: var(--primary);
  color: var(--on-primary);
}

.source-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.source-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--on-surface);
}

.source-desc {
  font-size: var(--text-sm);
  color: var(--on-surface-variant);
}

.custom-address-textarea {
  min-height: 150px;
}

/* Address History Styles */
.address-history-section {
  margin-bottom: var(--spacing-md);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--surface-container-low);
  cursor: pointer;
  transition: background 0.2s ease;
}

.history-header:hover {
  background: var(--surface-container);
}

.history-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--on-surface);
}

.history-toggle-icon {
  transition: transform 0.2s ease;
}

.history-toggle-icon.rotated {
  transform: rotate(180deg);
}

.history-content {
  padding: var(--spacing-md);
  border-top: 1px solid var(--outline-variant);
}

.history-group {
  margin-bottom: var(--spacing-md);
}

.history-group:last-child {
  margin-bottom: 0;
}

.history-group-title {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--on-surface-variant);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: var(--spacing-sm);
}

.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.history-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--surface-container-low);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  color: var(--on-surface);
  cursor: pointer;
  transition: all 0.2s ease;
}

.history-tag:hover {
  background: var(--primary-container);
  border-color: var(--primary);
  color: var(--on-primary-container);
}

.count-badge {
  font-size: var(--text-xs);
  font-weight: 700;
  background: rgba(0, 72, 141, 0.1);
  color: var(--primary);
  padding: 1px 4px;
  border-radius: var(--radius-sm);
}

.history-actions {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--outline-variant);
}

.import-all-button {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  color: var(--on-primary);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.import-all-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Responsive for address source selector */
@media (max-width: 768px) {
  .address-source-selector {
    grid-template-columns: 1fr;
  }
}
</style>
