/**
 * Safe wrapper for electron API with initialization check
 * Includes a LocalStorage mock for browser development
 */

let apiReady = false
let readyPromise = null

function checkApi() {
  return window.electron?.innertube && window.electron?.sqlite
}

// Fallback Mock for Browser Development
function setupBrowserMock() {
  if (window.electron) return;
  console.warn('Electron API not found. Initializing LocalStorage mock for browser testing.');

  const db = {
    get: (key) => JSON.parse(localStorage.getItem(key) || '[]'),
    set: (key, val) => localStorage.setItem(key, JSON.stringify(val))
  };

  const getNextId = (arr) => arr.length ? Math.max(...arr.map(i => i.id || 0)) + 1 : 1;

  window.electron = {
    innertube: {
      search: async (q) => ({ success: true, data: [] }),
      getAudioUrl: async () => ({ success: false })
    },
    sqlite: {
      getAllSongs: async () => ({ success: true, data: db.get('songs') }),
      addSong: async (s) => {
        const songs = db.get('songs');
        let existing = songs.find(x => x.video_id === s.videoId);
        if (!existing) {
          existing = { id: getNextId(songs), video_id: s.videoId, title: s.title, artist: s.artist, thumbnail_url: s.thumbnail || '', duration_seconds: s.duration || 0, added_at: new Date().toISOString() };
          songs.push(existing);
          db.set('songs', songs);
        }
        return { success: true, data: { id: existing.id } };
      },
      removeSong: async (vid) => {
        db.set('songs', db.get('songs').filter(s => s.video_id !== vid));
        return { success: true };
      },
      getPlaylists: async () => ({ success: true, data: db.get('playlists') }),
      createPlaylist: async (name) => {
        const p = db.get('playlists');
        const playlist = { id: getNextId(p), name, description: '', created_at: new Date().toISOString() };
        p.push(playlist);
        db.set('playlists', p);
        return { success: true, data: playlist };
      },
      deletePlaylist: async (id) => {
        db.set('playlists', db.get('playlists').filter(p => p.id !== id));
        db.set('playlistSongs', db.get('playlistSongs').filter(ps => ps.playlist_id !== id));
        return { success: true };
      },
      updatePlaylist: async (id, data) => {
        const pl = db.get('playlists');
        const idx = pl.findIndex(p => p.id === id);
        if (idx === -1) return { success: false, error: 'Not found' };
        if (data.name !== undefined) pl[idx].name = data.name;
        if (data.description !== undefined) pl[idx].description = data.description;
        db.set('playlists', pl);
        return { success: true, data: pl[idx] };
      },
      getPlaylistSongs: async (pid) => {
        const ps = db.get('playlistSongs').filter(p => p.playlist_id === pid).sort((a, b) => a.position - b.position);
        const songs = db.get('songs');
        return { success: true, data: ps.map(p => songs.find(s => s.id === p.song_id)).filter(Boolean) };
      },
      addSongToPlaylist: async (pid, sid, pos) => {
        const ps = db.get('playlistSongs');
        if (!ps.find(p => p.playlist_id === pid && p.song_id === sid)) {
          ps.push({ playlist_id: pid, song_id: sid, position: pos || 0 });
          db.set('playlistSongs', ps);
        }
        return { success: true };
      },
      removeSongFromPlaylist: async (pid, sid) => {
        const ps = db.get('playlistSongs');
        db.set('playlistSongs', ps.filter(p => !(p.playlist_id === pid && p.song_id === sid)));
        // Re-index
        const remaining = db.get('playlistSongs').filter(p => p.playlist_id === pid).sort((a, b) => a.position - b.position);
        const all = db.get('playlistSongs');
        remaining.forEach((p, i) => { const item = all.find(x => x.playlist_id === p.playlist_id && x.song_id === p.song_id); if (item) item.position = i; });
        db.set('playlistSongs', all);
        return { success: true };
      },
      reorderPlaylistTrack: async (pid, sid, newPos) => {
        const ps = db.get('playlistSongs');
        const entries = ps.filter(p => p.playlist_id === pid).sort((a, b) => a.position - b.position);
        const idx = entries.findIndex(p => p.song_id === sid);
        if (idx === -1) return { success: false };
        const [moved] = entries.splice(idx, 1);
        entries.splice(newPos, 0, moved);
        entries.forEach((p, i) => { const item = ps.find(x => x.playlist_id === p.playlist_id && x.song_id === p.song_id); if (item) item.position = i; });
        db.set('playlistSongs', ps);
        return { success: true };
      },
      addToHistory: async (sid) => {
        const h = db.get('playHistory');
        h.push({ id: getNextId(h), song_id: sid, played_at: new Date().toISOString() });
        db.set('playHistory', h);
        return { success: true };
      },
      getHistory: async () => {
        const h = db.get('playHistory').sort((a, b) => new Date(b.played_at) - new Date(a.played_at)).slice(0, 100);
        const songs = db.get('songs');
        return { success: true, data: h.map(x => {
          const s = songs.find(song => song.id === x.song_id);
          return { ...x, title: s?.title || 'Unknown', artist: s?.artist || 'Unknown', thumbnail_url: s?.thumbnail_url || '', video_id: s?.video_id || '' };
        }) };
      },
      clearHistory: async () => { db.set('playHistory', []); return { success: true }; },
      getFavorites: async () => {
        const f = db.get('favorites').sort((a, b) => new Date(b.added_at) - new Date(a.added_at));
        const songs = db.get('songs');
        return { success: true, data: f.map(x => {
          const s = songs.find(song => song.id === x.song_id);
          return { ...x, title: s?.title || 'Unknown', artist: s?.artist || 'Unknown', thumbnail_url: s?.thumbnail_url || '', video_id: s?.video_id || '', duration_seconds: s?.duration_seconds || 0 };
        }) };
      },
      addFavorite: async (sid) => {
        const f = db.get('favorites');
        if (!f.find(x => x.song_id === sid)) {
          f.push({ id: getNextId(f), song_id: sid, added_at: new Date().toISOString() });
          db.set('favorites', f);
        }
        return { success: true };
      },
      removeFavorite: async (sid) => {
        db.set('favorites', db.get('favorites').filter(f => f.song_id !== sid));
        return { success: true };
      },
      isFavorite: async (sid) => {
        return { success: true, data: db.get('favorites').some(f => f.song_id === sid) };
      },
      getStats: async () => {
        const songs = db.get('songs');
        const playlists = db.get('playlists');
        const history = db.get('playHistory');
        const favorites = db.get('favorites');
        
        const totalSeconds = songs.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
        const artists = new Set(songs.map(s => s.artist));
        
        return { success: true, data: {
          totalSongs: songs.length, totalPlaylists: playlists.length, totalPlays: history.length,
          totalFavorites: favorites.length, totalHours: Math.floor(totalSeconds / 3600), totalArtists: artists.size
        } };
      },
      getTopSongs: async (limit=50) => {
        const counts = {};
        db.get('playHistory').forEach(h => counts[h.song_id] = (counts[h.song_id] || 0) + 1);
        const songs = db.get('songs');
        const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit)
          .map(([sid, c]) => ({ ...songs.find(s => s.id === parseInt(sid)), playCount: c })).filter(s => s.title);
        return { success: true, data: top };
      },
      getTopArtists: async (limit=20) => {
        const counts = {};
        const songs = db.get('songs');
        db.get('playHistory').forEach(h => {
          const s = songs.find(x => x.id === h.song_id);
          if (s && s.artist) counts[s.artist] = (counts[s.artist] || 0) + 1;
        });
        const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([name, c]) => ({ name, playCount: c }));
        return { success: true, data: top };
      },
      exportPlaylists: async () => {
        const data = {
          version: 1,
          exportedAt: new Date().toISOString(),
          playlists: db.get('playlists'),
          playlistSongs: db.get('playlistSongs')
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `music-reon-playlists-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        return { success: true };
      },
      importPlaylists: async () => {
        return { success: false, canceled: true }; // Browser mock uses SettingsView import
      }
    },
    downloads: {
      getDownloads: async () => ({ success: true, data: db.get('downloads') }),
      addDownload: async (track) => {
        const d = db.get('downloads');
        if (!d.find(x => x.videoId === track.videoId)) {
          d.push({ id: getNextId(d), videoId: track.videoId, title: track.title, artist: track.artist, thumbnail: track.thumbnail || '', duration: track.duration || 0, downloadedAt: new Date().toISOString() });
          db.set('downloads', d);
        }
        return { success: true };
      },
      removeDownload: async (id) => {
        db.set('downloads', db.get('downloads').filter(d => d.id !== id));
        return { success: true };
      },
      getDownloadPath: async () => ({ success: true, data: '' }),
      isDownloaded: async (videoId) => ({ success: true, data: db.get('downloads').some(d => d.videoId === videoId) }),
      getDownloadStatus: async (videoId) => {
        const dl = db.get('downloads').find(d => d.videoId === videoId);
        return { success: true, data: dl ? 'completed' : null };
      }
    }
  };
}

export function waitForElectronApi() {
  if (apiReady) {
    return Promise.resolve()
  }

  if (readyPromise) {
    return readyPromise
  }

  readyPromise = new Promise((resolve, reject) => {
    // Check immediately
    if (checkApi()) {
      apiReady = true
      resolve()
      return
    }

    // Poll for API availability
    let attempts = 0
    const maxAttempts = 10 // Reduce timeout to 1 second for web browsers
    
    const interval = setInterval(() => {
      attempts++
      
      if (checkApi()) {
        apiReady = true
        clearInterval(interval)
        resolve()
      } else if (attempts >= maxAttempts) {
        clearInterval(interval)
        setupBrowserMock() // Setup mock if real API isn't found
        apiReady = true
        resolve()
      }
    }, 100)
  })

  return readyPromise
}

export function isElectronApiReady() {
  return apiReady || checkApi()
}

export function getElectronApi() {
  if (!checkApi()) {
    // If check fails but we are ready, it means mock is being used
    if (apiReady && window.electron) return window.electron;
    throw new Error('Electron API not ready. Call waitForElectronApi() first.')
  }
  return window.electron
}
