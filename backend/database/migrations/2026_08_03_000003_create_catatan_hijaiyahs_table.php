<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('catatan_hijaiyahs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('santri_id')->constrained('santris')->onDelete('cascade');
            $table->date('tanggal');
            $table->string('huruf', 10);
            $table->text('catatan');
            $table->timestamps();

            $table->index(['santri_id', 'huruf']);
            $table->index(['santri_id', 'tanggal']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('catatan_hijaiyahs');
    }
};
