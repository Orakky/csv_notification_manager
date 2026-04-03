import { ref } from 'vue';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';

// 文件数据
const fileData = ref(null);
// 加载状态
const loading = ref(false);
// 错误信息
const error = ref('');

// 选择并解析文件
async function selectFile() {
  loading.value = true;
  error.value = '';
  
  try {
    const selected = await open({
      multiple: false,
      filters: [
        {
          name: 'Excel Files',
          extensions: ['xlsx', 'xls']
        },
        {
          name: 'CSV Files',
          extensions: ['csv']
        }
      ]
    });
    
    if (selected) {
      const result = await invoke('parse_file', { filePath: selected });
      fileData.value = result;
      return { filePath: selected, data: result };
    }
    return null;
  } catch (err) {
    error.value = err.message || 'Failed to parse file';
    throw err;
  } finally {
    loading.value = false;
  }
}

// 清除文件数据
function clearFileData() {
  fileData.value = null;
  error.value = '';
}

// 获取文件数据
function getFileData() {
  return fileData.value;
}

// 检查是否有文件数据
function hasFileData() {
  return fileData.value !== null;
}

export function useFileParser() {
  return {
    fileData,
    loading,
    error,
    selectFile,
    clearFileData,
    getFileData,
    hasFileData
  };
}