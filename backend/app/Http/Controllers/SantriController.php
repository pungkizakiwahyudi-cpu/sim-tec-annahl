<?php

namespace App\Http\Controllers;

use App\Models\Santri;
use App\Models\Absensi;
use App\Models\NilaiPerkembangan;
use App\Models\InfaqPembayaran;
use App\Models\CatatanHijaiyah;
use App\Http\Requests\UploadBuktiInfaqRequest;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;

class SantriController extends Controller
{
    // Helper: ambil data santri dari user yang login
    private function getSantri(Request $request)
    {
        return $request->user()->santri;
    }

    private function hurufHijaiyah(): array
    {
        return ['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'و', 'ه', 'ء', 'ي'];
    }

    private function getKategoriSantri(Santri $santri): string
    {
        $santri->loadMissing('kelas');

        if ($santri->kategori) {
            return $santri->kategori;
        }

        if ($santri->kelas?->kategori) {
            return $santri->kelas->kategori;
        }

        return $santri->jenis_kelamin === 'Perempuan' ? 'akhwat' : 'akhi';
    }

    private function canUseCatatanHijaiyah(Santri $santri): bool
    {
        return in_array($this->getKategoriSantri($santri), ['akhi', 'akhwat'], true);
    }

    // ────────────────────────────────────────────────
    // GET /api/santri/profil
    // ────────────────────────────────────────────────
    public function getProfilSaya(Request $request)
    {
        try {
            $santri = $this->getSantri($request);

            if (!$santri) {
                return response()->json([
                    'success' => false,
                    'message' => 'Profil santri tidak ditemukan untuk akun ini.',
                    'errors'  => null,
                ], 404);
            }

            $santri->load(['user', 'kelas.ustadz.user']);
            $santri->setAttribute('kategori_sistem', $this->getKategoriSantri($santri));

            return response()->json([
                'success' => true,
                'message' => 'Profil berhasil diambil.',
                'data'    => $santri,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil profil.',
                'errors'  => $e->getMessage(),
            ], 500);
        }
    }

    // ────────────────────────────────────────────────
    // GET /api/santri/kelas
    // ────────────────────────────────────────────────
    public function getJadwalDanKelasSaya(Request $request)
    {
        try {
            $santri = $this->getSantri($request);
            if (!$santri) {
                return response()->json([
                    'success' => false,
                    'message' => 'Profil santri tidak ditemukan untuk akun ini.',
                    'errors'  => null,
                ], 404);
            }

            $santri->load(['kelas' => function ($q) {
                $q->with('ustadz.user')->withCount('santri');
            }]);

            return response()->json([
                'success' => true,
                'message' => 'Data kelas berhasil diambil.',
                'data'    => [
                    'kategori' => $this->getKategoriSantri($santri),
                    'kelas'    => $santri->kelas ? [$santri->kelas] : [],
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data kelas.',
                'errors'  => $e->getMessage(),
            ], 500);
        }
    }

    // ────────────────────────────────────────────────
    // GET /api/santri/nilai
    // ────────────────────────────────────────────────
    public function getNilaiSaya(Request $request)
    {
        try {
            $santri = $this->getSantri($request);
            if (!$santri) {
                return response()->json([
                    'success' => false,
                    'message' => 'Profil santri tidak ditemukan untuk akun ini.',
                    'errors'  => null,
                ], 404);
            }

            $nilai = NilaiPerkembangan::with('kelas')
                ->where('santri_id', $santri->id)
                ->when($request->kelas_id, fn($q) => $q->where('kelas_id', $request->kelas_id))
                ->orderBy('tanggal', 'desc')
                ->paginate($request->per_page ?? 15);

            return response()->json([
                'success' => true,
                'message' => 'Data nilai berhasil diambil.',
                'data'    => $nilai,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data nilai.',
                'errors'  => $e->getMessage(),
            ], 500);
        }
    }

    // ────────────────────────────────────────────────
    // GET /api/santri/absensi
    // ────────────────────────────────────────────────
    public function getAbsensiSaya(Request $request)
    {
        try {
            $santri = $this->getSantri($request);
            if (!$santri) {
                return response()->json([
                    'success' => false,
                    'message' => 'Profil santri tidak ditemukan untuk akun ini.',
                    'errors'  => null,
                ], 404);
            }

            $absensi = Absensi::with('kelas')
                ->where('santri_id', $santri->id)
                ->when($request->bulan, fn($q) => $q->whereMonth('tanggal', $request->bulan))
                ->when($request->tahun, fn($q) => $q->whereYear('tanggal', $request->tahun))
                ->orderBy('tanggal', 'desc')
                ->get();

            // Hitung rekap kehadiran
            $rekap = [
                'hadir' => $absensi->where('status', 'hadir')->count(),
                'sakit' => $absensi->where('status', 'sakit')->count(),
                'izin'  => $absensi->where('status', 'izin')->count(),
                'alfa'  => $absensi->where('status', 'alfa')->count(),
                'total' => $absensi->count(),
            ];

            if ($rekap['total'] > 0) {
                $rekap['persentase_kehadiran'] = round(($rekap['hadir'] / $rekap['total']) * 100, 2);
            } else {
                $rekap['persentase_kehadiran'] = 0;
            }

            return response()->json([
                'success' => true,
                'message' => 'Data absensi berhasil diambil.',
                'data'    => [
                    'rekap'   => $rekap,
                    'absensi' => $absensi,
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data absensi.',
                'errors'  => $e->getMessage(),
            ], 500);
        }
    }

    // ────────────────────────────────────────────────
    // GET /api/santri/infaq
    // ────────────────────────────────────────────────
    public function getTagihanInfaq(Request $request)
    {
        try {
            $santri = $this->getSantri($request);
            if (!$santri) {
                return response()->json([
                    'success' => false,
                    'message' => 'Profil santri tidak ditemukan untuk akun ini.',
                    'errors'  => null,
                ], 404);
            }

            $infaq = InfaqPembayaran::where('santri_id', $santri->id)
                ->orderBy('tahun', 'desc')
                ->orderBy('bulan', 'desc')
                ->get()
                ->map(function ($item) {
                    return [
                        'id'             => $item->id,
                        'bulan'          => $item->bulan,
                        'nama_bulan'     => $item->nama_bulan,
                        'tahun'          => $item->tahun,
                        'jumlah'         => (float) $item->jumlah,
                        'status'         => $item->status,
                        'catatan'        => $item->catatan,
                        'bukti_transfer' => $item->bukti_transfer
                            ? Storage::url($item->bukti_transfer)
                            : null,
                        'created_at'     => $item->created_at,
                        'updated_at'     => $item->updated_at,
                    ];
                });

            $totalTagihan   = $infaq->sum('jumlah');
            $totalLunas     = $infaq->where('status', 'lunas')->sum('jumlah');
            $totalBelumLunas= $infaq->filter(fn($item) => $item['status'] !== 'lunas')->sum('jumlah');

            return response()->json([
                'success' => true,
                'message' => 'Data tagihan infaq berhasil diambil.',
                'data'    => [
                    'ringkasan' => [
                        'total_tagihan'    => (float) $totalTagihan,
                        'total_lunas'      => (float) $totalLunas,
                        'total_belum_lunas'=> (float) $totalBelumLunas,
                    ],
                    'infaq' => $infaq,
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data infaq.',
                'errors'  => $e->getMessage(),
            ], 500);
        }
    }

    // ────────────────────────────────────────────────
    // POST /api/santri/infaq/{id}/upload
    // Upload bukti transfer infaq
    // ────────────────────────────────────────────────
    public function uploadBuktiInfaq(UploadBuktiInfaqRequest $request, $id)
    {
        try {
            $santri = $this->getSantri($request);
            if (!$santri) {
                return response()->json([
                    'success' => false,
                    'message' => 'Profil santri tidak ditemukan untuk akun ini.',
                    'errors'  => null,
                ], 404);
            }

            // Pastikan infaq ini milik santri yang login
            $infaq = InfaqPembayaran::where('id', $id)
                ->where('santri_id', $santri->id)
                ->firstOrFail();

            // Tolak upload jika sudah lunas
            if ($infaq->status === 'lunas') {
                return response()->json([
                    'success' => false,
                    'message' => 'Infaq ini sudah berstatus lunas, tidak perlu upload bukti.',
                    'errors'  => null,
                ], 422);
            }

            // Hapus file lama jika ada
            if ($infaq->bukti_transfer && Storage::disk('public')->exists($infaq->bukti_transfer)) {
                Storage::disk('public')->delete($infaq->bukti_transfer);
            }

            // Simpan file baru
            $path = $request->file('bukti_transfer')->store(
                'bukti_infaq/' . $santri->id,
                'public'
            );

            // Update status ke proses_verifikasi
            $infaq->update([
                'bukti_transfer' => $path,
                'status'         => 'proses_verifikasi',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Bukti transfer berhasil diunggah. Menunggu verifikasi admin.',
                'data'    => [
                    'id'             => $infaq->id,
                    'status'         => $infaq->status,
                    'bukti_transfer' => Storage::url($path),
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengunggah bukti transfer.',
                'errors'  => $e->getMessage(),
            ], 500);
        }
    }

    public function getHurufHijaiyah()
    {
        return response()->json([
            'success' => true,
            'message' => 'Daftar huruf hijaiyah berhasil diambil.',
            'data'    => $this->hurufHijaiyah(),
        ], 200);
    }

    public function getCatatanHijaiyah(Request $request)
    {
        try {
            $santri = $this->getSantri($request);
            if (!$santri) {
                return response()->json([
                    'success' => false,
                    'message' => 'Profil santri tidak ditemukan untuk akun ini.',
                    'errors'  => null,
                ], 404);
            }

            if (!$this->canUseCatatanHijaiyah($santri)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Catatan hijaiyah mandiri hanya tersedia untuk santri Akhi dan Akhwat.',
                    'errors'  => null,
                ], 403);
            }

            $catatan = CatatanHijaiyah::where('santri_id', $santri->id)
                ->when($request->huruf, fn($q) => $q->where('huruf', $request->huruf))
                ->orderBy('tanggal', 'desc')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Catatan hijaiyah berhasil diambil.',
                'data'    => [
                    'huruf'   => $this->hurufHijaiyah(),
                    'catatan' => $catatan,
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil catatan hijaiyah.',
                'errors'  => $e->getMessage(),
            ], 500);
        }
    }

    public function storeCatatanHijaiyah(Request $request)
    {
        try {
            $santri = $this->getSantri($request);
            if (!$santri) {
                return response()->json([
                    'success' => false,
                    'message' => 'Profil santri tidak ditemukan untuk akun ini.',
                    'errors'  => null,
                ], 404);
            }

            if (!$this->canUseCatatanHijaiyah($santri)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Catatan hijaiyah mandiri hanya tersedia untuk santri Akhi dan Akhwat.',
                    'errors'  => null,
                ], 403);
            }

            $validated = $request->validate([
                'huruf'   => ['required', 'string', Rule::in($this->hurufHijaiyah())],
                'catatan' => ['required', 'string', 'max:1000'],
                'tanggal' => ['nullable', 'date', 'before_or_equal:today'],
            ]);

            $catatan = CatatanHijaiyah::create([
                'santri_id' => $santri->id,
                'huruf'     => $validated['huruf'],
                'catatan'   => $validated['catatan'],
                'tanggal'   => $validated['tanggal'] ?? now()->toDateString(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Catatan hijaiyah berhasil disimpan.',
                'data'    => $catatan,
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan catatan hijaiyah.',
                'errors'  => $e->getMessage(),
            ], 500);
        }
    }

    public function updateCatatanHijaiyah(Request $request, $id)
    {
        try {
            $santri = $this->getSantri($request);
            if (!$santri) {
                return response()->json([
                    'success' => false,
                    'message' => 'Profil santri tidak ditemukan untuk akun ini.',
                    'errors'  => null,
                ], 404);
            }

            if (!$this->canUseCatatanHijaiyah($santri)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Catatan hijaiyah mandiri hanya tersedia untuk santri Akhi dan Akhwat.',
                    'errors'  => null,
                ], 403);
            }

            $validated = $request->validate([
                'huruf'   => ['required', 'string', Rule::in($this->hurufHijaiyah())],
                'catatan' => ['required', 'string', 'max:1000'],
                'tanggal' => ['nullable', 'date', 'before_or_equal:today'],
            ]);

            $catatan = CatatanHijaiyah::where('santri_id', $santri->id)->findOrFail($id);
            $catatan->update([
                'huruf'   => $validated['huruf'],
                'catatan' => $validated['catatan'],
                'tanggal' => $validated['tanggal'] ?? $catatan->tanggal,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Catatan hijaiyah berhasil diperbarui.',
                'data'    => $catatan,
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui catatan hijaiyah.',
                'errors'  => $e->getMessage(),
            ], 500);
        }
    }

    public function deleteCatatanHijaiyah(Request $request, $id)
    {
        try {
            $santri = $this->getSantri($request);
            if (!$santri) {
                return response()->json([
                    'success' => false,
                    'message' => 'Profil santri tidak ditemukan untuk akun ini.',
                    'errors'  => null,
                ], 404);
            }

            $catatan = CatatanHijaiyah::where('santri_id', $santri->id)->findOrFail($id);
            $catatan->delete();

            return response()->json([
                'success' => true,
                'message' => 'Catatan hijaiyah berhasil dihapus.',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus catatan hijaiyah.',
                'errors'  => $e->getMessage(),
            ], 500);
        }
    }
}
