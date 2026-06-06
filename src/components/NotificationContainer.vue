<template>
  <Teleport to="body">
    <div class="notification-container">
      <TransitionGroup name="notif">
        <div
          v-for="notif in notifications"
          :key="notif.id"
          class="notification"
          :class="notif.type"
          @click="removeNotification(notif.id)"
        >
          <div class="notif-content">
            <svg v-if="notif.type === 'success'" class="notif-icon success" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <svg v-else-if="notif.type === 'error'" class="notif-icon error" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <svg v-else class="notif-icon info" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <div class="notif-text">
              <span class="notif-title">{{ notif.title }}</span>
              <span v-if="notif.message" class="notif-message">{{ notif.message }}</span>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useNotifications } from '../composables/useNotifications.js'

const { notifications, removeNotification } = useNotifications()
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
  max-width: 380px;
}

.notification {
  pointer-events: auto;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  box-shadow: var(--shadow-xl);
  cursor: pointer;
  backdrop-filter: blur(16px);
  transition: all 0.3s ease;
}

.notification:hover {
  transform: translateX(-4px);
}

.notification.success {
  border-left: 3px solid #22c55e;
}

.notification.error {
  border-left: 3px solid #ef4444;
}

.notification.info {
  border-left: 3px solid var(--color-primary);
}

.notif-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.notif-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 1px;
}

.notif-icon.success { color: #22c55e; }
.notif-icon.error { color: #ef4444; }
.notif-icon.info { color: var(--color-primary); }

.notif-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.notif-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text);
}

.notif-message {
  font-size: 12px;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notif-enter-active {
  transition: all 0.3s ease;
}

.notif-leave-active {
  transition: all 0.2s ease;
}

.notif-enter-from {
  opacity: 0;
  transform: translateX(40px);
}

.notif-leave-to {
  opacity: 0;
  transform: translateX(40px);
}

@media (max-width: 600px) {
  .notification-container {
    top: auto;
    bottom: 16px;
    left: 12px;
    right: 12px;
    max-width: none;
    width: auto;
  }
  .notification { padding: 12px 14px; }
  .notif-message { white-space: normal; }
}

@media (max-width: 380px) {
  .notif-title { font-size: 12px; }
  .notif-message { font-size: 11px; }
}
</style>
