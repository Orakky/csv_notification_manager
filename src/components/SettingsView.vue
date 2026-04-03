<script setup>
import { ref, onMounted } from 'vue';

const emailConfig = ref({
  senderEmail: '',
  smtpServer: '',
  smtpPort: 587,
  account: '',
  password: '',
  useSsl: true
});

const saving = ref(false);
const testing = ref(false);
const testResult = ref(null);

onMounted(() => {
  loadEmailConfig();
});

function loadEmailConfig() {
  const saved = localStorage.getItem('emailConfig');
  if (saved) {
    emailConfig.value = { ...emailConfig.value, ...JSON.parse(saved) };
  }
}

function saveEmailConfig() {
  saving.value = true;
  try {
    localStorage.setItem('emailConfig', JSON.stringify(emailConfig.value));
    setTimeout(() => {
      saving.value = false;
      alert('配置已保存');
    }, 500);
  } catch (err) {
    saving.value = false;
    alert('保存失败: ' + err.message);
  }
}

function testConnection() {
  testing.value = true;
  testResult.value = null;
  
  // 模拟测试连接
  setTimeout(() => {
    testing.value = false;
    if (emailConfig.value.smtpServer && emailConfig.value.senderEmail) {
      testResult.value = { success: true, message: '连接测试成功' };
    } else {
      testResult.value = { success: false, message: '请填写完整的配置信息' };
    }
  }, 1500);
}

function resetConfig() {
  if (confirm('确定要重置所有配置吗？')) {
    emailConfig.value = {
      senderEmail: '',
      smtpServer: '',
      smtpPort: 587,
      account: '',
      password: '',
      useSsl: true
    };
    testResult.value = null;
  }
}

function applyPreset(provider) {
  const presets = {
    gmail: {
      smtpServer: 'smtp.gmail.com',
      smtpPort: 587,
      useSsl: true
    },
    outlook: {
      smtpServer: 'smtp-mail.outlook.com',
      smtpPort: 587,
      useSsl: true
    },
    qq: {
      smtpServer: 'smtp.qq.com',
      smtpPort: 465,
      useSsl: true
    },
    '163': {
      smtpServer: 'smtp.163.com',
      smtpPort: 465,
      useSsl: true
    }
  };
  
  if (presets[provider]) {
    emailConfig.value = { ...emailConfig.value, ...presets[provider] };
  }
}
</script>

