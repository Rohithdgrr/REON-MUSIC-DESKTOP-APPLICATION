# Phase 2: Enhanced Playback Implementation

## 🎯 Overview
Phase 2 focuses on advanced audio playback features to enhance the listening experience.

**Features**:
1. ⏳ Crossfade - Smooth transitions between songs
2. ⏳ Equalizer - 10-band EQ with presets
3. ⏳ Sleep Timer - Auto-stop after duration
4. ⏳ Gapless Playback - No silence between tracks
5. ⏳ Audio Effects - Bass boost, normalization, speed control

**Estimated Time**: 2-3 weeks  
**Priority**: High  
**Dependencies**: Web Audio API

---

## 1. Crossfade ⏳

### Overview
Smooth volume transitions between songs for seamless listening.

### Implementation

#### File: `src/composables/useCrossfade.js`
```javascript
import { ref } from 'vue'

export function useCrossfade() {
  const crossfadeDuration = ref(3) // seconds
  const isEnabled = ref(true)
  
  function crossfade(currentAudio, nextAudio, duration) {
    // Fade out current
    // Fade in next
    // Overlap by duration
  }
  
  return {
    crossfadeDuration,
    isEnabled,
    crossfade
  }
}
```

#### Update: `src/utils/audioManager.js`
- Add crossfade support
- Manage two Howl instances for overlap
- Smooth volume transitions

### Features
- Configurable duration (0-10 seconds)
- Enable/disable toggle
- Smart crossfade (skip silence)
- Manual crossfade trigger

---

## 2. Equalizer ⏳

### Overview
10-band equalizer with presets for audio customization.

### Implementation

#### File: `src/components/EqualizerPanel.vue`
```vue
<template>
  <div class="equalizer-panel">
    <div class="eq-header">
      <h3>Equalizer</h3>
      <select v-model="currentPreset">
        <option>Flat</option>
        <option>Rock</option>
        <option>Pop</option>
        <option>Jazz</option>
        <option>Classical</option>
        <option>Bass Boost</option>
        <option>Treble Boost</option>
        <option>Vocal</option>
        <option>Custom</option>
      </select>
    </div>
    
    <div class="eq-bands">
      <div v-for="band in bands" :key="band.frequency" class="eq-band">
        <input
          type="range"
          :value="band.gain"
          @input="updateBand(band.frequency, $event.target.value)"
          min="-12"
          max="12"
          step="0.1"
          orient="vertical"
        />
        <span>{{ band.frequency }}Hz</span>
      </div>
    </div>
    
    <div class="eq-actions">
      <button @click="resetEQ">Reset</button>
      <button @click="savePreset">Save Preset</button>
    </div>
  </div>
</template>
```

#### File: `src/composables/useEqualizer.js`
```javascript
import { ref, reactive } from 'vue'

export function useEqualizer(audioContext) {
  const bands = reactive([
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
  
  function applyPreset(presetName) {
    const preset = presets[presetName]
    bands.forEach((band, i) => {
      band.gain = preset[i]
    })
  }
  
  function updateBand(frequency, gain) {
    const band = bands.find(b => b.frequency === frequency)
    if (band) band.gain = parseFloat(gain)
  }
  
  function resetEQ() {
    applyPreset('flat')
  }
  
  return {
    bands,
    presets,
    applyPreset,
    updateBand,
    resetEQ
  }
}
```

### Features
- 10-band equalizer (32Hz - 16kHz)
- 8 built-in presets
- Custom preset saving
- Real-time audio processing
- Visual frequency response
- Enable/disable toggle

---

## 3. Sleep Timer ⏳

### Overview
Automatically stop playback after a specified duration.

### Implementation

#### File: `src/components/SleepTimer.vue`
```vue
<template>
  <div class="sleep-timer">
    <button @click="showTimer = !showTimer" class="timer-btn">
      <svg><!-- clock icon --></svg>
      <span v-if="isActive">{{ remainingTime }}</span>
    </button>
    
    <div v-if="showTimer" class="timer-popup">
      <h4>Sleep Timer</h4>
      <div class="timer-options">
        <button @click="setTimer(15)">15 min</button>
        <button @click="setTimer(30)">30 min</button>
        <button @click="setTimer(45)">45 min</button>
        <button @click="setTimer(60)">1 hour</button>
        <button @click="setTimer(90)">1.5 hours</button>
        <button @click="setTimer(120)">2 hours</button>
      </div>
      
      <div class="custom-timer">
        <input
          v-model="customMinutes"
          type="number"
          min="1"
          max="480"
          placeholder="Custom minutes"
        />
        <button @click="setTimer(customMinutes)">Set</button>
      </div>
      
      <button v-if="isActive" @click="cancelTimer" class="cancel-btn">
        Cancel Timer
      </button>
    </div>
  </div>
</template>
```

