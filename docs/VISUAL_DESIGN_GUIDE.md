# Music Reon - Visual Design Guide

## 🎨 Screen-by-Screen Design

### 1. Home Screen

```
┌─────────────────────────────────────────────────────────────────┐
│ 🎵 Music Reon                                    🔍 Search  👤  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Welcome to Music Reon                                          │
│  Search for any song and start streaming instantly.            │
│                                                                  │
│  ┌─ Discover Music ──────────────────────────────────────────┐ │
│  │                                                             │ │
│  │  [🎵 Hindi]  [🎵 Telugu]  [🎵 Indian]  [🎵 Love]          │ │
│  │   Purple      Pink         Blue        Coral               │ │
│  │                                                             │ │
│  │  [🎵 Tamil]  [🎵 Punjabi] [🎵 Bollywood] [🎵 Devotional]  │ │
│  │   Teal       Aqua         Rose          Peach              │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─ Your Playlists ────────────────────────── See all ────────┐ │
│  │                                                             │ │
│  │  [🎵 Favorites]  [🎵 Workout]  [🎵 Chill]                 │ │
│  │   Gradient 1     Gradient 2    Gradient 3                  │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─ Recently Played ──────────────────────────────────────────┐ │
│  │                                                             │ │
│  │  🎵 Song Title 1                          Artist • 3:45    │ │
│  │  🎵 Song Title 2                          Artist • 4:12    │ │
│  │  🎵 Song Title 3                          Artist • 3:28    │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
│ 🎵 Now Playing: Song Title        ⏮ ⏯ ⏭  ━━━━●─────  🔊      │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Category View

```
┌─────────────────────────────────────────────────────────────────┐
│ ← [🎵 Hindi Songs]                                              │
│    Popular Hindi music                                          │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  152 songs                                    [▶ Play All]      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🎵 [Thumbnail] Song Title 1                                 ││
│  │               Artist Name • Album • 3:45                    ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 🎵 [Thumbnail] Song Title 2                                 ││
│  │               Artist Name • Album • 4:12                    ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ 🎵 [Thumbnail] Song Title 3                                 ││
│  │               Artist Name • Album • 3:28                    ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│                    [ Show More ]                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Player Bar (Expanded)

