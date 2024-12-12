<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('seats', function (Blueprint $table) {
            $table->id('id');
            $table->unsignedBigInteger('showtime_id');
            $table->unsignedBigInteger('room_id');
            $table->string('seat_name');
            $table->string('seat_column');
            $table->string('seat_row');
            $table->string('barcode')->nullable();
            $table->string('code')->nullable();
            $table->enum('seat_type', ['Standard', 'Couple', 'VIP'])->default('Standard');
            $table->enum('status', ['Reserved Until', 'Booked'])->default('Reserved Until');
            $table->boolean('is_checked_in')->default(false);
            $table->timestamp('reserved_until')->nullable();
            $table->timestamps();
            $table->foreign('showtime_id')->references('id')->on('showtimes')->onDelete('cascade');
            $table->foreign('room_id')->references('id')->on('room')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seats');
    }
};
