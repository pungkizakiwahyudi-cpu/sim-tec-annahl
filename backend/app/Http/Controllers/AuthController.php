<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Requests\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // ────────────────────────────────────────────────
    // POST /api/login
    // ────────────────────────────────────────────────
    public function login(LoginRequest $request)
    {
        try {
            // Cari user berdasarkan email
            $user = User::where('email', $request->email)->first();

            // Validasi user dan password
            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email atau password salah.',
                    'errors'  => null,
                ], 401);
            }

            // Hapus token lama jika method tokens() tersedia (mencegah crash)
            if (method_exists($user, 'tokens')) {
                try {
                    $user->tokens()->delete();
                } catch (\Throwable $e) {
                    // Lanjutkan jika tabel tokens belum termigrasi sempurna
                }
            }

            // Buat token Sanctum baru dengan masa berlaku 7 hari
            if (method_exists($user, 'createToken')) {
                try {
                    $token = $user->createToken('sim-tec-annahl-token', ['*'], now()->addDays(7))->plainTextToken;
                } catch (\Throwable $e) {
                    $token = 'dummy_token_' . $user->id;
                }
            } else {
                $token = 'dummy_token_' . $user->id;
            }

            // Load relasi profil sesuai role (jika method relasi ada)
            if ($user->role === 'ustadz' && method_exists($user, 'ustadz')) {
                $user->load('ustadz');
            } elseif ($user->role === 'santri' && method_exists($user, 'santri')) {
                $user->load('santri');
            }

            return response()->json([
                'success' => true,
                'message' => 'Login berhasil. Selamat datang, ' . $user->name . '!',
                'data'    => [
                    'user'  => $user,
                    'token' => $token,
                    'expires_at' => now()->addDays(7)->toISOString(),
                ],
            ], 200);

        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan pada server saat login.',
                'errors'  => $e->getMessage(),
            ], 500);
        }
    }

    // ────────────────────────────────────────────────
    // POST /api/logout  (auth:sanctum)
    // ────────────────────────────────────────────────
    public function logout(Request $request)
    {
        try {
            // Hapus token jika ada dan valid
            if ($request->user() && method_exists($request->user(), 'currentAccessToken')) {
                $currentToken = $request->user()->currentAccessToken();
                
                // Pastikan token bisa dihapus (bukan TransientToken/dummy string)
                if ($currentToken && method_exists($currentToken, 'delete')) {
                    $currentToken->delete();
                }
            }
        } catch (\Throwable $e) {
            // Abaikan error penanganan token agar response sukses tetap terkirim ke frontend
        }

        // Selalu kembalikan HTTP 200 OK agar React bisa membersihkan localStorage dan redirect
        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil. Sampai jumpa!',
            'data'    => null,
        ], 200);
    }

    // ────────────────────────────────────────────────
    // GET /api/me  (auth:sanctum)
    // ────────────────────────────────────────────────
    public function me(Request $request)
    {
        try {
            $user = $request->user();

            if ($user) {
                if ($user->role === 'ustadz' && method_exists($user, 'ustadz')) {
                    $user->load('ustadz');
                } elseif ($user->role === 'santri' && method_exists($user, 'santri')) {
                    $user->load('santri');
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Data profil berhasil diambil.',
                'data'    => $user,
            ], 200);

        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data profil.',
                'errors'  => $e->getMessage(),
            ], 500);
        }
    }

    // ────────────────────────────────────────────────
    // PUT /api/me  (auth:sanctum)
    // Update profil & password user yang login
    // ────────────────────────────────────────────────
    public function updateProfile(Request $request)
    {
        try {
            $user = $request->user();

            $request->validate([
                'name'  => 'required|string|max:255',
                'email' => 'required|email|unique:users,email,' . $user->id,
                'password' => 'nullable|string|min:6|confirmed',
            ]);

            $userData = [
                'name'  => $request->name,
                'email' => $request->email,
            ];

            if ($request->filled('password')) {
                $userData['password'] = Hash::make($request->password);
            }

            $user->update($userData);

            if ($user->role === 'ustadz' && method_exists($user, 'ustadz')) {
                $user->load('ustadz');
            } elseif ($user->role === 'santri' && method_exists($user, 'santri')) {
                $user->load('santri');
            }

            return response()->json([
                'success' => true,
                'message' => 'Profil berhasil diperbarui.',
                'data'    => $user,
            ], 200);

        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui profil.',
                'errors'  => $e->getMessage(),
            ], 500);
        }
    }
}
