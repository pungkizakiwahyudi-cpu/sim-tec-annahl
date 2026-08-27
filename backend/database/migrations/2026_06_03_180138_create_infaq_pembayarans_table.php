<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('infaq_pembayarans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('santri_id')->constrained('santris')->onDelete('cascade');
            $table->integer('bulan'); // Disimpan sebagai angka 1-12
            $table->integer('tahun');
            $table->decimal('jumlah', 12, 2); // Disamakan dengan Controller: 'jumlah'
            $table->enum('status', ['pending', 'lunas', 'ditolak'])->default('pending');
            $table->string('bukti_transfer')->nullable();
            $table->text('catatan')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('infaq_pembayarans');
    }
};