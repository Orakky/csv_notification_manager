<script setup>
import { ref, onMounted } from 'vue';
import { useMessageTemplates } from '../composables/useMessageTemplates';
import { formatDate } from '../utils/formatters';

const {
  templates,
  activeTemplates,
  loadTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  useTemplate
} = useMessageTemplates();

const emit = defineEmits(['create-template', 'edit-template', 'delete-template', 'use-template']);

const showCreateModal = ref(false);
const showEditModal = ref(false);
const editingTemplate = ref(null);
const newTemplate = ref({
  name: '',
  content: ''
});

onMounted(() => {
  loadTemplates();
});

function handleCreateTemplate() {
  showCreateModal.value = true;
}

function handleEditTemplate(template) {
  editingTemplate.value = { ...template };
  showEditModal.value = true;
}

function handleDeleteTemplate(id) {
  if (confirm('确定要删除这个模板吗？')) {
    deleteTemplate(id);
  }
}

function handleUseTemplate(template) {
  useTemplate(template.id);
  emit('use-template', template);
}

function saveNewTemplate() {
  if (newTemplate.value.name && newTemplate.value.content) {
    createTemplate(newTemplate.value);
    newTemplate.value = { name: '', content: '' };
    showCreateModal.value = false;
  }
}

function saveEditedTemplate() {
  if (editingTemplate.value.name && editingTemplate.value.content) {
    updateTemplate(editingTemplate.value.id, {
      name: editingTemplate.value.name,
      content: editingTemplate.value.content
    });
    editingTemplate.value = null;
    showEditModal.value = false;
  }
}

function closeModals() {
  showCreateModal.value = false;
  showEditModal.value = false;
  editingTemplate.value = null;
  newTemplate.value = { name: '', content: '' };
}

function getTemplatePreview(content) {
  return content.length > 100 ? content.substring(0, 100) + '...' : content;
}
</script>

<template>
  <div class="templates-view">
    <div class="page-header">
      <div>
        <h1 class="page-title">Message Templates</h1>
        <p class="page-subtitle">Create and manage reusable message templates for your campaigns.</p>
      </div>
      <button @click="handleCreateTemplate" class="primary-button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        New Template
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="templates.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      </div>
      <h3 class="empty-title">还没有消息模板</h3>
      <p class="empty-description">创建您的第一个消息模板，快速生成标准化的通知消息。</p>
      <button @click="handleCreateTemplate" class="primary-button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        创建模板
      </button>
    </div>

    <!-- Templates Grid -->
    <div v-else class="templates-grid">
      <div 
        v-for="template in templates" 
        :key="template.id" 
        class="template-card"
        @click="handleUseTemplate(template)"
      >
        <div class="template-header">
          <h4 class="template-name">{{ template.name }}</h4>
          <span :class="['template-badge', { active: template.isActive }]">
            {{ template.isActive ? 'Active' : 'Inactive' }}
          </span>
        </div>
        <p class="template-content">{{ getTemplatePreview(template.content) }}</p>
        <div class="template-meta">
          <span>使用 {{ template.usedCount }} 次</span>
          <span>{{ template.lastUsed ? formatDate(template.lastUsed) : '从未使用' }}</span>
        </div>
        <div class="template-actions" @click.stop>
          <button @click="handleEditTemplate(template)" class="action-btn edit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit
          </button>
          <button @click="handleDeleteTemplate(template.id)" class="action-btn delete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            Delete
          </button>
        </div>
      </div>
      
      <!-- Add New Template Card -->
      <div class="template-card add-template" @click="handleCreateTemplate">
        <div class="add-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </div>
        <p class="add-title">Add New Template</p>
        <p class="add-description">点击创建新的消息模板</p>
      </div>
    </div>

    <!-- Create Template Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeModals">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">创建新模板</h3>
          <button @click="closeModals" class="modal-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">模板名称</label>
            <input 
              v-model="newTemplate.name"
              type="text"
              placeholder="输入模板名称"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label class="form-label">模板内容</label>
            <textarea 
              v-model="newTemplate.content"
              placeholder="输入消息模板内容，使用 {{列名}} 作为占位符"
              class="form-textarea"
              rows="6"
            ></textarea>
            <p class="form-hint">使用 {列名}} 格式作为动态内容占位符</p>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeModals" class="secondary-button">取消</button>
          <button @click="saveNewTemplate" class="primary-button" :disabled="!newTemplate.name || !newTemplate.content">
            创建模板
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Template Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeModals">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">编辑模板</h3>
          <button @click="closeModals" class="modal-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">模板名称</label>
            <input 
              v-model="editingTemplate.name"
              type="text"
              placeholder="输入模板名称"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label class="form-label">模板内容</label>
            <textarea 
              v-model="editingTemplate.content"
              placeholder="输入消息模板内容，使用 {{列名}} 作为占位符"
              class="form-textarea"
              rows="6"
            ></textarea>
            <p class="form-hint">使用 {{列名}} 格式作为动态内容占位符</p>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeModals" class="secondary-button">取消</button>
          <button @click="saveEditedTemplate" class="primary-button" :disabled="!editingTemplate.name || !editingTemplate.content">
            保存修改
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.templates-view {
  padding: var(--spacing-xl);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
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

.primary-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  color: var(--on-primary);
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 72, 141, 0.3);
}