<template>
  <div class="settings-view">
    <div class="page-header">
      <div>
        <h1 class="page-title">设置</h1>
        <p class="page-subtitle">配置邮件发送相关参数</p>
      </div>
    </div>

    <div class="settings-content">
      <div class="settings-section">
        <div class="section-header">
          <h2 class="section-title">邮件发送配置</h2>
          <p class="section-description">配置SMTP服务器信息以启用邮件发送功能</p>
        </div>

        <div class="config-form">
          <div class="form-group">
            <label class="form-label">发送方邮箱地址</label>
            <input 
              v-model="emailConfig.senderEmail"
              type="email" 
              placeholder="example@domain.com"
              class="form-input"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">SMTP服务器</label>
              <input 
                v-model="emailConfig.smtpServer"
                type="text" 
                placeholder="smtp.gmail.com"
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">端口</label>
              <input 
                v-model.number="emailConfig.smtpPort"
                type="number" 
                placeholder="587"
                class="form-input"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">账号</label>
              <input 
                v-model="emailConfig.account"
                type="text" 
                placeholder="username"
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">密码</label>
              <input 
                v-model="emailConfig.password"
                type="password" 
                placeholder="••••••••"
                class="form-input"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input 
                v-model="emailConfig.useSsl"
                type="checkbox"
                class="checkbox-input"
              />
              <span>使用SSL加密连接</span>
            </label>
          </div>

          <div class="form-actions">
            <button @click="testConnection" :disabled="testing" class="secondary-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              {{ testing ? '测试中...' : '测试连接' }}
            </button>
            
            <button @click="resetConfig" class="secondary-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
              </svg>
              重置
            </button>
            
            <button @click="saveEmailConfig" class="primary-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              保存配置
            </button>
          </div>

          <div v-if="testResult" :class="['test-result', testResult.success ? 'success' : 'error']">
            <svg v-if="testResult.success" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <span>{{ testResult.message }}</span>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <div class="section-header">
          <h2 class="section-title">常用邮件服务商配置</h2>
          <p class="section-description">快速配置常见邮件服务商的SMTP设置</p>
        </div>

        <div class="presets-grid">
          <div class="preset-card" @click="applyPreset('gmail')">
            <div class="preset-icon gmail">G</div>
            <div class="preset-info">
              <h4>Gmail</h4>
              <p>smtp.gmail.com:587</p>
            </div>
          </div>

          <div class="preset-card" @click="applyPreset('outlook')">
            <div class="preset-icon outlook">O</div>
            <div class="preset-info">
              <h4>Outlook</h4>
              <p>smtp-mail.outlook.com:587</p>
            </div>
          </div>

          <div class="preset-card" @click="applyPreset('qq')">
            <div class="preset-icon qq">Q</div>
            <div class="preset-info">
              <h4>QQ邮箱</h4>
              <p>smtp.qq.com:465</p>
            </div>
          </div>

          <div class="preset-card" @click="applyPreset('163')">
            <div class="preset-icon netease">N</div>
            <div class="preset-info">
              <h4>网易邮箱</h4>
              <p>smtp.163.com:465</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-view {
  padding: var(--spacing-xl);
}

.page-header {
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

.settings-content {
  max-width: 800px;
}

.settings-section {
  background: var(--surface-container-lowest);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow);
  border: 1px solid var(--outline-variant);
  margin-bottom: var(--spacing-xl);
}

.section-header {
  margin-bottom: var(--spacing-lg);
}

.section-title {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--on-surface);
  font-family: var(--font-headline);
  margin-bottom: var(--spacing-xs);
}

.section-description {
  font-size: var(--text-sm);
  color: var(--on-surface-variant);
}

.config-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
}

.form-label {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--on-surface);
}

.form-input {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  background: var(--surface-container-low);
  color: var(--on-surface);
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0, 72, 141, 0.1);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--text-sm);
  color: var(--on-surface);
  cursor: pointer;
}

.checkbox-input {
  width: 16px;
  height: 16px;
  accent-color: var(--primary);
}

.form-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.primary-button,
.secondary-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
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

.secondary-button {
  background: var(--surface-container-lowest);
  color: var(--on-surface-variant);
  border: 1px solid var(--outline-variant);
}

.secondary-button:hover {
  background: var(--surface-container);
  color: var(--on-surface);
}

.test-result {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
}

.test-result.success {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.test-result.error {
  background: rgba(255, 59, 48, 0.1);
  color: #ff3b30;
  border: 1px solid rgba(255, 59, 48, 0.2);
}

.presets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.preset-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--surface-container-low);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s ease;
}

.preset-card:hover {
  background: var(--surface-container);
  border-color: var(--primary);
  transform: translateY(-1px);
}

.preset-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: var(--text-lg);
  color: white;
}

.preset-icon.gmail {
  background: linear-gradient(135deg, #ea4335 0%, #fbbc05 100%);
}

.preset-icon.outlook {
  background: linear-gradient(135deg, #0078d4 0%, #00bcf2 100%);
}

.preset-icon.qq {
  background: linear-gradient(135deg, #12b7f5 0%, #00d4aa 100%);
}

.preset-icon.netease {
  background: linear-gradient(135deg, #d44c4c 0%, #f37736 100%);
}

.preset-info h4 {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--on-surface);
  margin-bottom: 2px;
}

.preset-info p {
  font-size: var(--text-xs);
  color: var(--on-surface-variant);
  font-family: monospace;
}
</style>