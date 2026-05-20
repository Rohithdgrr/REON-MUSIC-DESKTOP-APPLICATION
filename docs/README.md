# Music Reon

A Spotify-like Windows desktop music streaming app built with Electron, Vue 3, and YouTube's InnerTube API. Stream millions of songs without ads, subscriptions, or API keys.

## Features

- **Search & Stream** — Search YouTube Music and stream audio directly
- **Ad-Free Playback** — Direct audio streams with no YouTube ads
- **Local Library** — Automatically saves played songs to your local library
- **Playlists** — Create and manage custom playlists (with drag-and-drop reorder)
- **Playback History** — Track recently played songs with stats
- **Queue Management** — Play next, shuffle, repeat modes, save queue as playlist
- **Dynamic Mood Playlists** — 10 moods (Workout, Focus, Chill, Party, etc.) auto-generated from YouTube Music
- **Smart Playlists** — Recently Added, Most Played, Favorites Mix, Long Songs, Short Songs
- **Listening Stats** — Total songs, artists, plays, listening time, top songs, top artists
- **10-Band Equalizer** — 8 presets with custom gain per band
- **Crossfade & Gapless** — Smooth transitions between songs
- **Playback Speed** — 0.5x–2x via settings slider or PlayerBar quick-access
- **Sleep Timer** — 15/30/60/90 minute auto-stop with fade-out
- **Content Filtering** — Dual-layer music-only filtering (podcasts/interviews filtered out)
- **Toast Notifications** — Non-intrusive feedback for actions
- **Playlist Info Panel** — Editable name/description, stats, artist breakdown
- **Keyboard Shortcuts** — Comprehensive shortcuts (see below)
- **Light/Dark Theme** — Clean glassmorphism UI with backdrop blur
- **Windows Portable** — Single `.exe` file, no installation required

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop Shell | Electron 28 |
| UI Framework | Vue 3 + Vite |
| Styling | Tailwind CSS + CSS Variables |
| State | Pinia |
| Audio Engine | Howler.js |
| Music Fetcher | youtubei.js (InnerTube) |
| Database | lowdb (JSON file) |
| Packaging | electron-builder |

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Windows 10/11

### Development

```bash
# Install dependencies
npm install

# Run in dev mode (hot reload)
npm run dev
```

The app will open with:
- Dev server on `http://localhost:5173`
- Electron window with Vue inspector

### Build Production .exe

```bash
# Build renderer + main + preload
npm run build

# Create Windows portable executable
npm run build:win
```

The `.exe` will be in `release/Music Reon 1.0.0.exe` (~70MB portable).

> **Note:** On Windows without Developer Mode enabled, `electron-builder` may fail to extract code-signing tools due to symlink permissions. Run PowerShell as Administrator for packaging, or enable Windows Developer Mode.

## Architecture

```
USER SEARCHES "Blinding Lights"
        |
        v
[Vue SearchView] -> Pinia search store
        |
        v
[IPC] window.electron.innertube.search()
        |
        v
[Main] InnertubeService -> youtubei.js -> YouTube InnerTube API
        |
        v
Results: videoId, title, artist, thumbnail, duration
        |
        v
[Vue TrackCard] -> Click -> Pinia player store
        |
        v
[IPC] window.electron.innertube.getAudioUrl(videoId)
        |
        v
[Main] info.chooseFormat({ type: 'audio', quality: 'best' })
        -> format.decipher(session.player)
        |
        v
Direct Audio Stream URL (opus/mp4a)
        |
        v
[Howler.js] -> 🎵 PLAYS IN APP!
        |
        v
[lowdb] Save to library + history
```

## Project Structure

