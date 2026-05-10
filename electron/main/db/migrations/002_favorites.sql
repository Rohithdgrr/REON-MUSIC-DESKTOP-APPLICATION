-- Add favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  song_id INTEGER NOT NULL,
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
  UNIQUE(song_id)
);

-- Add play counts table for statistics
CREATE TABLE IF NOT EXISTS play_counts (
  song_id INTEGER PRIMARY KEY,
  play_count INTEGER DEFAULT 0,
  last_played DATETIME,
  FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_favorites_song_id ON favorites(song_id);
CREATE INDEX IF NOT EXISTS idx_favorites_added_at ON favorites(added_at DESC);
CREATE INDEX IF NOT EXISTS idx_play_counts_count ON play_counts(play_count DESC);
CREATE INDEX IF NOT EXISTS idx_play_counts_last_played ON play_counts(last_played DESC);
