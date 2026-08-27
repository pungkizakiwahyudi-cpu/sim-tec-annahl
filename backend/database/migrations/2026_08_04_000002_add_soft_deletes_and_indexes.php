<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Soft Deletes untuk santris
        if (Schema::hasTable('santris') && !Schema::hasColumn('santris', 'deleted_at')) {
            Schema::table('santris', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        // Soft Deletes untuk ustadzs
        if (Schema::hasTable('ustadzs') && !Schema::hasColumn('ustadzs', 'deleted_at')) {
            Schema::table('ustadzs', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        // Soft Deletes untuk kelas
        if (Schema::hasTable('kelas') && !Schema::hasColumn('kelas', 'deleted_at')) {
            Schema::table('kelas', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        // Index untuk query umum
        if (Schema::hasTable('santris')) {
            Schema::table('santris', function (Blueprint $table) {
                $table->index('status');
                $table->index('kategori');
            });
        }

        if (Schema::hasTable('infaq_pembayarans')) {
            Schema::table('infaq_pembayarans', function (Blueprint $table) {
                $table->index(['bulan', 'tahun']);
                $table->index('status');
            });
        }

        if (Schema::hasTable('absensis')) {
            Schema::table('absensis', function (Blueprint $table) {
                $table->index('tanggal');
                $table->index('status');
            });
        }

        if (Schema::hasTable('nilai_perkembangans')) {
            Schema::table('nilai_perkembangans', function (Blueprint $table) {
                $table->index('tanggal');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('santris') && Schema::hasColumn('santris', 'deleted_at')) {
            Schema::table('santris', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }

        if (Schema::hasTable('ustadzs') && Schema::hasColumn('ustadzs', 'deleted_at')) {
            Schema::table('ustadzs', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }

        if (Schema::hasTable('kelas') && Schema::hasColumn('kelas', 'deleted_at')) {
            Schema::table('kelas', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }

        if (Schema::hasTable('santris')) {
            Schema::table('santris', function (Blueprint $table) {
                $table->dropIndex(['status']);
                $table->dropIndex(['kategori']);
            });
        }

        if (Schema::hasTable('infaq_pembayarans')) {
            Schema::table('infaq_pembayarans', function (Blueprint $table) {
                $table->dropIndex(['bulan', 'tahun']);
                $table->dropIndex(['status']);
            });
        }

        if (Schema::hasTable('absensis')) {
            Schema::table('absensis', function (Blueprint $table) {
                $table->dropIndex(['tanggal']);
                $table->dropIndex(['status']);
            });
        }

        if (Schema::hasTable('nilai_perkembangans')) {
            Schema::table('nilai_perkembangans', function (Blueprint $table) {
                $table->dropIndex(['tanggal']);
            });
        }
    }
};