.primary-button:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.primary-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.secondary-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--surface-container-lowest);
  color: var(--on-surface-variant);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.secondary-button:hover {
  background: var(--surface-container);
  color: var(--on-surface);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: var(--surface-container-low);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--on-surface-variant);
  margin-bottom: var(--spacing-lg);
}

.empty-title {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--on-surface);
  margin-bottom: var(--spacing-sm);
}

.empty-description {
  font-size: var(--text-base);
  color: var(--on-surface-variant);
  margin-bottom: var(--spacing-lg);
  max-width: 400px;
}

/* Templates Grid */
.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-lg);
}

.template-card {
  background: var(--surface-container-lowest);
  padding: var(--spacing-lg);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow);
  border: 1px solid var(--outline-variant);
  cursor: pointer;
  transition: all 0.2s ease;
}

.template-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary);
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.template-name {
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--on-surface);
  font-family: var(--font-headline);
}

.template-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  background: rgba(142, 142, 147, 0.1);
  color: #8e8e93;
}

.template-badge.active {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.template-content {
  font-size: var(--text-sm);
  color: var(--on-surface-variant);
  line-height: 1.5;
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--surface-container);
  border-radius: var(--radius-md);
  font-family: monospace;
}

.template-meta {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-xs);
  color: var(--on-surface-variant);
  margin-bottom: var(--spacing-md);
}

.template-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.edit {
  background: rgba(0, 72, 141, 0.1);
  color: var(--primary);
}

.action-btn.edit:hover {
  background: rgba(0, 72, 141, 0.2);
}

.action-btn.delete {
  background: rgba(255, 59, 48, 0.1);
  color: #ff3b30;
}

.action-btn.delete:hover {
  background: rgba(255, 59, 48, 0.2);
}

.add-template {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  border: 2px dashed var(--outline-variant);
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-template:hover {
  border-color: var(--primary);
  background: rgba(0, 72, 141, 0.05);
}

.add-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--surface-container);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--on-surface-variant);
  margin-bottom: var(--spacing-md);
}

.add-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--on-surface-variant);
  margin-bottom: var(--spacing-xs);
}

.add-description {
  font-size: var(--text-xs);
  color: var(--outline);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--surface-container-lowest);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--outline-variant);
}

.modal-title {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--on-surface);
  font-family: var(--font-headline);
}

.modal-close {
  padding: var(--spacing-sm);
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--on-surface-variant);
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: var(--surface-container);
  color: var(--on-surface);
}

.modal-body {
  padding: var(--spacing-lg);
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--on-surface);
  margin-bottom: var(--spacing-sm);
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

.form-textarea {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  resize: vertical;
  min-height: 120px;
  background: var(--surface-container-low);
  color: var(--on-surface);
  font-family: inherit;
  transition: all 0.2s ease;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0, 72, 141, 0.1);
}

.form-hint {
  font-size: var(--text-xs);
  color: var(--on-surface-variant);
  margin-top: var(--spacing-xs);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-top: 1px solid var(--outline-variant);
}
</style>