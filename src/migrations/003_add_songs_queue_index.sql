CREATE INDEX idx_songs_queued_state_sort ON songs (state, sort) WHERE queued_by IS NOT NULL;
