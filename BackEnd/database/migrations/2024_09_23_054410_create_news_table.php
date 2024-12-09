<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('news', function (Blueprint $table) {
            $table->id('id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('news_category_id');
            $table->unsignedBigInteger('movie_id')->nullable();
            $table->string('title')->nullable();
            $table->string('slug')->nullable()->unique();
            $table->string('thumnail')->nullable();// ảnh nhỏ bên dưới
            $table->string('banner')->nullable();// ảnh để banner
            $table->longText('content')->nullable();
            $table->integer('views')->nullable();
            $table->boolean('status')->default(true);
            $table->unsignedBigInteger('cinema_id')->nullable();
            $table->timestamps();
            $table->foreign('cinema_id')->references('id')->on('cinema')->onDelete('cascade');
            $table->foreign('movie_id')->references('id')->on('movies')->onDelete('cascade');
            $table->foreign('news_category_id')->references('id')->on('news_category')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('news');
    }
};
