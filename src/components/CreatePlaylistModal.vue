<template>
  <ModalDialog v-model:show="visible" :title="title" size="md">
    <div class="create-playlist">
      <div class="preview-card" :style="previewStyle">
        <div class="preview-shine"></div>
        <div class="preview-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
          </svg>
        </div>
        <div class="preview-text">
          <span class="preview-label">PLAYLIST</span>
          <h3 class="preview-name">{{ name.trim() || 'My Playlist' }}</h3>
          <span class="preview-meta">0 songs · just now</span>
        </div>
      </div>

      <div class="form-section">
        <div class="form-field">
          <div class="field-header">
            <label class="field-label">Name</label>
            <span class="char-count" :class="{ warn: name.length > 60 }">{{ name.length }}/80</span>
          </div>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
            <input
              ref="nameInput"
              v-model="name"
              type="text"
              class="field-input"
              :placeholder="placeholder"
              maxlength="80"
              @input="clearError"
              @keyup.enter="handleCreate"
            />
          </div>
          <span v-if="error" class="field-error">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            {{ error }}
          </span>
        </div>

        <div class="form-field">
          <label class="field-label">Description <span class="optional">optional</span></label>
          <textarea
            v-model="description"
            class="field-textarea"
            placeholder="What's this playlist about?"
            rows="2"
            maxlength="200"
          />
        </div>

        <div class="form-field">
          <label class="field-label">Color</label>
          <div class="color-grid">
            <button
              v-for="c in colors"
              :key="c.id"
              type="button"
              class="color-swatch"
              :class="{ active: selectedColor === c.id }"
              :style="{ background: c.gradient }"
              :title="c.name"
              @click="selectedColor = c.id"
            >
              <svg v-if="selectedColor === c.id" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
          </div>
        </div>

        <div class="form-field" v-if="suggestions.length">
          <label class="field-label">Quick ideas</label>
          <div class="suggestion-chips">
            <button
              v-for="s in suggestions"
              :key="s"
              type="button"
              class="chip"
              @click="applySuggestion(s)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              {{ s }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <button class="btn btn-secondary" @click="visible = false">Cancel</button>
      <button class="btn btn-primary" @click="handleCreate" :disabled="!canCreate">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        {{ actionLabel }}
      </button>
    </template>
  </ModalDialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import ModalDialog from './ModalDialog.vue'
import { useLibraryStore } from '../stores/library.js'

const props = defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: 'New Playlist' },
  actionLabel: { type: String, default: 'Create' },
  placeholder: { type: String, default: 'Give it a name' }
})

const emit = defineEmits(['update:show', 'created'])

const library = useLibraryStore()

const visible = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val)
})

const nameInput = ref(null)
const name = ref('')
const description = ref('')
const error = ref('')
const selectedColor = ref('indigo')

