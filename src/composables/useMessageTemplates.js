import { ref, computed } from 'vue';

// 消息模板数据
const templates = ref([]);

// 从 localStorage 加载模板
function loadTemplates() {
  const saved = localStorage.getItem('messageTemplates');
  if (saved) {
    try {
      templates.value = JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load templates:', e);
      initDefaultTemplates();
    }
  } else {
    initDefaultTemplates();
  }
}

// 初始化默认模板
function initDefaultTemplates() {
  templates.value = [
    {
      id: Date.now(),
      name: '欢迎消息',
      content: '亲爱的{{name}}，欢迎使用我们的服务！如有任何问题，请随时联系我们。',
      isActive: true,
      usedCount: 0,
      createdAt: new Date().toISOString(),
      lastUsed: null
    },
    {
      id: Date.now() + 1,
      name: '活动通知',
      content: '尊敬的{{name}}，我们将于{{date}}举办特别活动，诚邀您参加！详情请访问：{{link}}',
      isActive: true,
      usedCount: 0,
      createdAt: new Date().toISOString(),
      lastUsed: null
    },
    {
      id: Date.now() + 2,
      name: '跟进提醒',
      content: '您好{{name}}，只是想确认一下您对我们的服务是否满意。如有任何建议，请告诉我们。',
      isActive: true,
      usedCount: 0,
      createdAt: new Date().toISOString(),
      lastUsed: null
    }
  ];
  saveTemplates();
}

// 保存模板到 localStorage
function saveTemplates() {
  localStorage.setItem('messageTemplates', JSON.stringify(templates.value));
}

// 创建新模板
function createTemplate(template) {
  const newTemplate = {
    id: Date.now(),
    name: template.name,
    content: template.content,
    isActive: true,
    usedCount: 0,
    createdAt: new Date().toISOString(),
    lastUsed: null
  };
  templates.value.unshift(newTemplate);
  saveTemplates();
  return newTemplate;
}

// 更新模板
function updateTemplate(id, updates) {
  const index = templates.value.findIndex(t => t.id === id);
  if (index !== -1) {
    templates.value[index] = { ...templates.value[index], ...updates };
    saveTemplates();
    return templates.value[index];
  }
  return null;
}

// 删除模板
function deleteTemplate(id) {
  templates.value = templates.value.filter(t => t.id !== id);
  saveTemplates();
}

// 使用模板（增加使用次数）
function useTemplate(id) {
  const template = templates.value.find(t => t.id === id);
  if (template) {
    template.usedCount++;
    template.lastUsed = new Date().toISOString();
    saveTemplates();
  }
}

// 获取活跃的模板
const activeTemplates = computed(() => {
  return templates.value.filter(t => t.isActive);
});

// 获取模板按使用次数排序
const popularTemplates = computed(() => {
  return [...templates.value]
    .filter(t => t.isActive)
    .sort((a, b) => b.usedCount - a.usedCount);
});

export function useMessageTemplates() {
  return {
    templates,
    activeTemplates,
    popularTemplates,
    loadTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    useTemplate,
    saveTemplates
  };
}