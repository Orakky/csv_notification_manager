<script setup>
import { ViewTypes } from '../types';

const props = defineProps({
  currentView: {
    type: String,
    default: 'dashboard'
  }
});

const emit = defineEmits(['view-change']);

function navigateTo(view) {
  emit('view-change', view);
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="brand-logo">
        <div class="brand-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <span class="brand-name">Data Architect</span>
      </div>
    </div>
    
    <nav class="sidebar-nav">
      <button 
        @click="navigateTo(ViewTypes.DASHBOARD)" 
        :class="['nav-item', { active: currentView === ViewTypes.DASHBOARD }]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
        </svg>
        <span>Dashboard</span>
      </button>
      
      <button 
        @click="navigateTo(ViewTypes.IMPORT)" 
        :class="['nav-item', { active: currentView === ViewTypes.IMPORT }]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <span>Data Import</span>
      </button>
      
      <button 
        @click="navigateTo(ViewTypes.HISTORY)" 
        :class="['nav-item', { active: currentView === ViewTypes.HISTORY }]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <span>History</span>
      </button>
      
      <button 
        @click="navigateTo(ViewTypes.TEMPLATES)" 
        :class="['nav-item', { active: currentView === ViewTypes.TEMPLATES }]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
        <span>Message Templates</span>
      </button>
      
      <button 
        @click="navigateTo(ViewTypes.SETTINGS)" 
        :class="['nav-item', { active: currentView === ViewTypes.SETTINGS }]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
        <span>Settings</span>
      </button>
      
      <button 
        @click="navigateTo('send-history')" 
        :class="['nav-item', { active: currentView === 'send-history' }]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <span>Send History</span>
      </button>
      
      <button 
        @click="navigateTo('query-manager')" 
        :class="['nav-item', { active: currentView === 'query-manager' || currentView === 'query-config' || currentView === 'query' || currentView === 'query-result' }]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <span>Query</span>
      </button>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 256px;
  background: #f1f5f9;
  border-right: 1px solid var(--outline-variant);
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  z-index: 40;
  font-family: var(--font-headline);
  font-weight: 500;
  font-size: var(--text-base);
}

.sidebar-header {
  padding: var(--spacing-lg);
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.brand-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--on-primary);
  box-shadow: 0 4px 12px rgba(0, 72, 141, 0.3);
}

.brand-name {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--on-background);
  letter-spacing: -0.5px;
}

.sidebar-nav {
  flex: 1;
  padding: 0 var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--on-surface-variant);
  font-size: var(--text-base);
  font-family: var(--font-headline);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: var(--surface-container-high);
  color: var(--on-surface);
}

.nav-item.active {
  background: var(--primary);
  color: var(--on-primary);
  box-shadow: 0 2px 8px rgba(0, 72, 141, 0.3);
}
</style>