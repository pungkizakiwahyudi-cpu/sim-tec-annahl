<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InfaqPembayaran extends Model
{
    use HasFactory;

    protected $table = 'infaq_pembayarans';

    protected $fillable = [
        'santri_id',
        'bulan',
        'tahun',
        'jumlah',
        'status',
        'bukti_transfer',
        'catatan',
    ];

    protected function casts(): array
    {
        return [
            'jumlah' => 'decimal:2',
        ];
    }

    public function santri()
    {
        return $this->belongsTo(Santri::class, 'santri_id');
    }

    public function getNamaBulanAttribute(): string
    {
        $bulan = [
            1 => 'Januari',
            2 => 'Februari',
            3 => 'Maret',
            4 => 'April',
            5 => 'Mei',
            6 => 'Juni',
            7 => 'Juli',
            8 => 'Agustus',
            9 => 'September',
            10 => 'Oktober',
            11 => 'November',
            12 => 'Desember',
        ];

        return $bulan[(int) $this->bulan] ?? (string) $this->bulan;
    }
}
