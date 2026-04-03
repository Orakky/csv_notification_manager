import { ref, computed } from 'vue';
import { generateId, extractFileName, deepClone } from '../utils';
import { formatDate } from '../utils/formatters';

// 文件历史记录
const fileHistory = ref([]);

// 从 localStorage 加载历史记录
function loadHistory() {
  const saved = localStorage.getItem('fileHistory');
  if (saved) {
    try {
      fileHistory.value = JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load history:', e);
      fileHistory.value = [];
    }
  }
}

// 保存历史记录到 localStorage
function saveHistory() {
  localStorage.setItem('fileHistory', JSON.stringify(fileHistory.value));
}

// 添加到历史记录
function addToHistory(filePath, data) {
  const fileName = extractFileName(filePath);
  const existingIndex = fileHistory.value.findIndex(h => h.filePath === filePath);
  
  const historyItem = {
    id: generateId(),
    fileName,
    filePath,
    headers: data.headers,
    rowCount: data.rows.length,
    contactColumns: data.contact_columns,
    timestamp: new Date().toISOString(),
    data: deepClone(data)
  };
  
  if (existingIndex >= 0) {
    fileHistory.value[existingIndex] = historyItem;
  } else {
    fileHistory.value.unshift(historyItem);
  }
  
  saveHistory();
}

// 删除历史记录
function deleteHistory(id) {
  fileHistory.value = fileHistory.value.filter(h => h.id !== id);
  saveHistory();
}

// 清空历史记录
function clearHistory() {
  fileHistory.value = [];
  saveHistory();
}

// 获取历史项
function getHistoryItem(id) {
  return fileHistory.value.find(h => h.id === id);
}

// 计算属性
const totalFiles = computed(() => fileHistory.value.length);

const totalRows = computed(() => {
  return fileHistory.value.reduce((sum, item) => sum + item.rowCount, 0);
});

const totalContacts = computed(() => {
  return fileHistory.value.reduce((sum, item) => {
    return sum + item.contactColumns.reduce((colSum, col) => colSum + item.rowCount, 0);
  }, 0);
});

export function useFileHistory() {
  return {
    fileHistory,
    totalFiles,
    totalRows,
    totalContacts,
    loadHistory,
    saveHistory,
    addToHistory,
    deleteHistory,
    clearHistory,
    getHistoryItem
  };
}