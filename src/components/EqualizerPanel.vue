<template>
  <div class="equalizer">
    <button @click="showEQ = !showEQ" class="eq-btn" :class="{ active: hasActiveEQ }" title="Equalizer">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 20h4V4h-4v16zm-6 0h4v-8H4v8zM16 9v11h4V9h-4z"/>
      </svg>
    </button>
    
    <transition name="fade">
      <div v-if="showEQ" class="eq-popup">
        <div class="eq-header">
          <h4>Equalizer</h4>
          <button @click="showEQ = false" class="close-btn">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        
        <div class="eq-content">
          <div class="preset-selector">
            <label>Preset:</label>
            <select v-model="currentPreset" @change="applyPreset">
              <option value="flat">Flat</option>
              <option value="rock">Rock</option>
              <option value="pop">Pop</option>
              <option value="jazz">Jazz</option>
              <option value="classical">Classical</option>
              <option value="bassBoost">Bass Boost</option>
              <option value="trebleBoost">Treble Boost</option>
              <option value="vocal">Vocal</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          
          <div class="eq-bands">
            <div v-for="(band, index) in bands" :key="band.frequency" class="eq-band">
              <input
                type="range"
                :value="band.gain"
                @input="updateBand(index, $event.target.value)"
                min="-12"
                max="12"
                step="0.5"
                orient="vertical"
                class="eq-slider"
              />
              <div class="gain-value">{{ band.gain > 0 ? '+' : '' }}{{ band.gain }}</div>
              <div class="frequency-label">{{ formatFrequency(band.frequency) }}</div>
            </div>
          </div>
          
          <div class="eq-actions">
            <button @click="resetEQ" class="reset-btn">Reset</button>
            <label class="eq-toggle">
              <input type="checkbox" v-model="enabled" />
              <span>Enable EQ</span>
            </label>
          </div>
        </div>
      </div>
    </transition>
    
    <div v-if="showEQ" class="eq-overlay" @click="showEQ = false"></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const showEQ = ref(false)
const enabled = ref(false)
const currentPreset = ref('flat')

const bands = ref([
  { frequency: 32, gain: 0 },
  { frequency: 64, gain: 0 },
  { frequency: 125, gain: 0 },
  { frequency: 250, gain: 0 },
  { frequency: 500, gain: 0 },
  { frequency: 1000, gain: 0 },
  { frequency: 2000, gain: 0 },
  { frequency: 4000, gain: 0 },
  { frequency: 8000, gain: 0 },
  { frequency: 16000, gain: 0 }
])

const presets = {
  flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  rock: [5, 4, 3, 1, -1, -1, 0, 2, 3, 4],
  pop: [2, 1, 0, -1, -2, -2, -1, 0, 1, 2],
  jazz: [4, 3, 2, 1, 0, 0, 0, 1, 2, 3],
  classical: [5, 4, 3, 2, 0, 0, -2, -2, -2, -3],
  bassBoost: [8, 6, 4, 2, 0, 0, 0, 0, 0, 0],
  trebleBoost: [0, 0, 0, 0, 0, 0, 2, 4, 6, 8],
  vocal: [-2, -1, 0, 1, 3, 3, 2, 1, 0, -1]
}

const hasActiveEQ = computed(() => {
  return enabled.value && bands.value.some(b => b.gain !== 0)
})

function updateBand(index, value) {
  bands.value[index].gain = parseFloat(value)
  currentPreset.value = 'custom'
}

function applyPreset() {
  const preset = presets[currentPreset.value]
  if (preset) {
    bands.value.forEach((band, i) => {
      band.gain = preset[i]
    })
  }
}

function resetEQ() {
  currentPreset.value = 'flat'
  applyPreset()
}

function formatFrequency(freq) {
  if (freq >= 1000) {
    return (freq / 1000) + 'k'
  }
  return freq + ''
}
</script>

<style scoped>
.equalizer {
  position: relative;
}

.eq-btn {
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

.eq-btn svg {
  width: 20px;
  height: 20px;
}

.eq-btn:hover {
  color: var(--color-text);
  background: var(--color-surface-hover);
}

.eq-btn.active {
  color: var(--color-primary);
}

.eq-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
}

.eq-popup {
  position: absolute;
  bottom: calc(100% + 12px);
  right: 0;
  width: 480px;
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

.eq-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--color-border);
}

.eq-header h4 {
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

.eq-content {
  padding: var(--space-lg);
}

.preset-selector {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.preset-selector label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
}

.preset-selector select {
  flex: 1;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.875rem;
  cursor: pointer;
}

.eq-bands {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: var(--space-sm);
  height: 200px;
  margin-bottom: var(--space-lg);
  padding: var(--space-md);
  background: rgba(0,0,0,0.1);
  border-radius: var(--radius-md);
  border: inset 1px rgba(0,0,0,0.2);
}

.eq-band {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  flex: 1;
}

.eq-slider {
  -webkit-appearance: slider-vertical;
  writing-mode: bt-lr;
  width: 6px;
  height: 140px;
  background: var(--color-surface-hover);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.2);
}

.eq-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  box-shadow: 0 0 10px rgba(249, 115, 22, 0.4);
  transition: transform var(--transition-fast);
}

.eq-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 0 15px rgba(249, 115, 22, 0.7);
}

.eq-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  border: none;
  box-shadow: 0 0 10px rgba(249, 115, 22, 0.4);
  transition: transform var(--transition-fast);
}

.eq-slider::-moz-range-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 0 15px rgba(249, 115, 22, 0.7);
}

.gain-value {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
  min-width: 30px;
  text-align: center;
}

.frequency-label {
  font-size: 0.65rem;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

.eq-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}

.reset-btn {
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.reset-btn:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-primary);
}

.eq-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
  cursor: pointer;
}

.eq-toggle input {
  width: 16px;
  height: 16px;
  cursor: pointer;
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
  .eq-popup {
    right: auto;
    left: 50%;
    transform: translateX(-50%);
    width: 90vw;
    max-width: 480px;
  }
}
</style>
