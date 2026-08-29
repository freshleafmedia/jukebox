CREATE TABLE songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    youtube_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    duration INTEGER NOT NULL,
    queued_by TEXT,
    state TEXT NOT NULL,
    sort INTEGER NOT NULL,
    created_at DATETIME,
    updated_at DATETIME
);
