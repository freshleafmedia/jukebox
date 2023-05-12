<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('songs', function (Blueprint $table) {
            $table->id();
            $table->text('youtube_id')->unique();
            $table->text('title');
            $table->integer('duration');
            $table->text('queued_by')->nullable();
            $table->text('state');
            $table->integer('sort');
            $table->timestamps();
        });
    }
};