#### File: `src/composables/useSleepTimer.js`
```javascript
import { ref, computed } from 'vue'

export function useSleepTimer(playerStore) {
  const endTime = ref(null)
  const remainingSeconds = ref(0)
  let timerInterval = null
  
  const isActive = computed(() => endTime.value !== null)
  
  const remainingTime = computed(() => {
    const mins = Math.floor(remainingSeconds.value / 60)
    const secs = remainingSeconds.value % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  })
  
  function setTimer(minutes) {
    endTime.value = Date.now() + (minutes * 60 * 1000)
    remainingSeconds.value = minutes * 60
    
    if (timerInterval) clearInterval(timerInterval)
    
    timerInterval = setInterval(() => {
      remainingSeconds.value = Math.max(0, Math.floor((endTime.value - Date.now()) / 1000))
      
      if (remainingSeconds.value <= 0) {
        stopPlayback()
      }
    }, 1000)
  }
  
  function cancelTimer() {
    endTime.value = null
    remainingSeconds.value = 0
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }
  
  function stopPlayback() {
    playerStore.togglePlay() // Pause
    cancelTimer()
    // Optional: fade out volume
  }
  
  return {
    isActive,
    remainingTime,
    remainingSeconds,
    setTimer,
    cancelTimer
  }
}
```

### Features
- Quick presets (15, 30, 45, 60, 90, 120 minutes)
- Custom duration input
- Countdown display
- Cancel anytime
- Fade out option
- Notification when timer ends

---

## 4. Gapless Playback ⏳

### Overview
Eliminate silence between tracks for continuous listening.

### Implementation

#### Update: `src/utils/audioManager.js`
```javascript
class AudioManager {
  constructor() {
    this.currentHowl = null
    this.nextHowl = null
    this.gaplessEnabled = true
  }
  
  async loadNext(url) {
    if (!this.gaplessEnabled) return
    
    // Preload next track
    this.nextHowl = new Howl({
      src: [url],
      html5: true,
      preload: true,
      onload: () => {
        console.log('Next track preloaded for gapless')
      }
    })
  }
  
  playNext() {
    if (this.nextHowl) {
      // Seamless transition
      const currentTime = this.currentHowl.seek()
      const duration = this.currentHowl.duration()
      
      if (duration - currentTime < 0.1) {
        // Start next immediately
        this.currentHowl = this.nextHowl
        this.nextHowl = null
        this.currentHowl.play()
      }
    }
  }
}
```

### Features
- Preload next track
- Seamless transitions
- No silence gaps
- Buffer management
- Enable/disable toggle

---

## 5. Audio Effects ⏳

### Overview
Additional audio processing effects.

### Implementation

#### File: `src/composables/useAudioEffects.js`
```javascript
import { ref } from 'vue'

export function useAudioEffects(audioContext) {
  const bassBoost = ref(0) // 0-100
  const playbackSpeed = ref(1.0) // 0.5-2.0
  const pitchShift = ref(0) // -12 to +12 semitones
  const normalization = ref(false)
  
  // Bass Boost
  const bassFilter = audioContext.createBiquadFilter()
  bassFilter.type = 'lowshelf'
  bassFilter.frequency.value = 200
  
  function setBassBoost(value) {
    bassBoost.value = value
    bassFilter.gain.value = (value / 100) * 12 // 0-12dB
  }
  
  // Playback Speed
  function setPlaybackSpeed(speed) {
    playbackSpeed.value = Math.max(0.5, Math.min(2.0, speed))
    // Apply to Howl instance
  }
  
  // Normalization
  const compressor = audioContext.createDynamicsCompressor()
  compressor.threshold.value = -24
  compressor.knee.value = 30
  compressor.ratio.value = 12
  compressor.attack.value = 0.003
  compressor.release.value = 0.25
  
  function toggleNormalization() {
    normalization.value = !normalization.value
    // Connect/disconnect compressor
  }
  
  return {
    bassBoost,
    playbackSpeed,
    pitchShift,
    normalization,
    setBassBoost,
    setPlaybackSpeed,
    toggleNormalization
  }
}
```

