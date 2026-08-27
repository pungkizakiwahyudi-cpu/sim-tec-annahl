<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('infaq_tarifs')) {
            Schema::create('infaq_tarifs', function (Blueprint $table) {
                $table->id();
                $table->string('kategori', 20)->unique();
                $table->decimal('nominal', 12, 2)->default(0);
                $table->timestamps();
            });
        }

        foreach ([
            'akhi' => 150000,
            'akhwat' => 150000,
            'anak_anak' => 100000,
        ] as $kategori => $nominal) {
            DB::table('infaq_tarifs')->updateOrInsert(
                ['kategori' => $kategori],
                [
                    'nominal' => $nominal,
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }

        if (Schema::hasTable('infaq_pembayarans') && Schema::hasColumn('infaq_pembayarans', 'status')) {
            if (DB::getDriverName() === 'mysql') {
                DB::statement("ALTER TABLE infaq_pembayarans MODIFY status VARCHAR(30) NOT NULL DEFAULT 'belum_lunas'");
            }

            DB::table('infaq_pembayarans')
                ->where('status', 'pending')
                ->update(['status' => 'belum_lunas']);
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('infaq_pembayarans') && Schema::hasColumn('infaq_pembayarans', 'status')) {
            DB::table('infaq_pembayarans')
                ->whereIn('status', ['belum_lunas', 'proses_verifikasi'])
                ->update(['status' => 'pending']);

            if (DB::getDriverName() === 'mysql') {
                DB::statement("ALTER TABLE infaq_pembayarans MODIFY status ENUM('pending', 'lunas', 'ditolak') NOT NULL DEFAULT 'pending'");
            }
        }

        Schema::dropIfExists('infaq_tarifs');
    }
};
