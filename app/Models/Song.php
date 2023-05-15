<?php

namespace App\Models;

use App\Enums\SongState;
use App\Jobs\DownloadYouTubeVideo;
use Carbon\CarbonInterval;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Song extends Model
{
    protected $fillable = [
        'youtube_id',
        'title',
        'duration',
        'state',
        'queued_by',
        'sort',
    ];

    protected $casts = [
        'state' => SongState::class,
        'sort' => 'int',
    ];

    public function Plays(): HasMany
    {
        return $this->hasMany(SongPlay::class);
    }

    public static function booted()
    {
        parent::booted();

        static::created(function (self $song): void {
            DownloadYouTubeVideo::dispatch($song);
        });

        static::updated(function (self $song): void {
            if ($song->state === SongState::DOWNLOAD_REQUIRED) {
                DownloadYouTubeVideo::dispatch($song);
            }

            if ($song->state === SongState::PLAYABLE && self::query()->where('state', '=', SongState::PLAYING)->doesntExist()) {
                $song->update([
                    'state' => SongState::PLAYING,
                ]);
            }
        });
    }

    public function getSortValue(): int
    {
        return match($this->state) {
            SongState::PLAYING => 1,
            SongState::PAUSED => 2,
            default => 3,
        };
    }
}
