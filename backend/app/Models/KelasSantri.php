<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class KelasSantri extends Model
{
    use HasFactory;

    protected $table = 'kelas_santri';

    protected $fillable = [
        'kelas_id',
        'santri_id',
    ];

    // Relasi ke Kelas
    public function kelas()
    {
        return $this->belongsTo(Kelas::class);
    }

    // Relasi ke Santri
    public function santri()
    {
        return $this->belongsTo(Santri::class);
    }
}