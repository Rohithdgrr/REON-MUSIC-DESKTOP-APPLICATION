<template>
  <div class="sleep-timer">
    <button @click="showTimer = !showTimer" class="timer-btn" :class="{ active: isActive }" title="Sleep Timer">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z"/>
      </svg>
      <span v-if="isActive" class="timer-badge">{{ remainingTime }}</span>
    </button>
    
    <transition name="fade">
      <div v-if="showTimer" class="timer-popup">
        <div class="timer-header">
          <h4>Sleep Timer</h4>
          <button @click="showTimer = false" class="close-btn">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        
        <div v-if="!isActive" class="timer-content">
          <p class="timer-description">Stop playback after:</p>
          
          <div class="timer-options">
            <button @click="setTimer(15)" class="timer-option">
              <span class="time">15</span>
              <span class="unit">min</span>
            </button>
            <button @click="setTimer(30)" class="timer-option">
              <span class="time">30</span>
              <span class="unit">min</span>
            </button>
            <button @click="setTimer(45)" class="timer-option">
              <span class="time">45</span>
              <span class="unit">min</span>
            </button>
            <button @click="setTimer(60)" class="timer-option">
              <span class="time">1</span>
              <span class="unit">hour</span>
            </button>
            <button @click="setTimer(90)" class="timer-option">
              <span class="time">1.5</span>
              <span class="unit">hours</span>
            </button>
            <button @click="setTimer(120)" class="timer-option">
              <span class="time">2</span>
              <span class="unit">hours</span>
            </button>
          </div>
          
          <div class="custom-timer">
            <input
              v-model.number="customMinutes"
              type="number"
              min="1"
              max="480"
              placeholder="Custom minutes"
              @keyup.enter="setTimer(customMinutes)"
            />
            <button @click="setTimer(customMinutes)" :disabled="!customMinutes || customMinutes <= 0">
              Set
            </button>
          </div>
          
          <div class="timer-settings">
            <label class="checkbox-label">
              <input type="checkbox" v-model="fadeOutEnabled" @change="toggleFadeOut" />
              <span>Fade out (30s)</span>
            </label>
          </div>
        </div>
        
        <div v-else class="timer-active">
          <div class="timer-display">
            <svg viewBox="0 0 24 24" fill="currentColor" class="timer-icon">
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z"/>
            </svg>
            <div class="time-remaining">{{ remainingTime }}</div>
            <p class="timer-label">remaining</p>
          </div>
          
          <button @click="cancelTimer" class="cancel-btn">
            Cancel Timer
          </button>
        </div>
      </div>
    </transition>
    
    <div v-if="showTimer" class="timer-overlay" @click="showTimer = false"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePlayerStore } from '../stores/player.js'
import { useSleepTimer } from '../composables/useSleepTimer.js'

const player = usePlayerStore()
const { isActive, remainingTime, fadeOutEnabled, setTimer, cancelTimer, toggleFadeOut } = useSleepTimer(player)

const showTimer = ref(false)
const customMinutes = ref(null)

function handleSetTimer(minutes) {
  setTimer(minutes)
  customMinutes.value = null
}
</script>

<style scoped>
.sleep-timer {
  position: relative;
}

.timer-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all var(--transition-fast);
  position: relative;
}

.timer-btn svg {
  width: 20px;
  height: 20px;
}

.timer-btn:hover {
  color: var(--color-text);
  background: var(--color-surface-hover);
}

.timer-btn.active {
  color: var(--color-primary);
}

.timer-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--color-primary);
  color: white;
  font-size: 9px;
  font-weight: 700;
  padding: 2px 4px;
  border-radius: 8px;
  min-width: 32px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.timer-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
}

.timer-popup {
  position: absolute;
  bottom: calc(100% + 12px);
  right: 0;
  width: 320px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  z-index: 1000;
  overflow: hidden;
}

.timer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--color-border);
}

.timer-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text);
}

.close-btn {
  background: none;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.close-btn svg {
  width: 18px;
  height: 18px;
  color: var(--color-text-muted);
}

.close-btn:hover {
  background: var(--color-surface-hover);
}

.timer-content {
  padding: var(--space-lg);
}

.timer-description {
  margin: 0 0 var(--space-md) 0;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.timer-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.timer-option {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  transition: all var(--transition-fast);
}

.timer-option:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

.timer-option .time {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
}

.timer-option .unit {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.custom-timer {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.custom-timer input {
  flex: 1;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.875rem;
}

.custom-timer input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.custom-timer button {
  padding: var(--space-sm) var(--space-lg);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.custom-timer button:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.custom-timer button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.timer-settings {
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--color-text);
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.timer-active {
  padding: var(--space-xl);
  text-align: center;
}

.timer-display {
  margin-bottom: var(--space-lg);
}

.timer-icon {
  width: 64px;
  height: 64px;
  color: var(--color-primary);
  margin-bottom: var(--space-md);
}

.time-remaining {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
  margin-bottom: var(--space-xs);
}

.timer-label {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.cancel-btn {
  width: 100%;
  padding: var(--space-md);
  border: 1px solid var(--color-error);
  border-radius: var(--radius-md);
  background: rgba(244, 67, 54, 0.1);
  color: var(--color-error);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.cancel-btn:hover {
  background: rgba(244, 67, 54, 0.2);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-normal);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .timer-popup {
    right: auto;
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>
