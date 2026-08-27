<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TahunAjaran extends Model
{
    use HasFactory;

    protected $table = 'tahun_ajarans';

    protected $fillable = [
        'nama',
        'tanggal_mulai',
        'tanggal_selesai',
        'is_aktif',
    ];

    protected $casts = [
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
        'is_aktif' => 'boolean',
    ];

    public static function getAktif(): ?self
    {
        return static::where('is_aktif', true)->first();
    }
}