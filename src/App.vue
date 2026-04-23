<script setup>
import { ref, onMounted } from 'vue';
import Sidebar from './components/Sidebar.vue';
import TopNav from './components/TopNav.vue';
import DashboardView from './components/DashboardView.vue';
import ImportView from './components/ImportView.vue';
import HistoryView from './components/HistoryView.vue';
import TemplatesView from './components/TemplatesView.vue';
import SettingsView from './components/SettingsView.vue';
import SendProgressModal from './components/SendProgressModal.vue';
import SendHistoryView from './components/SendHistoryView.vue';
import QueryManagerView from './components/QueryManagerView.vue';
import QueryConfigView from './components/QueryConfigView.vue';
import QueryView from './components/QueryView.vue';
import QueryResultView from './components/QueryResultView.vue';
import QueryFileSelectView from './components/QueryFileSelectView.vue';
import { useFileHistory } from './composables/useFileHistory';
import { useFileParser } from './composables/useFileParser';
import { useMessageGenerator } from './composables/useMessageGenerator';
import { useMessageSender } from './composables/useMessageSender';
import { useAddressHistory } from './composables/useAddressHistory';
import { useQueryEngine } from './composables/useQueryEngine';
import { ViewTypes } from './types';

// 使用 composables
const { fileHistory, loadHistory, addToHistory, deleteHistory } = useFileHistory();
const { fileData, loading, error, selectFile, clearFileData } = useFileParser();
const {
  selectedContactColumn,
  selectedContentColumns,
  messageTemplate,
  generatedMessages,
  addressSourceType,
  customAddresses,
  generateMessages,
  clearSelections,
  setAddressSourceType,
  setCustomAddresses
} = useMessageGenerator();

// 当前视图
const currentView = ref(ViewTypes.DASHBOARD);

// 搜索查询
const searchQuery = ref('');

// 发送弹窗状态
const showSendModal = ref(false);

// 使用消息发送composable
const { 
  sending, 
  sendProgress, 
  sendResults, 
  sendError, 
  sendHistory,
  sendMessages, 
  clearSendState,
  getSendStats,
  loadSendHistory,
  addToSendHistory,
  retryFailedMessages,
  resendFromHistory
} = useMessageSender();

const { addToAddressHistory } = useAddressHistory();

// 使用查询引擎
const {
  queryConfigs,
  currentSession,
  queryResults,
  querying,
  queryError,
  loadQueryConfigs,
  createQueryConfig,
  updateQueryConfig,
  deleteQueryConfig,
  executeQuery,
  clearQueryState,
  getQueryStats,
  generateQueryLink,
  parseQueryFromUrl
} = useQueryEngine();

// 查询相关状态
const currentQueryConfig = ref(null);
const queryFileData = ref(null);
const queryFileInfo = ref(null);

// 初始化
onMounted(() => {
  loadHistory();
  loadSendHistory();
  loadQueryConfigs();
  
  // 检查 URL 中是否有查询配置 ID
  const queryConfigId = parseQueryFromUrl();
  if (queryConfigId) {
    const config = queryConfigs.value.find(c => c.id === parseInt(queryConfigId));
    if (config) {
      handleExecuteQuery(config);
    }
  }
});

// 处理视图切换
function handleViewChange(view) {
  console.log('[App] 视图切换:', currentView.value, '->', view);
  currentView.value = view;
  if (view !== ViewTypes.IMPORT) {
    console.log('[App] 清除文件数据和选择');
    clearFileData();
    clearSelections();
  }
}

// 处理文件选择
async function handleSelectFile() {
  console.log('[App] 开始文件选择');
  try {
    const result = await selectFile();
    console.log('[App] 文件选择结果:', result ? '成功' : '取消');
    if (result) {
      console.log('[App] 添加文件到历史:', result.filePath);
      addToHistory(result.filePath, result.data);
      console.log('[App] 切换到导入视图');
      currentView.value = ViewTypes.IMPORT;
    }
  } catch (err) {
    console.error('[App] 文件选择失败:', err);
  }
}

// 处理查看历史
function handleViewHistory(item) {
  fileData.value = item.data;
  selectedContactColumn.value = item.data.contact_columns.length > 0 ? item.data.contact_columns[0] : null;
  selectedContentColumns.value = [];
  messageTemplate.value = '';
  generatedMessages.value = [];
  currentView.value = ViewTypes.IMPORT;
}

// 处理删除历史
function handleDeleteHistory(id) {
  deleteHistory(id);
}

// 处理联系方式列更新
function handleUpdateContactColumn(column) {
  selectedContactColumn.value = column;
}

