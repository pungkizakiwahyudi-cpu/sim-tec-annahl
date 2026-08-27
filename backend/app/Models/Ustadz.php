<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ustadz extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'ustadzs';

    protected $fillable = [
        'user_id',
        'nip',
        'bidang_ajar',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function kelas()
    {
        return $this->hasMany(Kelas::class);
    }
}