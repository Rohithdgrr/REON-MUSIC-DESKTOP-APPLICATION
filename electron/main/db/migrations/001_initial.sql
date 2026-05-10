-- Initial schema for Music Reon MVP

CREATE TABLE IF NOT EXISTS songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    video_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    artist TEXT,
    thumbnail_url TEXT,
    duration_seconds INTEGER,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS playlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS playlist_songs (
    playlist_id INTEGER NOT NULL,
    song_id INTEGER NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (playlist_id, song_id),
    FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
    FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS play_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    song_id INTEGER NOT NULL,
    played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_songs_video_id ON songs(video_id);
CREATE INDEX IF NOT EXISTS idx_playlist_songs_playlist ON playlist_songs(playlist_id);
CREATE INDEX IF NOT EXISTS idx_play_history_song ON play_history(song_id);
CREATE INDEX IF NOT EXISTS idx_play_history_at ON play_history(played_at DESC);
