import { ref } from 'vue';

// 邮件地址历史记录
const addressHistory = ref([]);

// 从 localStorage 加载地址历史
function loadAddressHistory() {
  const saved = localStorage.getItem('addressHistory');
  if (saved) {
    try {
      addressHistory.value = JSON.parse(saved);
    } catch (e) {
      console.error('[AddressHistory] 加载地址历史失败:', e);
      addressHistory.value = [];
    }
  }
}

// 保存地址历史到 localStorage
function saveAddressHistory() {
  localStorage.setItem('addressHistory', JSON.stringify(addressHistory.value));
}

// 添加邮件地址到历史记录
function addToAddressHistory(addresses) {
  if (!addresses || addresses.length === 0) return;
  
  addresses.forEach(address => {
    const trimmedAddress = address.trim();
    if (!trimmedAddress) return;
    
    // 检查是否已存在
    const existingIndex = addressHistory.value.findIndex(item => item.address === trimmedAddress);
    
    if (existingIndex >= 0) {
      // 更新已存在的记录
      addressHistory.value[existingIndex].usedCount++;
      addressHistory.value[existingIndex].lastUsed = new Date().toISOString();
    } else {
      // 添加新记录
      addressHistory.value.unshift({
        id: Date.now() + Math.random(),
        address: trimmedAddress,
        usedCount: 1,
        lastUsed: new Date().toISOString()
      });
    }
  });
  
  // 按使用次数排序
  addressHistory.value.sort((a, b) => b.usedCount - a.usedCount);
  
  // 只保留最近100条记录
  if (addressHistory.value.length > 100) {
    addressHistory.value = addressHistory.value.slice(0, 100);
  }
  
  saveAddressHistory();
}

// 删除地址历史记录
function deleteAddressHistory(id) {
  addressHistory.value = addressHistory.value.filter(item => item.id !== id);
  saveAddressHistory();
}

// 清空地址历史
function clearAddressHistory() {
  addressHistory.value = [];
  saveAddressHistory();
}

// 获取常用地址（按使用频率排序）
function getFrequentAddresses(limit = 10) {
  return addressHistory.value
    .filter(item => item.usedCount > 0)
    .sort((a, b) => b.usedCount - a.usedCount)
    .slice(0, limit);
}

// 获取最近使用的地址
function getRecentAddresses(limit = 10) {
  return addressHistory.value
    .sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed))
    .slice(0, limit);
}

// 搜索地址历史
function searchAddresses(query) {
  if (!query) return addressHistory.value;
  const lowerQuery = query.toLowerCase();
  return addressHistory.value.filter(item => 
    item.address.toLowerCase().includes(lowerQuery)
  );
}

export function useAddressHistory() {
  return {
    addressHistory,
    loadAddressHistory,
    saveAddressHistory,
    addToAddressHistory,
    deleteAddressHistory,
    clearAddressHistory,
    getFrequentAddresses,
    getRecentAddresses,
    searchAddresses
  };
}