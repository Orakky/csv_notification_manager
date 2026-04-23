import { ref, computed } from 'vue';
import { QueryOperators } from '../types';

// 查询配置存储
const queryConfigs = ref([]);

// 当前查询会话
const currentSession = ref(null);

// 查询结果
const queryResults = ref([]);

// 查询状态
const querying = ref(false);

// 查询错误
const queryError = ref(null);

// 本地存储键名
const STORAGE_KEY = 'queryConfigs';

/**
 * 加载查询配置
 */
function loadQueryConfigs() {
  try {
    console.log('[useQueryEngine] 开始加载查询配置');
    const stored = localStorage.getItem(STORAGE_KEY);
    console.log('[useQueryEngine] 本地存储数据:', stored);
    if (stored) {
      queryConfigs.value = JSON.parse(stored);
      console.log('[useQueryEngine] 加载的配置:', queryConfigs.value);
    } else {
      console.log('[useQueryEngine] 没有找到存储的配置');
      queryConfigs.value = [];
    }
  } catch (error) {
    console.error('加载查询配置失败:', error);
    queryConfigs.value = [];
  }
}

/**
 * 保存查询配置到本地存储
 */
function saveQueryConfigs() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queryConfigs.value));
  } catch (error) {
    console.error('保存查询配置失败:', error);
  }
}

/**
 * 创建查询配置
 */
function createQueryConfig(name, fileId, fileName, conditions) {
  const config = {
    id: Date.now(),
    name,
    fileId,
    fileName,
    conditions: conditions.map(condition => ({
      column_index: condition.column_index,
      column_name: condition.column_name,
      operator: condition.operator
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  queryConfigs.value.push(config);
  saveQueryConfigs();
  
  return config;
}

/**
 * 更新查询配置
 */
function updateQueryConfig(id, updates) {
  const index = queryConfigs.value.findIndex(c => c.id === id);
  if (index !== -1) {
    queryConfigs.value[index] = {
      ...queryConfigs.value[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveQueryConfigs();
    return queryConfigs.value[index];
  }
  return null;
}

/**
 * 删除查询配置
 */
function deleteQueryConfig(id) {
  const index = queryConfigs.value.findIndex(c => c.id === id);
  if (index !== -1) {
    queryConfigs.value.splice(index, 1);
    saveQueryConfigs();
    return true;
  }
  return false;
}

/**
 * 执行单个条件匹配
 */
function matchCondition(cellValue, operator, conditionValue) {
  if (cellValue === null || cellValue === undefined) {
    cellValue = '';
  }
  
  const strValue = String(cellValue).toLowerCase();
  const strConditionValue = String(conditionValue).toLowerCase();
  
  switch (operator) {
    case QueryOperators.EQUALS:
      return strValue === strConditionValue;
    
    case QueryOperators.CONTAINS:
      return strValue.includes(strConditionValue);
    
    case QueryOperators.STARTS_WITH:
      return strValue.startsWith(strConditionValue);
    
    case QueryOperators.ENDS_WITH:
      return strValue.endsWith(strConditionValue);
    
    case QueryOperators.NOT_EMPTY:
      return strValue.trim() !== '';
    
    default:
      return false;
  }
}

/**
 * 执行查询
 */
function executeQuery(fileData, config, parameters) {
  querying.value = true;
  queryError.value = null;
  
  try {
    if (!fileData || !fileData.rows || !fileData.headers) {
      throw new Error('文件数据无效');
    }
    
    if (!config || !config.conditions || config.conditions.length === 0) {
      throw new Error('查询条件无效');
    }
    
    const results = [];
    const headers = fileData.headers;
    
    // 遍历所有数据行
    fileData.rows.forEach((row, rowIndex) => {
      let matches = true;
      
      // 检查所有条件（AND 关系）
      for (const condition of config.conditions) {
        const columnIndex = condition.column_index;
        const cellValue = row[columnIndex];
        
        // 获取查询值
        let conditionValue = '';
        if (condition.operator !== QueryOperators.NOT_EMPTY && parameters) {
          conditionValue = parameters[condition.column_name] || '';
        }
        
        // 执行匹配
        if (!matchCondition(cellValue, condition.operator, conditionValue)) {
          matches = false;
          break;
        }
      }
      
      // 如果匹配，添加到结果
      if (matches) {
        const rowData = {};
        headers.forEach((header, index) => {
          rowData[header] = row[index];
        });
        
        results.push({
          rowIndex: rowIndex + 1, // 1-based 行号
          data: rowData
        });
      }
    });
    
    // 创建查询会话
    const session = {
      id: Date.now(),
      config: { ...config },
      parameters: { ...parameters },
      results,
      totalCount: fileData.rows.length,
      matchedCount: results.length,
      executedAt: new Date().toISOString()
    };
    
    currentSession.value = session;
    queryResults.value = results;
    
    return session;
    
  } catch (error) {
    queryError.value = error.message;
    console.error('查询执行失败:', error);
    return null;
  } finally {
    querying.value = false;
  }
}

/**
 * 清除查询状态
 */
function clearQueryState() {
  currentSession.value = null;
  queryResults.value = [];
  queryError.value = null;
}

/**
 * 获取查询统计信息
 */
function getQueryStats() {
  if (!currentSession.value) {
    return null;
  }
  
  const { totalCount, matchedCount } = currentSession.value;
  const matchRate = totalCount > 0 ? Math.round((matchedCount / totalCount) * 100) : 0;
  
  return {
    totalCount,
    matchedCount,
    matchRate
  };
}

/**
 * 生成查询链接
 */
function generateQueryLink(configId) {
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?query=${configId}`;
}

/**
 * 从 URL 解析查询配置 ID
 */
function parseQueryFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('query');
}

/**
 * 导出查询结果为 CSV
 */
function exportResultsToCSV(session) {
  if (!session || !session.results || session.results.length === 0) {
    return null;
  }
  
  const headers = Object.keys(session.results[0].data);
  const csvContent = [
    headers.join(','),
    ...session.results.map(row => 
      headers.map(h => `"${String(row.data[h] || '').replace(/"/g, '""')}"`).join(',')
    )
  ].join('\n');
  
  return '\ufeff' + csvContent; // 添加 BOM 以支持中文
}

/**
 * 下载查询结果
 */
function downloadQueryResults(session, filename) {
  const csvContent = exportResultsToCSV(session);
  if (!csvContent) return;
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename || `查询结果_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
}

export function useQueryEngine() {
  return {
    // 状态
    queryConfigs,
    currentSession,
    queryResults,
    querying,
    queryError,
    
    // 方法
    loadQueryConfigs,
    createQueryConfig,
    updateQueryConfig,
    deleteQueryConfig,
    executeQuery,
    clearQueryState,
    getQueryStats,
    generateQueryLink,
    parseQueryFromUrl,
    exportResultsToCSV,
    downloadQueryResults
  };
}