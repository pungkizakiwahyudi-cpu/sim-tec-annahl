<?php

namespace App\Http\Controllers;

use App\Models\Kelas;
use App\Models\Absensi;
use App\Models\NilaiPerkembangan;
use App\Http\Requests\BulkAbsensiRequest;
use App\Http\Requests\StoreNilaiRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UstadzController extends Controller
{
    // Helper: ambil data ustadz dari user yang login
    private function getUstadz(Request $request)
    {
        return $request->user()->ustadz ?? null;
    }

    // ────────────────────────────────────────────────
    // GET /api/ustadz/kelas
    // Ambil semua kelas yang diampu oleh ustadz yang login
    // ────────────────────────────────────────────────
    public function getKelasSaya(Request $request)
    {
        try {
            $ustadz = $this->getUstadz($request);

            if (!$ustadz) {
                return response()->json([
                    'success' => false,
                    'message' => 'Profil ustadz tidak ditemukan untuk akun ini.',
                    'errors'  => null,
                ], 404);
            }

            $kelas = Kelas::with(['santri.user'])
                ->where('ustadz_id', $ustadz->id)
                ->orderBy('nama_kelas', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Data kelas berhasil diambil.',
                'data'    => $kelas,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data kelas: ' . $e->getMessage(),
                'errors'  => $e->getMessage(),
            ], 500);
        }
    }

    // ────────────────────────────────────────────────
    // GET /api/ustadz/kelas/{kelas_id}/santri
    // Ambil daftar santri di kelas tertentu milik ustadz ini
    // ────────────────────────────────────────────────
    public function getSantriByKelas(Request $request, $kelas_id)
    {
        try {
            $ustadz = $this->getUstadz($request);

            if (!$ustadz) {
                return response()->json([
                    'success' => false,
                    'message' => 'Profil ustadz tidak ditemukan.',
                ], 404);
            }

            // Pastikan kelas ini milik ustadz yang login
            $kelas = Kelas::where('id', $kelas_id)
                ->where('ustadz_id', $ustadz->id)
                ->with(['santri.user'])
                ->firstOrFail();

            return response()->json([
                'success' => true,
                'message' => 'Daftar santri kelas ' . $kelas->nama_kelas . ' berhasil diambil.',
                'data'    => [
                    'kelas'  => $kelas,
                    'santri' => $kelas->santri,
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Kelas tidak ditemukan atau Anda tidak berhak mengaksesnya: ' . $e->getMessage(),
                'errors'  => $e->getMessage(),
            ], 403);
        }
    }

    // ────────────────────────────────────────────────
    // POST /api/ustadz/absensi/bulk
    // Submit absensi satu kelas sekaligus
    // ────────────────────────────────────────────────
    public function storeBulkAbsensi(BulkAbsensiRequest $request)
    {
        DB::beginTransaction();
        try {
            $ustadz = $this->getUstadz($request);

            if (!$ustadz) {
                return response()->json([
                    'success' => false,
                    'message' => 'Profil ustadz tidak ditemukan.',
                ], 404);
            }

            // Pastikan kelas ini milik ustadz yang login
            $kelas = Kelas::where('id', $request->kelas_id)
                ->where('ustadz_id', $ustadz->id)
                ->firstOrFail();

            $inserted = 0;
            $updated  = 0;

            foreach ($request->absensi as $item) {
                $result = Absensi::updateOrCreate(
                    [
                        'kelas_id'  => $kelas->id,
                        'santri_id' => $item['santri_id'],
                        'tanggal'   => $request->tanggal,
                    ],
                    [
                        'status' => $item['status'],
                    ]
                );

                if ($result->wasRecentlyCreated) {
                    $inserted++;
                } else {
                    $updated++;
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Absensi berhasil disimpan. Baru: {$inserted}, Diperbarui: {$updated}.",
                'data'    => [
                    'kelas_id' => $kelas->id,
                    'tanggal'  => $request->tanggal,
                    'inserted' => $inserted,
                    'updated'  => $updated,
                ],
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan absensi: ' . $e->getMessage(),
                'errors'  => $e->getMessage(),
            ], 500);
        }
    }

    // ────────────────────────────────────────────────
    // GET /api/ustadz/absensi?kelas_id=&tanggal=
    // Ambil data absensi kelas pada tanggal tertentu
    // ────────────────────────────────────────────────
    public function getAbsensiByKelas(Request $request)
    {
        try {
            $request->validate([
                'kelas_id' => ['required', 'integer', 'exists:kelas,id'],
                'tanggal'  => ['required', 'date'],
            ]);

            $ustadz = $this->getUstadz($request);

            if (!$ustadz) {
                return response()->json([
                    'success' => false,
                    'message' => 'Profil ustadz tidak ditemukan.',
                ], 404);
            }

            $kelas = Kelas::where('id', $request->kelas_id)
                ->where('ustadz_id', $ustadz->id)
                ->firstOrFail();

            $absensi = Absensi::with('santri.user')
                ->where('kelas_id', $kelas->id)
                ->where('tanggal', $request->tanggal)
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Data absensi berhasil diambil.',
                'data'    => [
                    'kelas'   => $kelas->only(['id', 'nama_kelas', 'program_belajar', 'kategori', 'deskripsi']),
                    'tanggal' => $request->tanggal,
                    'absensi' => $absensi,
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data absensi: ' . $e->getMessage(),
                'errors'  => $e->getMessage(),
            ], 500);
        }
    }

    // ────────────────────────────────────────────────
    // POST /api/ustadz/nilai
    // Simpan nilai perkembangan hafalan santri
    // ────────────────────────────────────────────────
    public function storeNilaiPerkembangan(StoreNilaiRequest $request)
    {
        DB::beginTransaction();
        try {
            $ustadz = $this->getUstadz($request);

            if (!$ustadz) {
                return response()->json([
                    'success' => false,
                    'message' => 'Profil ustadz tidak ditemukan.',
                ], 404);
            }

            // Pastikan kelas ini milik ustadz yang login
            $kelas = Kelas::where('id', $request->kelas_id)
                ->where('ustadz_id', $ustadz->id)
                ->firstOrFail();

            // Pastikan santri terdaftar di kelas ini
            $santriDiKelas = $kelas->santri()->where('santris.id', $request->santri_id)->exists();
            if (!$santriDiKelas) {
                return response()->json([
                    'success' => false,
                    'message' => 'Santri tidak terdaftar di kelas ini.',
                    'errors'  => null,
                ], 422);
            }

            $nilai = NilaiPerkembangan::create([
                'kelas_id'    => $kelas->id,
                'santri_id'   => $request->santri_id,
                'tanggal'     => $request->tanggal,
                'hafalan_baru'=> $request->hafalan_baru,
                'murojaah'    => $request->murojaah,
                'nilai_tajwid'=> $request->nilai_tajwid,
                'catatan'     => $request->catatan,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Nilai perkembangan berhasil disimpan.',
                'data'    => $nilai->load('santri.user'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan nilai perkembangan: ' . $e->getMessage(),
                'errors'  => $e->getMessage(),
            ], 500);
        }
    }

    // ────────────────────────────────────────────────
    // GET /api/ustadz/nilai?kelas_id=&santri_id=
    // Ambil riwayat nilai perkembangan (FIXED)
    // ────────────────────────────────────────────────
    public function getNilaiPerkembangan(Request $request)
    {
        try {
            $ustadz = $this->getUstadz($request);

            if (!$ustadz) {
                return response()->json([
                    'success' => true,
                    'message' => 'Profil ustadz belum disetting.',
                    'data'    => [],
                ], 200);
            }

            // Ambil ID semua kelas milik ustadz ini
            $kelasIds = Kelas::where('ustadz_id', $ustadz->id)->pluck('id');

            // Ambil data nilai berdasarkan santri yang ada di kelas ustadz
            $query = NilaiPerkembangan::with(['santri.user', 'kelas'])
                ->whereHas('santri', function ($q) use ($kelasIds, $request) {
                    $q->whereIn('kelas_id', $kelasIds);
                    if ($request->kelas_id) {
                        $q->where('kelas_id', $request->kelas_id);
                    }
                })
                ->when($request->santri_id, fn($q) => $q->where('santri_id', $request->santri_id))
                ->orderBy('tanggal', 'desc');

            $nilai = $request->per_page
                ? $query->paginate((int) $request->per_page)
                : $query->get();

            return response()->json([
                'success' => true,
                'message' => 'Data nilai perkembangan berhasil diambil.',
                'data'    => $nilai,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data nilai: ' . $e->getMessage(),
                'errors'  => $e->getMessage(),
            ], 500);
        }
    }

    // ────────────────────────────────────────────────
    // GET /api/ustadz/jadwal
    // Ringkasan jadwal mengajar ustadz
    // ────────────────────────────────────────────────
    public function getJadwalMengajar(Request $request)
    {
        try {
            $ustadz = $this->getUstadz($request);

            if (!$ustadz) {
                return response()->json([
                    'success' => true,
                    'message' => 'Profil ustadz belum disetting.',
                    'data'    => [
                        'ustadz'      => $request->user(),
                        'total_kelas' => 0,
                        'kelas'       => [],
                    ],
                ], 200);
            }

            $kelas = Kelas::with(['santri' => function ($q) {
                $q->with('user')->where('status', 'aktif');
            }])
            ->where('ustadz_id', $ustadz->id)
            ->get()
            ->map(function ($k) {
                return [
                    'id'              => $k->id,
                    'nama_kelas'      => $k->nama_kelas,
                    'program_belajar' => $k->program_belajar,
                    'kategori'        => $k->kategori,
                    'deskripsi'       => $k->deskripsi,
                    'jumlah_santri'   => $k->santri->count(),
                    'santri'          => $k->santri,
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Jadwal mengajar berhasil diambil.',
                'data'    => [
                    'ustadz'      => $request->user()->load('ustadz'),
                    'total_kelas' => $kelas->count(),
                    'kelas'       => $kelas,
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil jadwal mengajar: ' . $e->getMessage(),
                'errors'  => $e->getMessage(),
            ], 500);
        }
    }
}