// 处理内容列更新
function handleUpdateContentColumns(columns) {
  selectedContentColumns.value = columns;
}

// 处理模板更新
function handleUpdateTemplate(template) {
  messageTemplate.value = template;
}

// 处理地址来源类型更新
function handleUpdateAddressSourceType(type) {
  setAddressSourceType(type);
}

// 处理自定义地址更新
function handleUpdateCustomAddresses(addresses) {
  setCustomAddresses(addresses);
}

// 处理生成消息
function handleGenerateMessages() {
  console.log('[App] 开始生成消息');
  console.log('[App] 文件数据:', fileData.value ? '已加载' : '未加载');
  console.log('[App] 联系方式列:', selectedContactColumn.value?.name || '未选择');
  console.log('[App] 消息模板长度:', messageTemplate.value?.length || 0);
  generateMessages(fileData.value);
  console.log('[App] 生成消息数量:', generatedMessages.value.length);
}

// 处理发送消息
async function handleSendMessages() {
  console.log('[App] 开始发送消息');
  console.log('[App] 生成消息数量:', generatedMessages.value.length);
  
  if (generatedMessages.value.length === 0) {
    console.warn('[App] 没有可发送的消息');
    alert('没有可发送的消息');
    return;
  }
  
  const confirmed = confirm(`确定要发送 ${generatedMessages.value.length} 条消息吗？`);
  console.log('[App] 用户确认发送:', confirmed);
  if (!confirmed) return;
  
  // 显示发送弹窗
  showSendModal.value = true;
  
  console.log('[App] 开始调用发送函数');
  const success = await sendMessages(generatedMessages.value);
  console.log('[App] 发送结果:', success);
  
  // 发送完成后自动保存历史
  if (sendResults.value.length > 0) {
    const stats = getSendStats();
    addToSendHistory(generatedMessages.value, sendResults.value, stats);
    console.log('[App] 发送记录已保存到历史');
    
    // 保存地址到历史记录
    const addresses = generatedMessages.value.map(msg => msg.contact);
    addToAddressHistory(addresses);
    console.log('[App] 地址已保存到历史记录');
  }
}

// 处理重发失败消息
function handleRetryFailed(historyItem) {
  console.log('[App] 重发失败消息:', historyItem);
  retryFailedMessages(historyItem);
}

// 处理从历史记录重新发送
async function handleResendFromHistory(historyItem) {
  console.log('[App] 从历史记录重新发送:', historyItem);
  
  const confirmed = confirm(`确定要重新发送 ${historyItem.messageCount} 条消息吗？`);
  console.log('[App] 用户确认重新发送:', confirmed);
  if (!confirmed) return;
  
  // 显示发送弹窗
  showSendModal.value = true;
  
  console.log('[App] 开始调用重新发送函数');
  const success = await resendFromHistory(historyItem);
  console.log('[App] 重新发送结果:', success);
  
  // 发送完成后自动保存历史
  if (sendResults.value.length > 0) {
    const stats = getSendStats();
    addToSendHistory(historyItem.messages, sendResults.value, stats);
    console.log('[App] 重新发送记录已保存到历史');
    
    // 保存地址到历史记录
    const addresses = historyItem.messages.map(msg => msg.contact);
    addToAddressHistory(addresses);
    console.log('[App] 地址已保存到历史记录');
  }
}

// 关闭发送弹窗
function handleCloseSendModal() {
  showSendModal.value = false;
  clearSendState();
}

// 处理搜索
function handleSearch(query) {
  searchQuery.value = query;
  console.log('Searching:', query);
}

// 处理导航
function handleNavigate(view) {
  currentView.value = view;
}

// 处理模板相关事件
function handleCreateTemplate() {
  console.log('Create template');
}

function handleEditTemplate(template) {
  console.log('Edit template:', template);
}

function handleDeleteTemplate(id) {
  console.log('Delete template:', id);
}

// 处理发送历史相关事件
function handleDeleteSendHistory(id) {
  const index = sendHistory.value.findIndex(item => item.id === id);
  if (index !== -1) {
    sendHistory.value.splice(index, 1);
    localStorage.setItem('sendHistory', JSON.stringify(sendHistory.value));
    console.log('[App] 删除发送历史记录:', id);
  }
}

function handleClearSendHistory() {
  sendHistory.value = [];
  localStorage.setItem('sendHistory', JSON.stringify(sendHistory.value));
  console.log('[App] 清空所有发送历史');
}

// 查询相关处理函数
function handleSelectQueryFile() {
  console.log('[App] 选择查询文件');
  currentView.value = 'query-select-file';
}

