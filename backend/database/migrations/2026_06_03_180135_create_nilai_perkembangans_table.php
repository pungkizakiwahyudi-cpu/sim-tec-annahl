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
        Schema::create('nilai_perkembangans', function (Blueprint $table) {
            $table->id();
            
            // Kolom Foreign Key ke Tabel Kelas dan Santris
            $table->foreignId('kelas_id')->constrained('kelas')->onDelete('cascade');
            $table->foreignId('santri_id')->constrained('santris')->onDelete('cascade');
            
            // Kolom Data Nilai Perkembangan
            $table->date('tanggal');
            $table->text('hafalan_baru')->nullable();
            $table->text('murojaah')->nullable();
            $table->integer('nilai_tajwid')->nullable()->default(0);
            $table->text('catatan')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nilai_perkembangans');
    }
};