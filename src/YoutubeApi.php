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
                    |> array_filter(...);
            },
        );

        return array_map(fn (string $id): SearchResult => new SearchResult($id), $ids);
    }

    public function videoInfo(string $youtubeId): ?VideoInfo
    {
        $data = Cache::remember(
            $youtubeId,
            function () use ($youtubeId): ?array {
                $data = $this
                    ->apiGet(
                        'videos',
                        [
                            'id' => $youtubeId,
                            'part' => 'id,snippet,contentDetails',
                        ],
                    );

                if (empty($data['items'])) {
                    return null;
                }

                $item = $data['items'][0];

                return [
                    'youtube_id' => $item['id'],
                    'title' => $item['snippet']['title'],
                    'duration' => $this->parseIso8601DurationToSeconds($item['contentDetails']['duration']),
                ];
            }
        );

        if ($data === null) {
            return null;
        }

        return new VideoInfo($data['youtube_id'], $data['title'], $data['duration']);
    }

    private function apiGet(string $endpoint, array $params): array
    {
        $params['key'] = YOUTUBE_API_KEY;

        $curl = curl_init('https://www.googleapis.com/youtube/v3/' . $endpoint . '?' . http_build_query($params));
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
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
