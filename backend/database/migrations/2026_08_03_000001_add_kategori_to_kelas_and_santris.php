<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('kelas', 'kategori')) {
            Schema::table('kelas', function (Blueprint $table) {
                $table->string('kategori', 20)->default('akhi')->after('program_belajar');
            });
        }

        if (!Schema::hasColumn('kelas', 'deskripsi')) {
            Schema::table('kelas', function (Blueprint $table) {
                $table->text('deskripsi')->nullable()->after('kategori');
            });
        }

        if (!Schema::hasColumn('santris', 'kategori')) {
            Schema::table('santris', function (Blueprint $table) {
                $table->string('kategori', 20)->nullable()->after('jenis_kelamin');
            });
        }

        DB::table('santris')
            ->whereNull('kategori')
            ->where('jenis_kelamin', 'Laki-laki')
            ->update(['kategori' => 'akhi']);

        DB::table('santris')
            ->whereNull('kategori')
            ->where('jenis_kelamin', 'Perempuan')
            ->update(['kategori' => 'akhwat']);

        DB::table('santris')
            ->whereNull('kategori')
            ->update(['kategori' => 'akhi']);
    }

    public function down(): void
    {
        if (Schema::hasColumn('santris', 'kategori')) {
            Schema::table('santris', function (Blueprint $table) {
                $table->dropColumn('kategori');
            });
        }

        if (Schema::hasColumn('kelas', 'deskripsi')) {
            Schema::table('kelas', function (Blueprint $table) {
                $table->dropColumn('deskripsi');
            });
        }

        if (Schema::hasColumn('kelas', 'kategori')) {
            Schema::table('kelas', function (Blueprint $table) {
                $table->dropColumn('kategori');
            });
        }
    }
};
