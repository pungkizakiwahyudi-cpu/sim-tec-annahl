<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Santri;
use App\Models\Kelas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class PublicPendaftaranController extends Controller
{
    private const KATEGORI = ['akhi', 'akhwat', 'anak_anak'];

    private function normalizeKategori(?string $kategori, ?string $jenisKelamin = null): string
    {
        $value = strtolower(trim((string) $kategori));
        $value = str_replace(['-', ' '], '_', $value);

        if (in_array($value, self::KATEGORI, true)) {
            return $value;
        }

        return $jenisKelamin === 'Perempuan' || $jenisKelamin === 'P'
            ? 'akhwat'
            : 'akhi';
    }

    private function normalizeJenisKelamin(?string $jenisKelamin): ?string
    {
        return match ($jenisKelamin) {
            'L' => 'Laki-laki',
            'P' => 'Perempuan',
            default => $jenisKelamin,
        };
    }

    // ────────────────────────────────────────────────
    // POST /api/pendaftaran-public
    // Pendaftaran santri baru dari halaman publik
    // ────────────────────────────────────────────────
    public function store(Request $request)
    {
        $request->validate([
            'name'            => 'required|string|max:255',
            'email'           => 'required|email|unique:users,email',
            'password'        => 'required|string|min:6',
            'nis'             => 'required|string|unique:santris,nis',
            'jenis_kelamin'   => 'required|in:L,P,Laki-laki,Perempuan',
            'kategori'        => 'nullable|in:akhi,akhwat,anak_anak',
            'tempat_lahir'    => 'nullable|string|max:100',
            'tanggal_lahir'   => 'nullable|date',
            'alamat'          => 'nullable|string',
            'nama_orang_tua'  => 'nullable|string|max:255',
            'no_hp_orang_tua' => 'nullable|string|max:20',
            'kelas_id'        => 'nullable|exists:kelas,id',
        ]);

        DB::beginTransaction();
        try {
            $user = User::create([
                'name'     => $request->name,
                'email'    => $request->email,
                'password' => Hash::make($request->password),
                'role'     => 'santri',
            ]);

            $jenisKelamin = $this->normalizeJenisKelamin($request->jenis_kelamin);
            $kelas = $request->kelas_id ? Kelas::find($request->kelas_id) : null;

            $santri = Santri::create([
                'user_id'         => $user->id,
                'kelas_id'        => $request->kelas_id ?? null,
                'nis'             => $request->nis,
                'jenis_kelamin'   => $jenisKelamin,
                'kategori'        => $this->normalizeKategori($request->kategori ?? $kelas?->kategori, $jenisKelamin),
                'tempat_lahir'    => $request->tempat_lahir ?? null,
                'tanggal_lahir'   => $request->tanggal_lahir ?? null,
                'alamat'          => $request->alamat ?? null,
                'nama_orang_tua'  => $request->nama_orang_tua ?? null,
                'no_hp_orang_tua' => $request->no_hp_orang_tua ?? null,
                'status'          => 'pendaftar_baru',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pendaftaran berhasil. Silakan tunggu verifikasi admin.',
                'data'    => $santri->load(['user', 'kelas']),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal melakukan pendaftaran.',
                'errors'  => $e->getMessage(),
            ], 500);
        }
    }

    // ────────────────────────────────────────────────
    // GET /api/program-public
    // Ambil daftar program pilihan untuk pendaftaran
    // ────────────────────────────────────────────────
    public function getProgramPilihan()
    {
        try {
            $kelas = Kelas::with('ustadz.user')
                ->orderBy('nama_kelas', 'asc')
                ->get()
                ->map(function ($k) {
                    return [
                        'id'              => $k->id,
                        'nama_kelas'      => $k->nama_kelas,
                        'program_belajar' => $k->program_belajar,
                        'kategori'        => $k->kategori,
                        'deskripsi'       => $k->deskripsi,
                        'ustadz'          => $k->ustadz?->user?->name,
                    ];
                });

            return response()->json([
                'success' => true,
                'message' => 'Daftar program berhasil diambil.',
                'data'    => $kelas,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil daftar program.',
                'errors'  => $e->getMessage(),
            ], 500);
        }
    }
}