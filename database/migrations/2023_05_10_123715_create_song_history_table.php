<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('song_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('song_id')->constrained('songs');
            $table->text('played_by');
            $table->timestamps();
        });
    }
};
