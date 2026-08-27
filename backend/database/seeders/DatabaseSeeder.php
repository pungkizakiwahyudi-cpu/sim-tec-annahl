<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Membuat akun admin tec-annahl
        User::firstOrCreate(
            ['email' => 'admin@tec-annahl.id'],
            [
                'name'     => 'Admin SIM TEC',
                'password' => Hash::make('password'), // Silakan sesuaikan password jika beda
                'role'     => 'admin',
            ]
        );
    }
}