```
music-reon/
├── electron/
│   ├── main/
│   │   ├── index.js              # Entry point, window creation
│   │   ├── ipc/
│   │   │   ├── innertube.js      # YouTube InnerTube IPC APIs
│   │   │   └── sqlite.js         # lowdb JSON store IPC APIs
│   │   ├── services/
│   │   │   └── InnertubeService.js  # Search, stream URL, content filter
│   │   └── db/
│   │       └── connection.js     # lowdb JSON file init
│   └── preload/
│       └── index.js              # contextBridge strict API expose
├── src/
│   ├── main.js                   # Vue 3 app bootstrap
│   ├── App.vue                   # Root layout (sidebar + player + queue)
│   ├── assets/styles/            # CSS variables (themes), glassmorphism
│   ├── components/
│   │   ├── PlayerBar.vue         # Bottom player controls (speed, sleep, share)
│   │   ├── Sidebar.vue           # Navigation + playlist list
│   │   ├── TrackCard.vue         # Song thumbnail + info card
│   │   ├── QueuePanel.vue        # Queue sidebar with drag-reorder
│   │   ├── NotificationContainer.vue  # Toast notifications
│   │   ├── EqualizerPanel.vue    # 10-band EQ
│   │   ├── SleepTimer.vue        # Sleep timer popup
│   │   └── FavoriteButton.vue    # Heart toggle with animation
│   ├── stores/
│   │   ├── player.js             # Audio player state (Pinia)
│   │   ├── search.js             # Search state
│   │   ├── library.js            # Library/playlists state
│   │   ├── favorites.js          # Favorites (Map-based O(1) lookup)
│   │   └── smartPlaylists.js     # Mood playlists + smart generators
│   ├── composables/
│   │   ├── useMediaKeys.js       # Global keyboard shortcuts
│   │   ├── useNotifications.js   # Toast notification system
│   │   └── useTheme.js           # Theme switching
│   ├── utils/
│   │   ├── audioManager.js       # Howler.js wrapper (crossfade, speed)
│   │   ├── electronApi.js        # Browser mock for electron APIs
│   │   ├── contentFilter.js      # Renderer-side music content filter
│   │   └── trackNormalizer.js    # Track data normalization
│   ├── views/
│   │   ├── HomeView.vue          # Mood cards + dynamic results
│   │   ├── SearchView.vue        # Search with history, trending, artist chips
│   │   ├── LibraryView.vue       # Tabs: songs, playlists, smart, stats, history
│   │   ├── PlaylistView.vue      # Playlist tracks + info panel + drag reorder
│   │   ├── FavoritesView.vue     # Full favorites page with search/sort
│   │   ├── CategoryView.vue      # Category/mood playlist browser
│   │   ├── SettingsView.vue      # Settings (speed, crossfade, notifications)
│   │   └── KeyboardShortcutsView.vue  # Shortcuts reference
│   └── router/
│       └── index.js
├── package.json
├── electron.vite.config.mjs
├── electron-builder.json5
└── README.md
```

## Security

- **Context Isolation** enabled — preload exposes only whitelisted APIs
- **Node Integration** disabled — renderer has no direct Node.js access
- **Content Security Policy** restricts remote content
- **IPC Bridge** typed and audited — only `innertube:` and `sqlite:` channels

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space | Play / Pause |
| `Ctrl + →` | Next Track |
| `Ctrl + ←` | Previous Track |
| `→ / ←` | Seek forward / backward 5s |
| `Ctrl + ↑ / ↓` | Volume up / down |
| `M` | Mute / Unmute |
| `S` | Toggle Shuffle |
| `R` | Cycle Repeat mode |
| `Q` | Toggle Queue panel |
| `/` | Focus Search |
| `Escape` | Close panels / Blur input |
| `Ctrl + H` | Go to Home |
| `Ctrl + F` | Go to Search |
| `Ctrl + L` | Go to Library |
| `Ctrl + D` | Go to Favorites |
| `Ctrl + ,` | Go to Settings |
| `Ctrl + /` | Keyboard Shortcuts |
| Media Keys | Play/Pause, Next, Previous, Stop |

## Future Roadmap

1. **Offline Downloads** — yt-dlp + ffmpeg transcode to MP3
2. **Synced Lyrics** — LRCLIB API integration
3. **Audio Visualization** — Canvas-based spectrum analyzer
4. **Mini Player** — Compact always-on-top window
5. **Multi-Source** — SoundCloud, JioSaavn support
6. **Data Import/Export** — JSON playlist backup and restore

## License

MIT — For personal/educational use only. This app streams from publicly accessible YouTube URLs and does not host or distribute copyrighted content.

## Disclaimer

Using YouTube's private InnerTube API may violate YouTube's Terms of Service. Build and use this app **for personal/educational purposes only**.
