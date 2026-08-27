<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Santri extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'santris';

    protected $fillable = [
        'user_id',
        'kelas_id',
        'nis',
        'jenis_kelamin',
        'kategori',
        'tempat_lahir',
        'tanggal_lahir',
        'alamat',
        'nama_orang_tua',
        'no_hp_orang_tua', // <--- Pastikan nama kolom di database sesuai
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function kelas()
    {
        return $this->belongsTo(Kelas::class);
    }

    public function infaqPembayaran()
    {
        return $this->hasMany(InfaqPembayaran::class);
    }

    public function catatanHijaiyah()
    {
        return $this->hasMany(CatatanHijaiyah::class);
    }
}
