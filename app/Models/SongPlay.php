<?php

namespace App\Models;

use App\Enums\SongState;
use App\Jobs\DownloadYouTubeVideo;
use Carbon\CarbonInterval;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class SongPlay extends Model
{
    protected $table = 'song_history';

    protected $fillable = [
        'played_by',
    ];

    protected $casts = [
    ];

    public function Song(): BelongsTo
    {
        return $this->belongsTo(Song::class);
    }

}
