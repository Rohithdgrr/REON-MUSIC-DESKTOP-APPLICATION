# Music Reon

A Spotify-like Windows desktop music streaming app built with Electron, Vue 3, and YouTube's InnerTube API. Stream millions of songs without ads, subscriptions, or API keys.

## Features

- **Search & Stream** — Search YouTube Music and stream audio directly
- **Ad-Free Playback** — Direct audio streams with no YouTube ads
- **Local Library** — Automatically saves played songs to your local library
- **Playlists** — Create and manage custom playlists
- **Playback History** — Track recently played songs
- **Queue Management** — Play next, shuffle, repeat modes
- **Light Theme** — Clean, modern light UI (with dark mode support)
- **Keyboard Shortcuts** — Space to play/pause, arrows to seek/volume
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
│   │   │   └── InnertubeService.js  # Search, stream URL extraction
│   │   └── db/
│   │       └── connection.js     # lowdb JSON file init
│   └── preload/
│       └── index.js              # contextBridge strict API expose
├── src/
│   ├── main.js                   # Vue 3 app bootstrap
│   ├── App.vue                   # Root layout
│   ├── assets/styles/            # CSS variables, Tailwind
│   ├── components/
│   │   ├── PlayerBar.vue         # Bottom fixed player controls
│   │   ├── Sidebar.vue           # Navigation + playlists
│   │   └── TrackCard.vue         # Song thumbnail + info
│   ├── stores/
│   │   ├── player.js             # Audio player state (Pinia)
│   │   ├── search.js             # Search state
│   │   └── library.js            # Library/playlists state
│   ├── views/
│   │   ├── HomeView.vue
│   │   ├── SearchView.vue
│   │   ├── LibraryView.vue
│   │   └── PlaylistView.vue
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
| Left Arrow | Seek backward 5s |
| Right Arrow | Seek forward 5s |
| Up Arrow | Volume up |
| Down Arrow | Volume down |

## Future Roadmap

1. **Offline Downloads** — yt-dlp + ffmpeg transcode to MP3
2. **Synced Lyrics** — LRCLIB API integration
3. **Equalizer** — Web Audio API BiquadFilter
4. **Mini Player** — Compact always-on-top window
5. **Multi-Source** — JioSaavn, SoundCloud
6. **AI Features** — Mood-based recommendations

## License

MIT — For personal/educational use only. This app streams from publicly accessible YouTube URLs and does not host or distribute copyrighted content.

## Disclaimer

Using YouTube's private InnerTube API may violate YouTube's Terms of Service. Build and use this app **for personal/educational purposes only**.