function handleCreateQueryConfig() {
  console.log('[App] 创建查询配置');
  if (!fileData.value) {
    alert('请先选择一个文件');
    return;
  }
  queryFileData.value = fileData.value;
  currentQueryConfig.value = null;
  currentView.value = 'query-config';
}

function handleEditQueryConfig(config) {
  console.log('[App] 编辑查询配置:', config);
  // 从历史记录中找到对应的文件数据
  const historyItem = fileHistory.value.find(h => h.id === config.fileId);
  if (historyItem) {
    queryFileData.value = historyItem.data;
    currentQueryConfig.value = config;
    currentView.value = 'query-config';
  } else {
    alert('找不到对应的文件数据');
  }
}

function handleDeleteQueryConfig(id) {
  console.log('[App] 删除查询配置:', id);
  deleteQueryConfig(id);
}

function handleExecuteQuery(config) {
  console.log('[App] 执行查询:', config);
  // 从历史记录中找到对应的文件数据
  const historyItem = fileHistory.value.find(h => h.id === config.fileId);
  if (historyItem) {
    queryFileData.value = historyItem.data;
    currentQueryConfig.value = config;
    currentView.value = 'query';
  } else {
    alert('找不到对应的文件数据');
  }
}

function handleSaveQueryConfig(data) {
  console.log('[App] 保存查询配置:', data);
  
  if (currentQueryConfig.value) {
    // 更新现有配置
    updateQueryConfig(currentQueryConfig.value.id, {
      name: data.name,
      conditions: data.conditions
    });
  } else {
    // 使用保存的文件信息
    const fileId = queryFileInfo.value ? queryFileInfo.value.id : Date.now();
    const fileName = queryFileInfo.value ? queryFileInfo.value.fileName : '未命名文件';
    
    // 创建新配置
    createQueryConfig(
      data.name,
      fileId,
      fileName,
      data.conditions
    );
  }
  
  currentView.value = 'query-manager';
}

function handleCancelQueryConfig() {
  console.log('[App] 取消查询配置');
  currentView.value = 'query-manager';
}

function handleExecuteQueryWithParams(data) {
  console.log('[App] 执行查询，参数:', data);
  
  const session = executeQuery(queryFileData.value, data.config, data.parameters);
  if (session) {
    currentView.value = 'query-result';
  }
}

function handleBackToQuery() {
  console.log('[App] 返回查询管理界面');
  currentView.value = 'query-manager';
}

