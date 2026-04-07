import { ref } from 'vue';
import { invoke } from '@tauri-apps/api/core';

// 发送状态
const sending = ref(false);
const sendProgress = ref(0);
const sendResults = ref([]);
const sendError = ref('');

// 发送历史记录
const sendHistory = ref([]);

// 从 localStorage 加载发送历史
function loadSendHistory() {
  const saved = localStorage.getItem('sendHistory');
  if (saved) {
    try {
      sendHistory.value = JSON.parse(saved);
    } catch (e) {
      console.error('[MessageSender] 加载发送历史失败:', e);
      sendHistory.value = [];
    }
  }
}

// 保存发送历史到 localStorage
function saveSendHistory() {
  localStorage.setItem('sendHistory', JSON.stringify(sendHistory.value));
}

// 添加发送记录到历史
function addToSendHistory(messages, results, stats) {
  const historyItem = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    messageCount: messages.length,
    messages: messages, // 保存完整消息内容
    results: results,
    stats: stats
  };
  
  sendHistory.value.unshift(historyItem);
  
  // 只保留最近50条记录
  if (sendHistory.value.length > 50) {
    sendHistory.value = sendHistory.value.slice(0, 50);
  }
  
  saveSendHistory();
}

// 调用真实的邮件发送API
async function sendMessages(messages) {
  console.log('[MessageSender] 开始发送消息，总数:', messages?.length || 0);
  
  if (!messages || messages.length === 0) {
    console.warn('[MessageSender] 没有可发送的消息');
    sendError.value = '没有可发送的消息';
    return false;
  }

  sending.value = true;
  sendProgress.value = 0;
  sendResults.value = [];
  sendError.value = '';
  
  console.log('[MessageSender] 发送状态已初始化');

  try {
    const total = messages.length;
    const results = [];

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      
      try {
        console.log(`[MessageSender] 发送第 ${i + 1}/${total} 条消息到:`, message.contact);
        
        // 从设置中读取邮箱配置
        const savedConfig = localStorage.getItem('emailConfig');
        const emailConfig = savedConfig ? JSON.parse(savedConfig) : null;
        
        // 验证邮箱配置
        if (!emailConfig || !emailConfig.smtpServer || emailConfig.smtpServer === 'smtp.example.com') {
          console.error('[MessageSender] 邮箱配置无效:', emailConfig);
          throw new Error('请在设置中配置正确的邮箱信息（SMTP服务器不能为示例地址）');
        }
        
        console.log('[MessageSender] 使用邮箱配置:', {
          server: emailConfig.smtpServer,
          port: emailConfig.smtpPort,
          account: emailConfig.account,
          from: emailConfig.senderEmail
        });
        
        // 调用Rust后端发送邮件
        const result = await invoke('send_email_message', {
          smtpServer: emailConfig.smtpServer,
          smtpPort: emailConfig.smtpPort || 465,
          username: emailConfig.account,
          password: emailConfig.password,
          fromEmail: emailConfig.senderEmail,
          toEmail: message.contact,
          subject: 'CSV通知管理器 - 消息通知',
          body: message.message
        });
        
        console.log(`[MessageSender] 消息 ${i + 1} 发送成功:`, result);
        
        results.push({
          index: message.index,
          contact: message.contact,
          contactType: message.contactType,
          success: true,
          error: null,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        console.error(`[MessageSender] 消息 ${i + 1} 发送失败:`, err);
        
        results.push({
          index: message.index,
          contact: message.contact,
          contactType: message.contactType,
          success: false,
          error: err.message || '发送失败',
          timestamp: new Date().toISOString()
        });
      }
      
      sendProgress.value = Math.round(((i + 1) / total) * 100);
      sendResults.value = [...results];
      
      // 添加延迟避免过快发送
      if (i < messages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log('[MessageSender] 所有消息发送完成');
    return true;
  } catch (err) {
    console.error('[MessageSender] 发送过程中发生错误:', err);
    sendError.value = err.message || '发送过程中发生错误';
    return false;
  } finally {
    sending.value = false;
  }
}

// 清除发送状态
function clearSendState() {
  sending.value = false;
  sendProgress.value = 0;
  sendResults.value = [];
  sendError.value = '';
}

// 获取发送统计
function getSendStats() {
  const total = sendResults.value.length;
  const success = sendResults.value.filter(r => r.success).length;
  const failed = total - success;
  
  return {
    total,
    success,
    failed,
    successRate: total > 0 ? Math.round((success / total) * 100) : 0
  };
}

// 重发失败的消息
async function retryFailedMessages(historyItem) {
  const failedMessages = historyItem.results.filter(r => !r.success);
  if (failedMessages.length === 0) {
    sendError.value = '没有需要重发的消息';
    return false;
  }
  
  // 从历史记录中获取原始消息内容
  const originalMessages = historyItem.messages || [];
  
  // 构造重发消息数组
  const messagesToRetry = failedMessages.map(failed => {
    const originalMessage = originalMessages.find(msg => msg.contact === failed.contact);
    return {
      index: failed.index,
      contact: failed.contact,
      contactType: failed.contactType,
      message: originalMessage ? originalMessage.message : '重发消息'
    };
  });
  
  return await sendMessages(messagesToRetry);
}

// 从历史记录重新发送所有消息
async function resendFromHistory(historyItem) {
  if (!historyItem.messages || historyItem.messages.length === 0) {
    sendError.value = '历史记录中没有消息内容';
    return false;
  }
  
  console.log('[MessageSender] 从历史记录重新发送，消息数量:', historyItem.messages.length);
  return await sendMessages(historyItem.messages);
}

export function useMessageSender() {
  return {
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
  };
}
