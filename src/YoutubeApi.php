<?php

class YoutubeApi
{
    public function search(string $term): array
    {
        $term = trim($term);

        $ids = Cache::remember(
            'search:' . strtolower($term),
            function () use ($term): array {
                $data = $this
                    ->apiGet(
                        'search',
                        [
                            'q' => $term,
                            'type' => 'video',
                            'part' => 'id,snippet',
                            'maxResults' => 30,
                            'videoDimension' => '2d',
                        ]
                    );

                return ($data['items'] ?? [])
                    |> (fn (array $items): array => array_map(
                        function (array $item): ?string {
                            if ($item['id']['kind'] !== 'youtube#video') {
                                return null;
                            }

                            return $item['id']['videoId'];
                        },
                        $items,
                    ))
                    |> array_filter(...)
                    |> array_values(...);
            },
        );

        return array_map(fn (string $id): SearchResult => new SearchResult($id), $ids);
    }

    public function videoInfo(string $youtubeId): ?VideoInfo
    {
        return $this->videoInfos([$youtubeId])[$youtubeId] ?? null;
    }

    public function videoInfos(array $youtubeIds): array
    {
        $rows = [];
        $uncached = [];

        foreach ($youtubeIds as $youtubeId) {
            if (Cache::has($youtubeId)) {
                $rows[$youtubeId] = Cache::get($youtubeId);
            } else {
                $uncached[] = $youtubeId;
            }
        }

        foreach ($this->fetchVideoInfos($uncached) as $youtubeId => $row) {
            Cache::put($youtubeId, $row);

            $rows[$youtubeId] = $row;
        }

        return array_map(
            fn (array $row): VideoInfo => new VideoInfo($row['youtube_id'], $row['title'], $row['duration']),
            array_filter($rows),
        );
    }

    private function fetchVideoInfos(array $youtubeIds): array
    {
        $rows = [];

        foreach (array_chunk($youtubeIds, 50) as $chunk) {
            $data = $this->apiGet(
                'videos',
                [
                    'id' => implode(',', $chunk),
                    'part' => 'id,snippet,contentDetails',
                ],
            );

            foreach ($data['items'] as $item) {
                $rows[$item['id']] = [
                    'youtube_id' => $item['id'],
                    'title' => $item['snippet']['title'],
                    'duration' => $this->parseIso8601DurationToSeconds($item['contentDetails']['duration']),
                ];
            }
        }

        return $rows;
    }

    private function apiGet(string $endpoint, array $params): array
    {
        $params['key'] = YOUTUBE_API_KEY;

        $curl = curl_init('https://www.googleapis.com/youtube/v3/' . $endpoint . '?' . http_build_query($params));
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 5);
        curl_setopt($curl, CURLOPT_TIMEOUT, 15);
        curl_setopt($curl, CURLOPT_ENCODING, '');
        $response = curl_exec($curl);

        if ($response === false) {
            throw new RuntimeException('YouTube API request failed: ' . curl_error($curl));
        }

        curl_close($curl);

        $data = json_decode($response, true);

        if (isset($data['error'])) {
            throw new RuntimeException('YouTube API error: ' . $data['error']['message']);
        }

        return $data;
    }

    private function parseIso8601DurationToSeconds(string $iso): int
    {
        $interval = new DateInterval($iso);

        return $interval->d * 86400 + $interval->h * 3600 + $interval->i * 60 + $interval->s;
    }
}
