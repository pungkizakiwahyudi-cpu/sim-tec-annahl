<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class NilaiPerkembangan extends Model
{
    use HasFactory;

    // Ganti 'nilai_perkembangan' menjadi 'nilai_perkembangans' (pakai 's')
    protected $table = 'nilai_perkembangans';

    protected $fillable = [
        'kelas_id',
        'santri_id',
        'tanggal',
        'hafalan_baru',
        'murojaah',
        'nilai_tajwid',
        'catatan',
    ];

    protected function casts(): array
    {
        return [
            'tanggal'      => 'date',
            'nilai_tajwid' => 'integer',
        ];
    }

    public function kelas()
    {
        return $this->belongsTo(Kelas::class);
    }

    public function santri()
    {
        return $this->belongsTo(Santri::class);
    }
}