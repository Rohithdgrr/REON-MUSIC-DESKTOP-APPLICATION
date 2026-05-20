<template>
  <canvas ref="canvasRef" class="visualizer" :width="width" :height="height" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  width: { type: Number, default: 160 },
  height: { type: Number, default: 40 },
  barCount: { type: Number, default: 32 },
  color: { type: String, default: 'var(--color-primary)' }
})

const canvasRef = ref(null)
let analyser = null
let dataArray = null
let animFrame = null

function setupAnalyser() {
  try {
    const Howler = window.Howler
    if (!Howler?.ctx) return null
    const ctx = Howler.ctx
    let a = ctx.createAnalyser()
    a.fftSize = 256
    Howler.masterGain.connect(a)
    return a
  } catch {
    return null
  }
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  if (analyser && dataArray) {
    analyser.getByteFrequencyData(dataArray)
  }

  ctx.clearRect(0, 0, props.width, props.height)

  const bars = props.barCount
  const barW = (props.width - (bars - 1) * 2) / bars
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light'
  const colorVal = getComputedStyle(document.documentElement)
    .getPropertyValue(isDark ? '--color-primary' : '--color-primary')
    .trim() || '#6366f1'

  for (let i = 0; i < bars; i++) {
    let val = 0
    if (dataArray) {
      const idx = Math.floor(i * dataArray.length / bars)
      val = dataArray[idx] / 255
    } else {
      val = Math.sin(Date.now() / 300 + i * 0.5) * 0.3 + 0.4
    }
    const h = Math.max(2, val * props.height * 0.9)
    const x = i * (barW + 2)
    const y = props.height - h

    ctx.fillStyle = colorVal
    ctx.globalAlpha = 0.3 + val * 0.7
    ctx.beginPath()
    ctx.roundRect(x, y, barW, h, [2, 2, 0, 0])
    ctx.fill()
  }

  ctx.globalAlpha = 1
  animFrame = requestAnimationFrame(draw)
}

onMounted(() => {
  analyser = setupAnalyser()
  if (analyser) {
    dataArray = new Uint8Array(analyser.frequencyBinCount)
  }
  draw()
})

onUnmounted(() => {
  if (animFrame) cancelAnimationFrame(animFrame)
  if (analyser) {
    try { analyser.disconnect() } catch {}
  }
})
</script>

<style scoped>
.visualizer {
  display: block;
  flex-shrink: 0;
  border-radius: 6px;
  opacity: 0.7;
}
</style>
