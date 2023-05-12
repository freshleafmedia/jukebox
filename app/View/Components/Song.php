<?php

namespace App\View\Components;

use App\DataObjects\Song as SongDto;
use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class Song extends Component
{
    public function __construct(
        protected SongDto $song,
        protected string $key,
    )
    {
    }

    public function render(): View|Closure|string
    {
        return view('components.song')
            ->with([
                'song' => $this->song,
                'key' => $this->key,
            ]);
    }
}