const colors = [
  { id: 'indigo', name: 'Indigo', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
  { id: 'pink', name: 'Pink', gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)' },
  { id: 'orange', name: 'Sunset', gradient: 'linear-gradient(135deg, #f97316, #ef4444)' },
  { id: 'amber', name: 'Warm', gradient: 'linear-gradient(135deg, #f59e0b, #f97316)' },
  { id: 'emerald', name: 'Forest', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
  { id: 'cyan', name: 'Ocean', gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)' },
  { id: 'slate', name: 'Midnight', gradient: 'linear-gradient(135deg, #475569, #1e293b)' },
  { id: 'fuchsia', name: 'Neon', gradient: 'linear-gradient(135deg, #d946ef, #6366f1)' }
]

const suggestions = [
  'Chill Vibes',
  'Workout Mix',
  'Late Night',
  'Focus Flow',
  'Road Trip',
  'Sunday Mood'
]

const activeGradient = computed(() => {
  return colors.find(c => c.id === selectedColor.value)?.gradient || colors[0].gradient
})

const previewStyle = computed(() => ({
  background: activeGradient.value
}))

const duplicateExists = computed(() => {
  const trimmed = name.value.trim().toLowerCase()
  if (!trimmed) return false
  return library.playlists.some(p => p.name.toLowerCase() === trimmed)
})

const canCreate = computed(() => {
  return name.value.trim().length > 0 && !duplicateExists.value
})

function clearError() {
  if (error.value) error.value = ''
}

function applySuggestion(suggestion) {
  name.value = suggestion
  clearError()
  nextTick(() => nameInput.value?.focus())
}

async function handleCreate() {
  if (!canCreate.value) return
  const trimmed = name.value.trim()
  const desc = description.value.trim()
  const result = await library.createPlaylist(trimmed, desc, selectedColor.value)
  if (result.success) {
    emit('created', result.data)
    name.value = ''
    description.value = ''
    selectedColor.value = 'indigo'
    visible.value = false
  } else {
    error.value = result.error || 'Failed to create playlist'
  }
}

watch(() => props.show, (val) => {
  if (val) {
    name.value = ''
    description.value = ''
    error.value = ''
    selectedColor.value = 'indigo'
    nextTick(() => nameInput.value?.focus())
  }
})
</script>

<style scoped>
.create-playlist {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.preview-card {
  position: relative;
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  color: white;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  transition: background 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  min-height: 110px;
}

.preview-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, transparent 50%, rgba(0, 0, 0, 0.12) 100%);
  pointer-events: none;
}

.preview-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.preview-icon svg {
  width: 28px;
  height: 28px;
  color: white;
}

.preview-text {
  flex: 1;
  min-width: 0;
  z-index: 1;
}

.preview-label {
  display: block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  opacity: 0.85;
  margin-bottom: 4px;
}

.preview-name {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
}

.preview-meta {
  font-size: 12px;
  font-weight: 500;
  opacity: 0.85;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.field-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.optional {
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  opacity: 0.6;
  margin-left: 4px;
}

.char-count {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
}

.char-count.warn {
  color: var(--color-error);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  width: 16px;
  height: 16px;
  color: var(--color-text-muted);
  pointer-events: none;
  z-index: 1;
}

.field-input {
  width: 100%;
  padding: 10px 12px 10px 38px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 14px;
  font-weight: 500;
  outline: none;
  transition: all var(--transition-fast);
  box-sizing: border-box;
}

.field-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.field-input::placeholder {
  color: var(--color-text-muted);
  font-weight: 400;
}

.field-textarea {
  width: 100%;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 13px;
  line-height: 1.5;
  outline: none;
  resize: vertical;
  font-family: inherit;
  transition: border-color var(--transition-fast);
  box-sizing: border-box;
}

.field-textarea:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.field-textarea::placeholder {
  color: var(--color-text-muted);
}

.field-error {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-error);
  font-weight: 500;
  animation: shake 0.3s ease;
}

.field-error svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  75% { transform: translateX(3px); }
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
}

.color-swatch {
  position: relative;
  aspect-ratio: 1;
  border: 2px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  padding: 0;
  outline: none;
}

.color-swatch svg {
  width: 18px;
  height: 18px;
  color: white;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
  opacity: 0;
  transform: scale(0.6);
  transition: all var(--transition-fast);
}

.color-swatch:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.color-swatch.active {
  border-color: white;
  box-shadow: 0 0 0 2px var(--color-primary), 0 4px 12px rgba(0, 0, 0, 0.25);
  transform: translateY(-2px);
}

.color-swatch.active svg {
  opacity: 1;
  transform: scale(1);
}

.suggestion-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 11px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.chip svg {
  width: 12px;
  height: 12px;
}

.chip:hover {
  background: rgba(99, 102, 241, 0.08);
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: translateY(-1px);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all var(--transition-fast);
}

.btn svg {
  width: 14px;
  height: 14px;
}

.btn-secondary {
  background: var(--color-surface-hover);
  color: var(--color-text-muted);
}

.btn-secondary:hover {
  background: var(--color-border);
  color: var(--color-text);
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: white;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}

.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
</style>
