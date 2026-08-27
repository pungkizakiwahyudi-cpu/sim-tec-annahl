<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InfaqTarif extends Model
{
    use HasFactory;

    protected $table = 'infaq_tarifs';

    protected $fillable = [
        'kategori',
        'nominal',
    ];

    protected function casts(): array
    {
        return [
            'nominal' => 'decimal:2',
        ];
    }
}