#### File: `src/components/AudioEffectsPanel.vue`
```vue
<template>
  <div class="audio-effects">
    <h3>Audio Effects</h3>
    
    <!-- Bass Boost -->
    <div class="effect-control">
      <label>Bass Boost</label>
      <input
        type="range"
        v-model="bassBoost"
        min="0"
        max="100"
        @input="setBassBoost($event.target.value)"
      />
      <span>{{ bassBoost }}%</span>
    </div>
    
    <!-- Playback Speed -->
    <div class="effect-control">
      <label>Speed</label>
      <input
        type="range"
        v-model="playbackSpeed"
        min="0.5"
        max="2.0"
        step="0.1"
        @input="setPlaybackSpeed($event.target.value)"
      />
      <span>{{ playbackSpeed }}x</span>
    </div>
    
    <!-- Normalization -->
    <div class="effect-control">
      <label>Normalization</label>
      <input
        type="checkbox"
        v-model="normalization"
        @change="toggleNormalization"
      />
    </div>
  </div>
</template>
```

### Features
- Bass boost (0-100%)
- Playback speed (0.5x - 2.0x)
- Volume normalization
- Pitch shift (future)
- Reverb (future)
- Echo (future)

---

## 📦 Dependencies

### Already Available
- ✅ Howler.js - Audio playback
- ✅ Web Audio API - Audio processing

### To Install
```bash
# No additional dependencies needed
# Web Audio API is built into browsers
```

---

## 🎨 UI Integration

### PlayerBar Updates
Add buttons for:
- Equalizer toggle
- Sleep timer
- Audio effects
- Crossfade settings

### Settings Panel
Create unified settings panel with tabs:
- Playback
- Audio Quality
- Equalizer
- Effects
- Advanced

---

## 🧪 Testing Checklist

### Crossfade
- [ ] Smooth volume transitions
- [ ] Configurable duration
- [ ] No audio glitches
- [ ] Works with all formats

### Equalizer
- [ ] All bands adjust correctly
- [ ] Presets apply properly
- [ ] Custom presets save
- [ ] Real-time updates
- [ ] No audio distortion

### Sleep Timer
- [ ] Countdown accurate
- [ ] Playback stops on time
- [ ] Cancel works
- [ ] Persists across songs
- [ ] Notification shows

### Gapless Playback
- [ ] No silence between tracks
- [ ] Preloading works
- [ ] Seamless transitions
- [ ] Buffer management
- [ ] Works with queue

### Audio Effects
- [ ] Bass boost works
- [ ] Speed control works
- [ ] Normalization works
- [ ] No audio artifacts
- [ ] Settings persist

---

## 🚀 Implementation Order

1. **Sleep Timer** (Easiest, 2-3 hours)
   - Simple timer logic
   - Minimal UI
   - No audio processing

2. **Audio Effects** (Medium, 4-6 hours)
   - Web Audio API integration
   - Bass boost and speed control
   - Settings UI

3. **Equalizer** (Medium-Hard, 8-10 hours)
   - 10-band implementation
   - Preset system
   - Visual UI

4. **Gapless Playback** (Hard, 6-8 hours)
   - Preloading logic
   - Seamless transitions
   - Buffer management

5. **Crossfade** (Hard, 6-8 hours)
   - Dual audio instances
   - Volume automation
   - Timing synchronization

**Total Estimated Time**: 26-35 hours

---

## 📊 Success Criteria

### Sleep Timer
✅ Timer counts down accurately  
✅ Playback stops on time  
✅ UI shows remaining time  
✅ Can be cancelled anytime

### Equalizer
✅ All 10 bands functional  
✅ Presets work correctly  
✅ Real-time audio processing  
✅ Settings persist

### Crossfade
✅ Smooth transitions  
✅ No audio gaps  
✅ Configurable duration  
✅ Works with all songs

### Gapless Playback
✅ Zero silence between tracks  
✅ Preloading efficient  
✅ No buffer issues  
✅ Seamless experience

### Audio Effects
✅ Bass boost audible  
✅ Speed control works  
✅ Normalization effective  
✅ No distortion

---

This document provides the complete implementation plan for Phase 2! 🎵✨
