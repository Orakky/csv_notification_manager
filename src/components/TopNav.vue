<script setup>
</script>

<template>
  <header class="top-nav">
    <div class="nav-left">
      <h1 class="page-title">CSV/Excel Notification Manager</h1>
    </div>
  </header>
</template>

<style scoped>
.top-nav {
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-xl);
  height: 64px;
  background: var(--surface-container-lowest);
  border-bottom: 1px solid var(--outline-variant);
  position: sticky;
  top: 0;
  z-index: 30;
  box-shadow: var(--shadow);
}

.nav-left {
  flex: 1;
}

.page-title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--on-surface);
  margin: 0;
}
</style>