function handleExportQueryResults(session) {
  console.log('[App] 导出查询结果:', session);
  
  // 构建 CSV 内容
  const headers = Object.keys(session.results[0].data);
  const csvContent = [
    headers.join(','),
    ...session.results.map(row => 
      headers.map(h => `"${row.data[h] || ''}"`).join(',')
    )
  ].join('\n');
  
  // 下载文件
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `查询结果_${session.config.name}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
}

// 处理查询文件选择
function handleQueryFileSelect(item) {
  console.log('[App] 选择查询文件:', item);
  queryFileData.value = item.data;
  queryFileInfo.value = {
    id: item.id,
    fileName: item.fileName
  };
  currentQueryConfig.value = null;
  currentView.value = 'query-config';
}

// 取消查询文件选择
function handleCancelQueryFileSelect() {
  console.log('[App] 取消查询文件选择');
  currentView.value = 'query-manager';
}
</script>

<template>
  <div class="app-container">
    <Sidebar 
      :currentView="currentView" 
      @view-change="handleViewChange" 
    />
    
    <main class="main-content">
      <TopNav @search="handleSearch" />
      
      <DashboardView 
        v-if="currentView === ViewTypes.DASHBOARD"
        :fileHistory="fileHistory"
        :loading="loading"
        @select-file="handleSelectFile"
        @view-history="handleViewHistory"
        @navigate="handleNavigate"
      />
      
      <ImportView 
        v-else-if="currentView === ViewTypes.IMPORT"
        :fileData="fileData"
        :loading="loading"
        :selectedContactColumn="selectedContactColumn"
        :selectedContentColumns="selectedContentColumns"
        :messageTemplate="messageTemplate"
        :generatedMessages="generatedMessages"
        :addressSourceType="addressSourceType"
        :customAddresses="customAddresses"
        @select-file="handleSelectFile"
        @update-contact-column="handleUpdateContactColumn"
        @update-content-columns="handleUpdateContentColumns"
        @update-template="handleUpdateTemplate"
        @update-address-source-type="handleUpdateAddressSourceType"
        @update-custom-addresses="handleUpdateCustomAddresses"
        @generate-messages="handleGenerateMessages"
        @send-messages="handleSendMessages"
        @navigate="handleNavigate"
      />
      
      <HistoryView 
        v-else-if="currentView === ViewTypes.HISTORY"
        :fileHistory="fileHistory"
        @view-history="handleViewHistory"
        @delete-history="handleDeleteHistory"
        @select-file="handleSelectFile"
      />
      
      <TemplatesView 
        v-else-if="currentView === ViewTypes.TEMPLATES"
        @create-template="handleCreateTemplate"
        @edit-template="handleEditTemplate"
        @delete-template="handleDeleteTemplate"
      />
      
      <SettingsView 
        v-else-if="currentView === ViewTypes.SETTINGS"
      />
      
      <SendHistoryView 
        v-else-if="currentView === 'send-history'"
        :sendHistory="sendHistory"
        @retry-failed="handleRetryFailed"
        @delete-history="handleDeleteSendHistory"
        @clear-history="handleClearSendHistory"
        @resend-history="handleResendFromHistory"
      />
      
      <QueryManagerView 
        v-else-if="currentView === 'query-manager'"
        :queryConfigs="queryConfigs"
        :fileHistory="fileHistory"
        @select-file="handleSelectQueryFile"
        @edit="handleEditQueryConfig"
        @delete="handleDeleteQueryConfig"
        @execute="handleExecuteQuery"
      />
      
      <QueryConfigView 
        v-else-if="currentView === 'query-config'"
        :fileData="queryFileData"
        :existingConfig="currentQueryConfig"
        @save="handleSaveQueryConfig"
        @cancel="handleCancelQueryConfig"
      />
      
      <QueryView 
        v-else-if="currentView === 'query'"
        :queryConfig="currentQueryConfig"
        :fileData="queryFileData"
        @execute="handleExecuteQueryWithParams"
        @back="handleBackToQuery"
      />
      
      <QueryResultView 
        v-else-if="currentView === 'query-result' && currentSession"
        :querySession="currentSession"
        @back="handleBackToQuery"
        @export="handleExportQueryResults"
      />
      
      <QueryFileSelectView 
        v-else-if="currentView === 'query-select-file'"
        :fileHistory="fileHistory"
        @select="handleQueryFileSelect"
        @cancel="handleCancelQueryFileSelect"
      />
    </main>
    
    <!-- 发送进度弹窗 -->
    <SendProgressModal 
      :visible="showSendModal"
      :sending="sending"
      :progress="sendProgress"
      :results="sendResults"
      :error="sendError"
      @close="handleCloseSendModal"
      @retry="handleRetryFailed"
    />
  </div>
</template>

<style>
:root {
  /* Material Design Color System */
  --primary: #00488d;
  --primary-container: #005fb8;
  --on-primary: #ffffff;
  --on-primary-container: #cadcff;
  
  --secondary: #515f74;
  --secondary-container: #d5e3fc;
  --on-secondary: #ffffff;
  --on-secondary-container: #57657a;
  
  --tertiary: #004d70;
  --tertiary-container: #006693;
  --on-tertiary: #ffffff;
  --on-tertiary-container: #b8e0ff;
  
  --error: #ba1a1a;
  --error-container: #ffdad6;
  --on-error: #ffffff;
  --on-error-container: #93000a;
  
  --background: #faf8ff;
  --on-background: #131b2e;
  
  --surface: #faf8ff;
  --surface-dim: #d2d9f4;
  --surface-bright: #faf8ff;
  --surface-container-lowest: #ffffff;
  --surface-container-low: #f2f3ff;
  --surface-container: #eaedff;
  --surface-container-high: #e2e7ff;
  --surface-container-highest: #dae2fd;
  --on-surface: #131b2e;
  --on-surface-variant: #424752;
  
  --outline: #727783;
  --outline-variant: #c2c6d4;
  
  --shadow: rgba(0, 0, 0, 0.08);
  --shadow-lg: rgba(0, 0, 0, 0.12);
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
  
  /* Typography */
  --font-headline: 'Manrope', sans-serif;
  --font-body: 'Inter', sans-serif;
  
  /* Font Sizes */
  --text-xs: 10px;
  --text-sm: 12px;
  --text-base: 14px;
  --text-lg: 16px;
  --text-xl: 20px;
  --text-2xl: 24px;
  --text-3xl: 30px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-body);
  background: var(--background);
  color: var(--on-background);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

.app-container {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  margin-left: 256px;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow-x: hidden;
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    margin-left: 64px;
  }
}

@media (max-width: 480px) {
  .main-content {
    margin-left: 0;
  }
}
</style>