```
┌─────────────────────────────────────────────────────────────────┐
│ [Album Art]  Now Playing: Song Title                            │
│   80x80      Artist Name                                        │
│                                                                  │
│              🔀  ⏮  ⏯  ⏭  🔁                                   │
│                                                                  │
│              0:00 ━━━━━●──────────── 3:45                      │
│                                                                  │
│                                              🔊 ━━━●─── ♥ ⋯    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Color Usage Examples

### Primary Actions
```
✅ Play Button       → Spotify Green (#1db954)
✅ Active States     → Spotify Green
✅ Success Messages  → Spotify Green
```

### Secondary Actions
```
🔴 Like/Favorite     → Coral (#ff6b6b)
🔴 Delete/Remove     → Red (#e22134)
```

### Info & Links
```
🔵 Links             → Blue (#4a9eff)
🔵 Info Messages     → Blue
```

---

## ✨ Animation Examples

### 1. Card Hover
```
Normal State:
  - Background: #1a1a1a
  - Transform: none
  - Shadow: small

Hover State:
  - Background: #242424
  - Transform: translateY(-4px)
  - Shadow: large + glow
  - Duration: 250ms
  - Easing: cubic-bezier(0.4, 0, 0.2, 1)
```

### 2. Button Click
```
Normal → Hover:
  - Transform: translateY(-2px) scale(1.02)
  - Shadow: glow effect
  
Hover → Active:
  - Transform: translateY(0) scale(0.98)
  - Duration: 150ms
```

### 3. Track Row Hover
```
Normal State:
  - Background: transparent
  - Transform: translateX(0)

Hover State:
  - Background: #242424
  - Transform: translateX(4px)
  - Duration: 150ms
```

### 4. Page Transitions
```
Enter:
  - Opacity: 0 → 1
  - Transform: translateY(20px) → translateY(0)
  - Duration: 350ms
  - Easing: ease-out

Exit:
  - Opacity: 1 → 0
  - Transform: scale(1) → scale(0.95)
  - Duration: 250ms
```

---

## 🎯 Component Hierarchy

### Typography Scale
```
Hero Title:        48-64px (Poppins Bold)
Page Title:        32-40px (Poppins SemiBold)
Section Title:     20-24px (Inter SemiBold)
Card Title:        16-18px (Inter Medium)
Body Text:         14-16px (Inter Regular)
Caption:           12-14px (Inter Regular)
```

### Spacing Scale
```
Tight:    4-8px   (Within components)
Normal:   12-16px (Between elements)
Relaxed:  20-24px (Between sections)
Loose:    32-48px (Between major sections)
```

---

## 🎨 Glassmorphism Recipe

```css
/* Perfect Glass Effect */
background: rgba(26, 26, 26, 0.7);
backdrop-filter: blur(20px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.1);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
```

### Where to Use:
- ✅ Player Bar
- ✅ Modals & Overlays
- ✅ Dropdown Menus
- ✅ Tooltips
- ✅ Floating Action Buttons

---

## 🎭 Micro-interactions

### 1. Like Button
```
Click Animation:
  - Scale: 1 → 1.2 → 1
  - Color: gray → red
  - Duration: 300ms
  - Add heart particles effect
```

### 2. Volume Slider
```
Drag Animation:
  - Thumb scales up on hover
  - Track fills with gradient
  - Shows volume percentage tooltip
```

### 3. Progress Bar
```
Hover:
  - Height increases from 4px → 8px
  - Shows time tooltip at cursor
  - Thumb appears and scales
```

### 4. Play Button
```
Playing State:
  - Pulse animation
  - Glow effect
  - Icon morphs: play → pause
```

---

## 📐 Layout Patterns

### Grid Layouts
```
Mobile:    1 column  (< 640px)
Tablet:    2 columns (640-1024px)
Desktop:   4 columns (1024-1280px)
Large:     5 columns (> 1280px)
```

### Sidebar Behavior
```
Mobile:    Hidden (hamburger menu)
Tablet:    Collapsed (icons only)
Desktop:   Expanded (full width)
```

---

## 🎨 Gradient Recipes

### Category Gradients
```css
Hindi:      linear-gradient(135deg, #667eea 0%, #764ba2 100%)
Telugu:     linear-gradient(135deg, #f093fb 0%, #f5576c 100%)
Indian:     linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)
Love:       linear-gradient(135deg, #fa709a 0%, #fee140 100%)
Tamil:      linear-gradient(135deg, #30cfd0 0%, #330867 100%)
Punjabi:    linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)
Bollywood:  linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)
Devotional: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)
```

### Overlay Gradients
```css
Top Fade:    linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)
Bottom Fade: linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%)
Radial:      radial-gradient(circle, rgba(29,185,84,0.2) 0%, transparent 70%)
```

---

## 🎯 Accessibility Features

### Focus States
```css
/* Visible focus ring */
outline: 2px solid var(--color-primary);
outline-offset: 2px;
```

### High Contrast Mode
```css
/* Increased contrast ratios */
--color-text: #ffffff
--color-background: #000000
/* All text meets WCAG AAA (7:1) */
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🎨 Loading States

### Skeleton Screens
```
┌─────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ ← Shimmer effect
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
└─────────────────────────────────┘
```

### Spinners
```
⟳  Circular spinner (primary color)
⋯  Dots animation (for buttons)
━  Progress bar (for loading content)
```

---

## 🎯 Best Practices

### DO ✅
- Use consistent spacing (4px grid)
- Animate transforms & opacity (GPU accelerated)
- Provide visual feedback for all interactions
- Use semantic colors (green = success, red = error)
- Test with keyboard navigation
- Support dark mode preferences

### DON'T ❌
- Animate width/height (causes reflow)
- Use too many different fonts
- Ignore loading states
- Forget hover states
- Use low contrast text
- Overuse animations

---

This visual guide ensures a consistent, beautiful, and performant user interface!
