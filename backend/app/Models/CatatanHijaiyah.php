<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CatatanHijaiyah extends Model
{
    use HasFactory;

    protected $table = 'catatan_hijaiyahs';

    protected $fillable = [
        'santri_id',
        'tanggal',
        'huruf',
        'catatan',
    ];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
        ];
    }

    public function santri()
    {
        return $this->belongsTo(Santri::class);
    }
}
