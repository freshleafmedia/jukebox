CREATE INDEX idx_songs_queued_updated_at ON songs (updated_at) WHERE queued_by IS NOT NULL;
