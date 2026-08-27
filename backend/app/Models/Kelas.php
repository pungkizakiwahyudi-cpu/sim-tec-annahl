<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Kelas extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'kelas';

    protected $fillable = [
        'nama_kelas',
        'program_belajar',
        'kategori',
        'ustadz_id',
        'deskripsi',
    ];

    // Relasi ke Ustadz (many kelas → 1 ustadz)
    public function ustadz()
    {
        return $this->belongsTo(Ustadz::class);
    }

    // Relasi 1 kelas ke Banyak Santri (One-to-Many)
    public function santri()
    {
        return $this->hasMany(Santri::class, 'kelas_id');
    }

    // Relasi ke Absensi
    public function absensi()
    {
        return $this->hasMany(Absensi::class);
    }

    // Relasi ke NilaiPerkembangan
    public function nilaiPerkembangan()
    {
        return $this->hasMany(NilaiPerkembangan::class);
    }
}
