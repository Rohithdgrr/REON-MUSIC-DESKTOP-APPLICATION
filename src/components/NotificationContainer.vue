<template>
  <div class="notification-container">
    <transition-group name="notification">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification"
        :class="`notification-${notification.type}`"
        @click="removeNotification(notification.id)"
      >
        <div class="notification-icon">
          <svg v-if="notification.type === 'success'" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
          <svg v-else-if="notification.type === 'error'" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <svg v-else-if="notification.type === 'warning'" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        </div>
        <div class="notification-content">
          <div class="notification-title">{{ notification.title }}</div>
          <div v-if="notification.message" class="notification-message">{{ notification.message }}</div>
        </div>
        <button class="notification-close">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useNotifications } from '../composables/useNotifications.js'

const { notifications, removeNotification } = useNotifications()
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: var(--space-lg);
  right: var(--space-lg);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  max-width: 400px;
}

.notification {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.notification:hover {
  transform: translateX(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.notification-success {
  border-left: 4px solid var(--color-success);
}

.notification-error {
  border-left: 4px solid var(--color-error);
}

.notification-warning {
  border-left: 4px solid var(--color-warning);
}

.notification-info {
  border-left: 4px solid var(--color-info);
}

.notification-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
}

.notification-success .notification-icon {
  color: var(--color-success);
}

.notification-error .notification-icon {
  color: var(--color-error);
}

.notification-warning .notification-icon {
  color: var(--color-warning);
}

.notification-info .notification-icon {
  color: var(--color-info);
}

.notification-icon svg {
  width: 100%;
  height: 100%;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-xs);
}

.notification-message {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  line-height: 1.4;
}

.notification-close {
  flex-shrink: 0;
  background: none;
  border: none;
  width: 20px;
  height: 20px;
  padding: 0;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: color var(--transition-fast);
}

.notification-close:hover {
  color: var(--color-text);
}

.notification-close svg {
  width: 100%;
  height: 100%;
}

.notification-enter-active,
.notification-leave-active {
  transition: all var(--transition-normal);
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

@media (max-width: 768px) {
  .notification-container {
    left: var(--space-md);
    right: var(--space-md);
    max-width: none;
  }
}
</style>
