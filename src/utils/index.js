/**
 * 获取单元格图片
 * @param {Object} fileData - 文件数据
 * @param {number} rowIndex - 行索引
 * @param {number} cellIndex - 单元格索引
 * @returns {string|null} 图片的base64数据或null
 */
export function getCellImage(fileData, rowIndex, cellIndex) {
  if (!fileData.cell_images || !fileData.cell_images[rowIndex]) {
    return null;
  }
  return fileData.cell_images[rowIndex][cellIndex] || null;
}

/**
 * 生成唯一ID
 * @returns {number} 时间戳ID
 */
export function generateId() {
  return Date.now();
}

/**
 * 从文件路径提取文件名
 * @param {string} filePath - 文件路径
 * @returns {string} 文件名
 */
export function extractFileName(filePath) {
  return filePath.split(/[\\/]/).pop();
}

/**
 * 深拷贝对象
 * @param {Object} obj - 要拷贝的对象
 * @returns {Object} 拷贝后的对象
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 限制时间（毫秒）
 * @returns {Function} 节流后的函数
 */
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 检查是否为空值
 * @param {*} value - 要检查的值
 * @returns {boolean} 是否为空
 */
export function isEmpty(value) {
  return value === null || value === undefined || value === '';
}

/**

、、 * 安全的 JSON 解析
 * @param {string} str - JSON 字符串
 * @param {*} defaultValue - 默认值
 * @returns {*} 解析结果或默认值
 */
export function safeJsonParse(str, defaultValue = null) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return defaultValue;
  }
}