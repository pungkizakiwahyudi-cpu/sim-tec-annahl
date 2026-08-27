<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Attribute yang bisa diisi secara mass-assignment.
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * Attribute yang disembunyikan saat dikonversi ke JSON.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Cast attribute.
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Relasi ke Ustadz (Jika role = ustadz)
     */
    public function ustadz()
    {
        return $this->hasOne(Ustadz::class);
    }

    /**
     * Relasi ke Santri (Jika role = santri)
     */
    public function santri()
    {
        return $this->hasOne(Santri::class);
    }
}