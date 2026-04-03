import { ref } from 'vue';

// 选中的联系方式列
const selectedContactColumn = ref(null);
// 选中的内容列
const selectedContentColumns = ref([]);
// 消息模板
const messageTemplate = ref('');
// 生成的消息
const generatedMessages = ref([]);
// 地址来源类型：'excel' 或 'custom'
const addressSourceType = ref('excel');
// 自定义地址列表
const customAddresses = ref([]);

// 生成消息
function generateMessages(fileData) {
  console.log('[MessageGenerator] 开始生成消息');
  console.log('[MessageGenerator] 文件数据:', fileData ? '已加载' : '未加载');
  console.log('[MessageGenerator] 地址来源:', addressSourceType.value);
  console.log('[MessageGenerator] 消息模板:', messageTemplate.value ? '已设置' : '未设置');
  
  if (!fileData || !messageTemplate.value) {
    console.warn('[MessageGenerator] 缺少必要数据');
    return [];
  }
  
  // 检查地址来源
  if (addressSourceType.value === 'excel' && !selectedContactColumn.value) {
    console.warn('[MessageGenerator] Excel模式但未选择联系方式列');
    return [];
  }
  
  if (addressSourceType.value === 'custom' && customAddresses.value.length === 0) {
    console.warn('[MessageGenerator] 自定义模式但未输入地址');
    return [];
  }
  
  const messages = [];
  
  if (addressSourceType.value === 'excel') {
    // 使用Excel中的联系方式列
    fileData.rows.forEach((row, index) => {
      let message = messageTemplate.value;
      
      // 替换占位符为实际值
      fileData.headers.forEach((header, colIndex) => {
        const placeholder = `{{${header}}}`;
        const value = row[colIndex] || '';
        message = message.replaceAll(placeholder, value);
      });
      
      const contact = row[selectedContactColumn.value.index] || '';
      messages.push({
        index,
        contact,
        contactType: selectedContactColumn.value.contact_type,
        message
      });
    });
  } else {
    // 使用自定义地址列表
    // 为每一行数据生成消息，每个自定义地址对应一条消息
    customAddresses.value.forEach((address, addrIndex) => {
      // 使用第一行数据作为模板数据（如果有的话）
      if (fileData.rows.length > 0) {
        let message = messageTemplate.value;
        const row = fileData.rows[0];
        
        // 替换占位符为实际值
        fileData.headers.forEach((header, colIndex) => {
          const placeholder = `{{${header}}}`;
          const value = row[colIndex] || '';
          message = message.replaceAll(placeholder, value);
        });
        
        // 检测地址类型
        const contactType = detectContactType(address);
        
        messages.push({
          index: addrIndex,
          contact: address,
          contactType: contactType,
          message: message
        });
      }
    });
  }
  
  generatedMessages.value = messages;
  return messages;
}

// 检测联系方式类型
function detectContactType(contact) {
  // 邮箱正则
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  // 手机号正则（中国大陆）
  const phoneRegex = /^1[3-9]\d{9}$/;
  // QQ号正则
  const qqRegex = /^[1-9]\d{4,10}$/;
  
  if (emailRegex.test(contact)) {
    return 'email';
  } else if (phoneRegex.test(contact)) {
    return 'phone';
  } else if (qqRegex.test(contact)) {
    return 'qq';
  }
  return 'unknown';
}

// 清除生成的消息
function clearGeneratedMessages() {
  generatedMessages.value = [];
}

// 设置联系方式列
function setContactColumn(column) {
  selectedContactColumn.value = column;
}

// 设置内容列
function setContentColumns(columns) {
  selectedContentColumns.value = columns;
}

// 设置消息模板
function setMessageTemplate(template) {
  messageTemplate.value = template;
}

// 设置地址来源类型
function setAddressSourceType(type) {
  addressSourceType.value = type;
}

// 设置自定义地址列表
function setCustomAddresses(addresses) {
  customAddresses.value = addresses;
}

// 检查是否可以生成消息
function canGenerateMessages(fileData) {
  if (!fileData || !messageTemplate.value) {
    return false;
  }
  
  if (addressSourceType.value === 'excel') {
    return !!selectedContactColumn.value;
  } else {
    return customAddresses.value.length > 0;
  }
}

// 清除所有选择（更新版本）
function clearSelections() {
  selectedContactColumn.value = null;
  selectedContentColumns.value = [];
  messageTemplate.value = '';
  generatedMessages.value = [];
  addressSourceType.value = 'excel';
  customAddresses.value = [];
}

export function useMessageGenerator() {
  return {
    selectedContactColumn,
    selectedContentColumns,
    messageTemplate,
    generatedMessages,
    addressSourceType,
    customAddresses,
    generateMessages,
    clearGeneratedMessages,
    clearSelections,
    setContactColumn,
    setContentColumns,
    setMessageTemplate,
    setAddressSourceType,
    setCustomAddresses,
    canGenerateMessages,
    detectContactType
  };
}
