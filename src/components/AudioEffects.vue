<template>
  <div class="audio-effects">
    <button @click="showEffects = !showEffects" class="effects-btn" :class="{ active: hasActiveEffects }" title="Audio Effects">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
      </svg>
    </button>
    
    <transition name="fade">
      <div v-if="showEffects" class="effects-popup">
        <div class="effects-header">
          <h4>Audio Effects</h4>
          <button @click="showEffects = false" class="close-btn">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        
        <div class="effects-content">
          <!-- Bass Boost -->
          <div class="effect-control">
            <div class="effect-label">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
              </svg>
              <span>Bass Boost</span>
            </div>
            <div class="slider-container">
              <input
                type="range"
                v-model.number="localBassBoost"
                @input="handleBassBoost"
                min="0"
                max="100"
                step="1"
                class="effect-slider"
              />
              <span class="value-display">{{ localBassBoost }}%</span>
            </div>
          </div>
          
          <!-- Playback Speed -->
          <div class="effect-control">
            <div class="effect-label">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 8V2H7v6H2l8 8 8-8h-5zM7 22h10v-2H7v2z"/>
              </svg>
              <span>Playback Speed</span>
            </div>
            <div class="slider-container">
              <input
                type="range"
                v-model.number="localSpeed"
                @input="handleSpeed"
                min="0.5"
                max="2.0"
                step="0.1"
                class="effect-slider"
              />
              <span class="value-display">{{ localSpeed.toFixed(1) }}x</span>
            </div>
            <div class="speed-presets">
              <button @click="setSpeed(0.5)" :class="{ active: localSpeed === 0.5 }">0.5x</button>
              <button @click="setSpeed(0.75)" :class="{ active: localSpeed === 0.75 }">0.75x</button>
              <button @click="setSpeed(1.0)" :class="{ active: localSpeed === 1.0 }">1.0x</button>
              <button @click="setSpeed(1.25)" :class="{ active: localSpeed === 1.25 }">1.25x</button>
              <button @click="setSpeed(1.5)" :class="{ active: localSpeed === 1.5 }">1.5x</button>
              <button @click="setSpeed(2.0)" :class="{ active: localSpeed === 2.0 }">2.0x</button>
            </div>
          </div>
          
          <!-- Normalization -->
          <div class="effect-control">
            <div class="effect-label">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 20h4V4h-4v16zm-6 0h4v-8H4v8zM16 9v11h4V9h-4z"/>
              </svg>
              <span>Volume Normalization</span>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="localNormalization" @change="handleNormalization" />
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <!-- Reset Button -->
          <div class="effects-actions">
            <button @click="handleReset" class="reset-btn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
              </svg>
              Reset All
            </button>
          </div>
        </div>
      </div>
    </transition>
    
    <div v-if="showEffects" class="effects-overlay" @click="showEffects = false"></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePlayerStore } from '../stores/player.js'
import { useAudioEffects } from '../composables/useAudioEffects.js'

const player = usePlayerStore()
const { bassBoost, playbackSpeed, normalization, setBassBoost, setPlaybackSpeed, toggleNormalization, resetEffects } = useAudioEffects()

const showEffects = ref(false)
const localBassBoost = ref(bassBoost.value)
const localSpeed = ref(playbackSpeed.value)
const localNormalization = ref(normalization.value)

const hasActiveEffects = computed(() => {
  return bassBoost.value > 0 || playbackSpeed.value !== 1.0 || normalization.value
})

function handleBassBoost() {
  setBassBoost(localBassBoost.value, player.audioManager?.howl)
}

function handleSpeed() {
  setPlaybackSpeed(localSpeed.value, player.audioManager?.howl)
}

function setSpeed(speed) {
  localSpeed.value = speed
  handleSpeed()
}

function handleNormalization() {
  toggleNormalization(player.audioManager?.howl, player.volume)
}

function handleReset() {
  localBassBoost.value = 0
  localSpeed.value = 1.0
  localNormalization.value = false
  resetEffects(player.audioManager?.howl)
}
</script>

<style scoped>
.audio-effects {
  position: relative;
}

.effects-btn {
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
}

.effects-btn svg {
  width: 20px;
  height: 20px;
}

.effects-btn:hover {
  color: var(--color-text);
  background: var(--color-surface-hover);
}

.effects-btn.active {
  color: var(--color-primary);
}

.effects-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
}

.effects-popup {
  position: absolute;
  bottom: calc(100% + 12px);
  right: 0;
  width: 360px;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: var(--glass-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  z-index: 1000;
  overflow: hidden;
  animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) backwards;
}

.effects-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--color-border);
}

.effects-header h4 {
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

.effects-content {
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.effect-control {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.effect-label {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
}

.effect-label svg {
  width: 18px;
  height: 18px;
  color: var(--color-primary);
}

.slider-container {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.effect-slider {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  background: var(--color-surface-hover);
  border-radius: var(--radius-full);
  outline: none;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);
}

.effect-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.effect-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.effect-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  border: none;
  transition: all var(--transition-fast);
}

.effect-slider::-moz-range-thumb:hover {
  transform: scale(1.2);
}

.value-display {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
  min-width: 48px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.speed-presets {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: var(--space-xs);
}

.speed-presets button {
  padding: var(--space-xs);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.speed-presets button:hover {
  background: var(--color-surface-hover);
  border-color: rgba(255,255,255,0.15);
  transform: translateY(-2px);
}

.speed-presets button.active {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  border-color: transparent;
  color: white;
  box-shadow: var(--shadow-primary);
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: var(--color-border);
  transition: var(--transition-fast);
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: var(--transition-fast);
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: var(--color-primary);
}

input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

.effects-actions {
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}

.reset-btn {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  transition: all var(--transition-fast);
}

.reset-btn svg {
  width: 16px;
  height: 16px;
}

.reset-btn:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-primary);
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
  .effects-popup {
    right: auto;
    left: 50%;
    transform: translateX(-50%);
    width: 90vw;
    max-width: 360px;
  }
}
</style>
