<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Absensi extends Model
{
    use HasFactory;

    protected $table = 'absensis';

    protected $fillable = [
        'kelas_id',
        'santri_id',
        'tanggal',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
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