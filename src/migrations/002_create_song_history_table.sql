CREATE TABLE song_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    song_id INTEGER NOT NULL REFERENCES songs (id),
    played_by TEXT NOT NULL,
    created_at DATETIME,
    updated_at DATETIME
);

CREATE INDEX idx_song_history_song_id ON song_history (song_id);
