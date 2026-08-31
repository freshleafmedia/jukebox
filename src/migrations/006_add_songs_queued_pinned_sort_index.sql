CREATE INDEX idx_songs_queued_pinned_sort ON songs (CASE state WHEN 'playing' THEN 0 WHEN 'paused' THEN 0 ELSE 1 END, sort) WHERE queued_by IS NOT NULL;
