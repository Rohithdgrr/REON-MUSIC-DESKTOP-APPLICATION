<template>
  <Teleport to="body">
    <Transition name="ctx-fade">
      <div v-if="visible" class="ctx-backdrop" @click="close" @contextmenu.prevent="close"></div>
    </Transition>
    <Transition name="ctx-scale">
      <div v-if="visible" class="ctx-menu" :style="menuStyle" @click.stop>
        <button v-for="item in items" :key="item.label" class="ctx-item" @click="item.action(); close()">
          <span v-if="item.icon" class="ctx-icon" v-html="item.icon"></span>
          <span>{{ item.label }}</span>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, watch } from 'vue'

const props = defineProps({
  visible: Boolean,
  x: Number,
  y: Number,
  items: { type: Array, default: () => [] }
})

const emit = defineEmits(['close'])

const menuStyle = computed(() => {
  return { left: `${props.x}px`, top: `${props.y}px` }
})

function close() {
  emit('close')
}
</script>

<style scoped>
.ctx-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: transparent;
}
.ctx-menu {
  position: fixed;
  z-index: 10000;
  min-width: 180px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 6px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
}
.ctx-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: none;
  color: var(--color-text);
  font-size: 13px;
  cursor: pointer;
  border-radius: 8px;
  text-align: left;
  transition: background 0.15s;
}
.ctx-item:hover {
  background: var(--color-surface-hover);
}
.ctx-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: var(--color-text-muted);
}
.ctx-icon :deep(svg) {
  width: 18px;
  height: 18px;
}
.ctx-fade-enter-active, .ctx-fade-leave-active { transition: opacity 0.15s; }
.ctx-fade-enter-from, .ctx-fade-leave-to { opacity: 0; }
.ctx-scale-enter-active { transition: all 0.15s ease-out; }
.ctx-scale-leave-active { transition: all 0.1s ease-in; }
.ctx-scale-enter-from, .ctx-scale-leave-to { opacity: 0; transform: scale(0.95); }
</style>
