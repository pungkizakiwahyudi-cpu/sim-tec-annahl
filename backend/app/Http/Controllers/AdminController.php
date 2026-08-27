<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSantriRequest;
use App\Http\Requests\StoreUstadzRequest;
use App\Models\User;
use App\Models\Santri;
use App\Models\Ustadz;
use App\Models\Kelas;
use App\Models\Absensi;
use App\Models\InfaqPembayaran;
use App\Models\InfaqTarif;
use App\Models\Setting;
use App\Models\TahunAjaran;
use App\Services\AuditLogService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AdminController extends Controller
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

    private function resolveSantriKategori(Santri $santri): string
    {
        if ($santri->kategori) {
            return $this->normalizeKategori($santri->kategori, $santri->jenis_kelamin);
        }

        if ($santri->relationLoaded('kelas') && $santri->kelas?->kategori) {
            return $this->normalizeKategori($santri->kelas->kategori, $santri->jenis_kelamin);
        }

        return $this->normalizeKategori(null, $santri->jenis_kelamin);
    }

    private function getKategoriLabel(string $kategori): string
    {
        return [
            'akhi' => 'Akhi',
            'akhwat' => 'Akhwat',
            'anak_anak' => 'Anak-anak',
        ][$kategori] ?? $kategori;
    }

    private function getTarifMap(): array
    {
        $defaults = [
            'akhi' => 150000,
            'akhwat' => 150000,
            'anak_anak' => 100000,
        ];

        $saved = InfaqTarif::query()
            ->pluck('nominal', 'kategori')
            ->map(fn ($nominal) => (float) $nominal)
            ->all();

        return array_replace($defaults, array_intersect_key($saved, $defaults));
    }

    // ==========================================
    // 1. DASHBOARD STATS
    // ==========================================
    public function getDashboardStats()
    {
        try {
            // Hitung Santri Aktif & Pending
            $totalSantri      = Santri::where('status', 'aktif')->count();
            $pendaftaranBaru = Santri::whereIn('status', ['pending', 'pendaftar_baru', 'Pendaftar Baru', 'pendaftar baru'])->count();
            
            // Ustadz di DB tidak memiliki kolom 'status', jadi langsung count()
            $totalUstadz     = Ustadz::count(); 
            
            // Total Kelas
            $totalKelas      = Kelas::count();
            
            $santriPerKategori = Santri::query()
                ->where('status', 'aktif')
                ->select(
                    DB::raw("CASE 
                        WHEN kategori IS NOT NULL AND kategori != '' THEN kategori 
                        WHEN jenis_kelamin = 'Perempuan' THEN 'akhwat' 
                        ELSE 'akhi' 
                    END as kategori_resolved"),
                    DB::raw('COUNT(*) as total')
                )
                ->groupBy('kategori_resolved')
                ->pluck('total', 'kategori_resolved');

            // Infaq menunggu verifikasi & total bulan ini
            $pendingInfaq    = InfaqPembayaran::whereIn('status', ['pending', 'proses_verifikasi'])->count();
            $belumLunasInfaq = InfaqPembayaran::whereIn('status', ['pending', 'belum_lunas', 'proses_verifikasi', 'ditolak'])->count();
            $pembayaranBulanIni = InfaqPembayaran::where('bulan', date('m'))
                ->where('tahun', date('Y'))
                ->where('status', 'lunas')
                ->sum('jumlah') ?? 0;

            // Absensi 7 hari terakhir
            $absensiMingguIni = Absensi::select(
                    'tanggal',
                    'status',
                    DB::raw('COUNT(*) as total')
                )
                ->where('tanggal', '>=', now()->subDays(6)->toDateString())
                ->where('tanggal', '<=', now()->toDateString())
                ->groupBy('tanggal', 'status')
                ->orderBy('tanggal', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Statistik dashboard berhasil diambil.',
                'data'    => [
                    'total_santri_aktif'        => $totalSantri,
                    'total_santri'              => $totalSantri,
                    'total_ustadz_aktif'       => $totalUstadz,
                    'total_ustadz'             => $totalUstadz,
                    'total_pendaftar_baru'      => $pendaftaranBaru,
                    'pendaftaran_pending'      => $pendaftaranBaru,
                    'total_kelas'              => $totalKelas,
                    'infaq_pending_count'      => $pendingInfaq,
                    'infaq_menunggu_verifikasi' => $pendingInfaq,
                    'infaq_belum_lunas_count'  => $belumLunasInfaq,
                    'total_infaq_bulan_ini'    => (float) $pembayaranBulanIni,
                    'infaq_lunas_bulan_ini'    => (float) $pembayaranBulanIni,
                    'santri_per_kategori'      => [
                        'akhi'      => (int) ($santriPerKategori['akhi'] ?? 0),
                        'akhwat'    => (int) ($santriPerKategori['akhwat'] ?? 0),
                        'anak_anak' => (int) ($santriPerKategori['anak_anak'] ?? 0),
                    ],
                    'absensi_minggu_ini'       => $absensiMingguIni,
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('AdminController@getDashboardStats Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data statistik.',
                'errors'  => $e->getMessage()
            ], 500);
        }
    }

    // ==========================================
    // 2. MANAGEMENT SANTRI
    // ==========================================
    public function getSantri(Request $request)
    {
        try {
            $query = Santri::with(['user', 'kelas'])
                ->when($request->status, fn($q) => $q->where('status', $request->status))
                ->when($request->kelas_id, fn($q) => $q->where('kelas_id', $request->kelas_id))
                ->when($request->kategori, fn($q) => $q->where('kategori', $this->normalizeKategori($request->kategori)))
                ->when($request->search, function ($q) use ($request) {
                    $q->where(function ($sub) use ($request) {
                        $sub->where('nis', 'like', '%' . $request->search . '%')
                            ->orWhereHas('user', fn($u) => $u->where('name', 'like', '%' . $request->search . '%')
                                ->orWhere('email', 'like', '%' . $request->search . '%'));
                    });
                })
                ->orderBy('created_at', 'desc');

            $santri = $request->per_page 
                ? $query->paginate((int) $request->per_page) 
                : $query->get();

            return response()->json([
                'success' => true,
                'message' => 'Data santri berhasil diambil.',
                'data'    => $santri
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data santri.',
                'errors'  => $e->getMessage()
            ], 500);
        }
    }

    public function getSantriDetail($id)
    {
        try {
            $santri = Santri::with(['user', 'kelas', 'infaqPembayaran'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'message' => 'Detail santri berhasil diambil.',
                'data'    => $santri
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data santri tidak ditemukan.',
                'errors'  => $e->getMessage()
            ], 404);
        }
    }

    public function storeSantri(StoreSantriRequest $request)
    {
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
                'no_hp_orang_tua' => $request->no_hp_orang_tua ?? $request->no_hp_ortu ?? null,
                'status'          => $request->status ?? 'aktif',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Santri berhasil ditambahkan.',
                'data'    => $santri->load(['user', 'kelas'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan santri.',
                'errors'  => $e->getMessage()
            ], 500);
        }
    }

    public function updateSantri(StoreSantriRequest $request, $id)
    {
        DB::beginTransaction();
        try {
            $santri = Santri::findOrFail($id);
            $user   = User::findOrFail($santri->user_id);

            $userData = [
                'name'  => $request->name,
                'email' => $request->email,
            ];

            if ($request->filled('password')) {
                $userData['password'] = Hash::make($request->password);
            }

            $user->update($userData);

            $jenisKelamin = $this->normalizeJenisKelamin($request->jenis_kelamin);
            $kelas = $request->kelas_id ? Kelas::find($request->kelas_id) : $santri->kelas;

            $santri->update([
                'kelas_id'        => $request->kelas_id ?? $santri->kelas_id,
                'nis'             => $request->nis,
                'jenis_kelamin'   => $jenisKelamin,
                'kategori'        => $this->normalizeKategori($request->kategori ?? $kelas?->kategori ?? $santri->kategori, $jenisKelamin),
                'tempat_lahir'    => $request->tempat_lahir ?? $santri->tempat_lahir,
                'tanggal_lahir'   => $request->tanggal_lahir ?? $santri->tanggal_lahir,
                'alamat'          => $request->alamat ?? $santri->alamat,
                'nama_orang_tua'  => $request->nama_orang_tua ?? $santri->nama_orang_tua,
                'no_hp_orang_tua' => $request->no_hp_orang_tua ?? $santri->no_hp_orang_tua,
                'status'          => $request->status ?? $santri->status,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Data santri berhasil diperbarui.',
                'data'    => $santri->load(['user', 'kelas'])
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui data santri.',
                'errors'  => $e->getMessage()
            ], 500);
        }
    }

    public function patchStatusPendaftaran(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:aktif,ditolak,pending,alumni,nonaktif,pendaftar_baru,diterima',
        ]);

        try {
            $santri = Santri::findOrFail($id);
            $santri->status = $request->status;
            $santri->save();

            return response()->json([
                'success' => true,
                'message' => 'Status pendaftaran santri berhasil diubah.',
                'data'    => $santri
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengubah status santri.',
                'errors'  => $e->getMessage()
            ], 500);
        }
    }

    public function deleteSantri($id)
    {
        DB::beginTransaction();
        try {
            $santri = Santri::findOrFail($id);
            $user   = User::findOrFail($santri->user_id);

            $santri->delete();
            $user->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Santri berhasil dihapus.'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus santri.',
                'errors'  => $e->getMessage()
            ], 500);
        }
    }

    // ==========================================
    // 3. MANAGEMENT USTADZ
    // ==========================================
    public function getUstadz(Request $request)
    {
        try {
            // Tambahkan ->withCount('kelas') di sini
            $query = Ustadz::with('user')
                ->withCount('kelas')
                ->when($request->search, function ($q) use ($request) {
                    $q->where('nip', 'like', '%' . $request->search . '%')
                      ->orWhereHas('user', fn($u) => $u->where('name', 'like', '%' . $request->search . '%'));
                })
                ->orderBy('created_at', 'desc');

            $ustadz = $request->per_page 
                ? $query->paginate((int) $request->per_page) 
                : $query->get();

            return response()->json([
                'success' => true,
                'message' => 'Data ustadz berhasil diambil.',
                'data'    => $ustadz
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data ustadz.',
                'errors'  => $e->getMessage()
            ], 500);
        }
    }

    public function storeUstadz(StoreUstadzRequest $request)
    {
        DB::beginTransaction();
        try {
            $user = User::create([
                'name'     => $request->name,
                'email'    => $request->email,
                'password' => Hash::make($request->password),
                'role'     => 'ustadz',
            ]);

            $ustadz = Ustadz::create([
                'user_id'     => $user->id,
                'nip'         => $request->nip,
                'bidang_ajar' => $request->bidang_ajar ?? $request->spesialisasi ?? null,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Ustadz berhasil ditambahkan.',
                'data'    => $ustadz->load('user')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan ustadz.',
                'errors'  => $e->getMessage()
            ], 500);
        }
    }

    public function updateUstadz(StoreUstadzRequest $request, $id)
    {
        DB::beginTransaction();
        try {
            $ustadz = Ustadz::findOrFail($id);
            $user   = User::findOrFail($ustadz->user_id);

            $userData = [
                'name'  => $request->name,
                'email' => $request->email,
            ];

            if ($request->filled('password')) {
                $userData['password'] = Hash::make($request->password);
            }

            $user->update($userData);

            $ustadz->update([
                'nip'         => $request->nip,
                'bidang_ajar' => $request->bidang_ajar ?? $request->spesialisasi ?? $ustadz->bidang_ajar,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Data ustadz berhasil diperbarui.',
                'data'    => $ustadz->load('user')
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui data ustadz.',
                'errors'  => $e->getMessage()
            ], 500);
        }
    }

    public function deleteUstadz($id)
    {
        DB::beginTransaction();
        try {
            $ustadz = Ustadz::findOrFail($id);
            $user   = User::findOrFail($ustadz->user_id);

            $ustadz->delete();
            $user->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Ustadz berhasil dihapus.'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus ustadz.',
                'errors'  => $e->getMessage()
            ], 500);
        }
    }

    // ==========================================
    // 4. MANAGEMENT KELAS
    // ==========================================
    public function getKelas(Request $request)
    {
        try {
            $query = Kelas::with(['ustadz.user', 'santri.user'])
                ->withCount('santri')
                ->when($request->search, fn($q) => $q->where('nama_kelas', 'like', '%' . $request->search . '%'))
                ->when($request->kategori, fn($q) => $q->where('kategori', $this->normalizeKategori($request->kategori)))
                ->orderBy('created_at', 'desc');

            $kelas = $request->per_page 
                ? $query->paginate((int) $request->per_page) 
                : $query->get();

            return response()->json([
                'success' => true,
                'message' => 'Data kelas berhasil diambil.',
                'data'    => $kelas
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data kelas.',
                'errors'  => $e->getMessage()
            ], 500);
        }
    }

    public function storeKelas(Request $request)
    {
        $request->validate([
            'nama_kelas'   => 'required|string|max:100',
            'program_belajar' => 'nullable|string|max:255',
            'kategori'     => 'required|in:akhi,akhwat,anak_anak',
            'ustadz_id'    => 'nullable|exists:ustadzs,id',
            'deskripsi'    => 'nullable|string',
            'santri_ids'   => 'nullable|array',
            'santri_ids.*' => 'exists:santris,id',
        ]);

        DB::beginTransaction();
        try {
            $kategori = $this->normalizeKategori($request->kategori);

            $kelas = Kelas::create([
                'nama_kelas'      => $request->nama_kelas,
                'program_belajar' => $request->program_belajar ?? null,
                'kategori'        => $kategori,
                'ustadz_id'       => $request->ustadz_id ?? null,
                'deskripsi'       => $request->deskripsi ?? null,
            ]);

            if ($request->has('santri_ids') && is_array($request->santri_ids)) {
                Santri::whereIn('id', $request->santri_ids)
                    ->update([
                        'kelas_id' => $kelas->id,
                        'kategori' => $kategori,
                    ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Kelas berhasil dibuat.',
                'data'    => $kelas->load(['ustadz.user', 'santri.user'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat kelas.',
                'errors'  => $e->getMessage()
            ], 500);
        }
    }

    public function updateKelas(Request $request, $id)
    {
        $request->validate([
            'nama_kelas'   => 'required|string|max:100',
            'program_belajar' => 'nullable|string|max:255',
            'kategori'     => 'required|in:akhi,akhwat,anak_anak',
            'ustadz_id'    => 'nullable|exists:ustadzs,id',
            'deskripsi'    => 'nullable|string',
            'santri_ids'   => 'nullable|array',
            'santri_ids.*' => 'exists:santris,id',
        ]);

        DB::beginTransaction();
        try {
            $kelas = Kelas::findOrFail($id);
            $kategori = $this->normalizeKategori($request->kategori);

            $kelas->update([
                'nama_kelas'      => $request->nama_kelas,
                'program_belajar' => $request->program_belajar ?? $kelas->program_belajar,
                'kategori'        => $kategori,
                'ustadz_id'       => $request->ustadz_id ?? $kelas->ustadz_id,
                'deskripsi'       => $request->deskripsi ?? $kelas->deskripsi,
            ]);

            Santri::where('kelas_id', $kelas->id)->update(['kelas_id' => null]);

            if ($request->has('santri_ids') && is_array($request->santri_ids)) {
                Santri::whereIn('id', $request->santri_ids)
                    ->update([
                        'kelas_id' => $kelas->id,
                        'kategori' => $kategori,
                    ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Kelas berhasil diperbarui.',
                'data'    => $kelas->load(['ustadz.user', 'santri.user'])
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui kelas.',
                'errors'  => $e->getMessage()
            ], 500);
        }
    }

    public function deleteKelas($id)
    {
        try {
            $kelas = Kelas::findOrFail($id);

            Santri::where('kelas_id', $kelas->id)->update(['kelas_id' => null]);

            $kelas->delete();

            return response()->json([
                'success' => true,
                'message' => 'Kelas berhasil dihapus.'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus kelas.',
                'errors'  => $e->getMessage()
            ], 500);
        }
    }

    // ==========================================
    // 5. MANAGEMENT INFAQ
    // ==========================================
    public function getInfaq(Request $request)
    {
        try {
            $perPage = $request->per_page ? (int) $request->per_page : 20;

            $query = InfaqPembayaran::with(['santri.user', 'santri.kelas'])
                ->when($request->status, fn($q) => $q->where('status', $request->status))
                ->when($request->bulan, fn($q) => $q->where('bulan', $request->bulan))
                ->when($request->tahun, fn($q) => $q->where('tahun', $request->tahun))
                ->when($request->kategori, function ($q) use ($request) {
                    $kategori = $this->normalizeKategori($request->kategori);
                    $q->whereHas('santri', fn($santri) => $santri->where('kategori', $kategori));
                })
                ->orderBy('tahun', 'desc')
                ->orderBy('bulan', 'desc')
                ->orderBy('created_at', 'desc');

            $paginated = $query->paginate($perPage);

            $infaq = $paginated->getCollection()->map(function ($item) {
                $kategori = $item->santri
                    ? $this->resolveSantriKategori($item->santri)
                    : null;

                return [
                    'id'             => $item->id,
                    'santri_id'      => $item->santri_id,
                    'santri'         => $item->santri,
                    'bulan'          => $item->bulan,
                    'nama_bulan'     => $item->nama_bulan,
                    'tahun'          => $item->tahun,
                    'jumlah'         => (float) $item->jumlah,
                    'status'         => $item->status,
                    'kategori'       => $kategori,
                    'kategori_label' => $kategori ? $this->getKategoriLabel($kategori) : null,
                    'catatan'        => $item->catatan ?? null,
                    'bukti_transfer' => $item->bukti_transfer ? asset('storage/' . $item->bukti_transfer) : null,
                    'created_at'     => $item->created_at,
                    'updated_at'     => $item->updated_at,
                ];
            });

            $paginated->setCollection($infaq);

            return response()->json([
                'success' => true,
                'message' => 'Data infaq berhasil diambil.',
                'data'    => $paginated
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data infaq.',
                'errors'  => $e->getMessage()
            ], 500);
        }
    }

    public function updateStatusInfaq(Request $request, $id)
    {
        $request->validate([
            'status'  => 'required|in:lunas,pending,belum_lunas,proses_verifikasi,ditolak',
            'catatan' => 'nullable|string',
        ]);

        try {
            $infaq = InfaqPembayaran::findOrFail($id);
            $infaq->status  = $request->status === 'pending' ? 'belum_lunas' : $request->status;
            if ($request->has('catatan')) {
                $infaq->catatan = $request->catatan;
            }
            $infaq->save();

            return response()->json([
                'success' => true,
                'message' => 'Status pembayaran infaq berhasil diperbarui.',
                'data'    => $infaq
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui status infaq.',
                'errors'  => $e->getMessage()
            ], 500);
        }
    }

    public function getInfaqTarif()
    {
        $tarif = $this->getTarifMap();

        return response()->json([
            'success' => true,
            'message' => 'Tarif infaq berhasil diambil.',
            'data'    => collect(self::KATEGORI)->mapWithKeys(fn($kategori) => [
                $kategori => [
                    'kategori' => $kategori,
                    'label'    => $this->getKategoriLabel($kategori),
                    'nominal'  => (float) $tarif[$kategori],
                ],
            ]),
        ], 200);
    }

    public function updateInfaqTarif(Request $request)
    {
        $request->validate([
            'tarif'             => 'required|array',
            'tarif.akhi'        => 'required|numeric|min:0',
            'tarif.akhwat'      => 'required|numeric|min:0',
            'tarif.anak_anak'   => 'required|numeric|min:0',
        ]);

        foreach (self::KATEGORI as $kategori) {
            InfaqTarif::updateOrCreate(
                ['kategori' => $kategori],
                ['nominal' => (float) data_get($request->tarif, $kategori, 0)]
            );
        }

        return $this->getInfaqTarif();
    }

    public function generateTagihanInfaq(Request $request)
    {
        $mapBulan = [
            'januari' => 1, 'februari' => 2, 'maret' => 3, 'april' => 4,
            'mei' => 5, 'juni' => 6, 'juli' => 7, 'agustus' => 8,
            'september' => 9, 'oktober' => 10, 'november' => 11, 'desember' => 12
        ];

        $bulanInput = $request->bulan;
        if (is_string($bulanInput) && isset($mapBulan[strtolower($bulanInput)])) {
            $bulanInput = $mapBulan[strtolower($bulanInput)];
        }

        $request->merge(['bulan' => (int) $bulanInput]);

        $request->validate([
            'bulan'             => 'required|integer|between:1,12',
            'tahun'             => 'required|integer|min:2020',
            'jumlah'            => 'nullable|numeric|min:0',
            'kategori'          => 'nullable|in:akhi,akhwat,anak_anak',
            'tarif'             => 'nullable|array',
            'tarif.akhi'        => 'nullable|numeric|min:0',
            'tarif.akhwat'      => 'nullable|numeric|min:0',
            'tarif.anak_anak'   => 'nullable|numeric|min:0',
        ]);

        try {
            $tarif = $this->getTarifMap();

            if ($request->filled('jumlah') && !$request->has('tarif')) {
                foreach (self::KATEGORI as $kategori) {
                    $tarif[$kategori] = (float) $request->jumlah;
                }
            }

            if ($request->has('tarif')) {
                foreach (self::KATEGORI as $kategori) {
                    $nominal = data_get($request->tarif, $kategori);
                    if ($nominal !== null) {
                        $tarif[$kategori] = (float) $nominal;
                    }

                    InfaqTarif::updateOrCreate(
                        ['kategori' => $kategori],
                        ['nominal' => (float) $tarif[$kategori]]
                    );
                }
            }

            // Filter kategori yang dipilih (opsional)
            $kategoriDipilih = $request->filled('kategori')
                ? $this->normalizeKategori($request->kategori)
                : null;

            // Ambil semua santri aktif, filter kategori dilakukan di loop
            // menggunakan resolveSantriKategori agar konsisten dengan normalisasi
            $santriAktif = Santri::with('kelas')->where('status', 'aktif')->get();

            if ($kategoriDipilih) {
                $santriAktif = $santriAktif->filter(function ($santri) use ($kategoriDipilih) {
                    return $this->resolveSantriKategori($santri) === $kategoriDipilih;
                })->values();
            }

            if ($santriAktif->isEmpty()) {
                $labelKategori = $kategoriDipilih
                    ? $this->getKategoriLabel($kategoriDipilih)
                    : 'AKTIF';

                return response()->json([
                    'success' => false,
                    'message' => "Gagal: Tidak ada santri berstatus AKTIF dengan kategori {$labelKategori}."
                ], 422);
            }

            DB::beginTransaction();

            $generated = 0;
            $skipped = 0;
            $rekap = collect(self::KATEGORI)->mapWithKeys(fn($kategori) => [
                $kategori => [
                    'label' => $this->getKategoriLabel($kategori),
                    'tarif' => (float) $tarif[$kategori],
                    'generated' => 0,
                    'skipped' => 0,
                    'total_nominal' => 0,
                ],
            ])->all();

            foreach ($santriAktif as $santri) {
                $kategori = $this->resolveSantriKategori($santri);

                // Jika kategori dipilih, pastikan santri benar-benar masuk kategori tersebut
                if ($kategoriDipilih && $kategori !== $kategoriDipilih) {
                    continue;
                }

                $jumlah = (float) ($tarif[$kategori] ?? $tarif['akhi']);

                $exists = InfaqPembayaran::where('santri_id', $santri->id)
                    ->where('bulan', $request->bulan)
                    ->where('tahun', $request->tahun)
                    ->exists();

                if ($exists) {
                    $skipped++;
                    $rekap[$kategori]['skipped']++;
                    continue;
                }

                InfaqPembayaran::create([
                    'santri_id' => $santri->id,
                    'bulan'     => $request->bulan,
                    'tahun'     => $request->tahun,
                    'jumlah'    => $jumlah,
                    'status'    => 'belum_lunas',
                ]);

                $generated++;
                $rekap[$kategori]['generated']++;
                $rekap[$kategori]['total_nominal'] += $jumlah;
            }

            DB::commit();

            $labelKategori = $kategoriDipilih
                ? "kategori {$this->getKategoriLabel($kategoriDipilih)}"
                : 'semua kategori';

            return response()->json([
                'success' => true,
                'message' => "Berhasil membuat $generated tagihan infaq untuk bulan {$request->bulan}-{$request->tahun} ({$labelKategori}).",
                'data'    => [
                    'total_generated' => $generated,
                    'total_dilewati'  => $skipped,
                    'kategori'        => $kategoriDipilih,
                    'kategori_label'  => $kategoriDipilih ? $this->getKategoriLabel($kategoriDipilih) : 'Semua',
                    'tarif'           => $tarif,
                    'per_kategori'    => $rekap,
                ]
            ], 201);

        } catch (\Exception $e) {
            if (DB::transactionLevel() > 0) {
                DB::rollBack();
            }
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat tagihan infaq masal.',
                'errors'  => $e->getMessage()
            ], 500);
        }
    }

    // ==========================================
    // 6. SETTINGS
    // ==========================================
    public function getSettings()
    {
        try {
            $tahunAjaran = TahunAjaran::getAktif();

            return response()->json([
                'success' => true,
                'message' => 'Pengaturan berhasil diambil.',
                'data'    => [
                    'nama_sistem'    => Setting::get('nama_sistem', 'SIM TEC AN-NAHL'),
                    'tahun_ajaran'   => $tahunAjaran?->nama ?? '2025/2026',
                    'tahun_ajarans'  => TahunAjaran::orderBy('nama', 'desc')->get(),
                    'alamat'         => Setting::get('alamat', ''),
                    'telepon'        => Setting::get('telepon', ''),
                    'email'          => Setting::get('email', ''),
                    'website'        => Setting::get('website', ''),
                    'logo'           => Setting::get('logo'),
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil pengaturan.',
                'errors'  => $e->getMessage()
            ], 500);
        }
    }

    public function updateSettings(Request $request)
    {
        $request->validate([
            'nama_sistem'  => 'nullable|string|max:255',
            'tahun_ajaran' => 'nullable|string|max:20',
            'alamat'       => 'nullable|string',
            'telepon'      => 'nullable|string|max:20',
            'email'        => 'nullable|email',
            'website'      => 'nullable|string|max:255',
        ]);

        try {
            $fields = ['nama_sistem', 'alamat', 'telepon', 'email', 'website'];
            foreach ($fields as $field) {
                if ($request->filled($field)) {
                    Setting::set($field, $request->$field);
                }
            }

            // Update tahun ajaran aktif
            if ($request->filled('tahun_ajaran')) {
                TahunAjaran::query()->update(['is_aktif' => false]);
                TahunAjaran::updateOrCreate(
                    ['nama' => $request->tahun_ajaran],
                    ['is_aktif' => true]
                );
            }

            AuditLogService::log($request, 'update_settings', null, null, 'Pengaturan sistem diperbarui');

            return $this->getSettings();

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan pengaturan.',
                'errors'  => $e->getMessage()
            ], 500);
        }
    }

    // ==========================================
    // 7. EXPORT LAPORAN (PDF)
    // ==========================================
    private function getNamaBulan(int $bulan): string
    {
        $bulanArr = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
        ];
        return $bulanArr[$bulan] ?? (string) $bulan;
    }

    private function getStatusLabel(string $status): string
    {
        return match ($status) {
            'lunas' => 'Lunas',
            'belum_lunas' => 'Belum Lunas',
            'proses_verifikasi' => 'Proses Verifikasi',
            'pending' => 'Pending',
            'ditolak' => 'Ditolak',
            default => ucwords(str_replace('_', ' ', $status)),
        };
    }

    public function exportAbsensi(Request $request)
    {
        try {
            $request->validate([
                'kelas_id' => 'nullable|exists:kelas,id',
                'bulan'    => 'nullable|integer|between:1,12',
                'tahun'    => 'nullable|integer|min:2020',
            ]);

            $query = Absensi::with(['santri.user', 'kelas'])
                ->when($request->kelas_id, fn($q) => $q->where('kelas_id', $request->kelas_id))
                ->when($request->bulan, fn($q) => $q->whereMonth('tanggal', $request->bulan))
                ->when($request->tahun, fn($q) => $q->whereYear('tanggal', $request->tahun))
                ->orderBy('tanggal', 'desc');

            $absensi = $query->get();

            $namaSistem = Setting::get('nama_sistem', 'SIM TEC AN-NAHL');
            $alamat = Setting::get('alamat', '');
            $telepon = Setting::get('telepon', '');
            $email = Setting::get('email', '');

            $html = view('exports.absensi', compact('absensi', 'namaSistem', 'alamat', 'telepon', 'email'))->render();
            $pdf = Pdf::loadHTML($html)->setPaper('a4', 'landscape');

            $filename = 'laporan_absensi_' . date('Ymd_His') . '.pdf';
            return $pdf->download($filename);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal export laporan absensi.',
                'errors'  => $e->getMessage()
            ], 500);
        }
    }

    public function exportInfaq(Request $request)
    {
        try {
            $request->validate([
                'bulan'  => 'nullable|integer|between:1,12',
                'tahun'  => 'nullable|integer|min:2020',
                'status' => 'nullable|string',
            ]);

            $infaq = InfaqPembayaran::with(['santri.user', 'santri.kelas'])
                ->when($request->bulan, fn($q) => $q->where('bulan', $request->bulan))
                ->when($request->tahun, fn($q) => $q->where('tahun', $request->tahun))
                ->when($request->status, fn($q) => $q->where('status', $request->status))
                ->orderBy('tahun', 'desc')
                ->orderBy('bulan', 'desc')
                ->get()
                ->map(function ($item) {
                    $kategori = $item->santri ? $this->resolveSantriKategori($item->santri) : null;
                    return [
                        'nama_santri'    => $item->santri?->user?->name ?? '-',
                        'nis'            => $item->santri?->nis ?? '-',
                        'kategori'       => $kategori ? $this->getKategoriLabel($kategori) : '-',
                        'bulan'          => $item->nama_bulan,
                        'tahun'          => $item->tahun,
                        'jumlah'         => (float) $item->jumlah,
                        'status'         => $this->getStatusLabel($item->status),
                    ];
                });

            $totalLunas = collect($infaq)->where('status', 'Lunas')->sum('jumlah');
            $totalSemua = collect($infaq)->sum('jumlah');

            $namaSistem = Setting::get('nama_sistem', 'SIM TEC AN-NAHL');
            $alamat = Setting::get('alamat', '');
            $telepon = Setting::get('telepon', '');
            $email = Setting::get('email', '');

            $filterBulan = $request->bulan ? $this->getNamaBulan((int) $request->bulan) : 'Semua Bulan';
            $filterTahun = $request->tahun ?: 'Semua Tahun';
            $filterStatus = $request->status ? $this->getStatusLabel($request->status) : 'Semua Status';

            $html = view('exports.infaq', compact(
                'infaq', 'totalLunas', 'totalSemua', 'namaSistem', 'alamat', 'telepon', 'email',
                'filterBulan', 'filterTahun', 'filterStatus'
            ))->render();
            $pdf = Pdf::loadHTML($html)->setPaper('a4', 'landscape');

            $filename = 'laporan_infaq_' . date('Ymd_His') . '.pdf';
            return $pdf->download($filename);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal export laporan infaq.',
                'errors'  => $e->getMessage()
            ], 500);
        }
    }

    public function exportSantri(Request $request)
    {
        try {
            $santri = Santri::with(['user', 'kelas'])
                ->when($request->status, fn($q) => $q->where('status', $request->status))
                ->when($request->kategori, fn($q) => $q->where('kategori', $this->normalizeKategori($request->kategori)))
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($item) {
                    return [
                        'nis'           => $item->nis,
                        'nama'          => $item->user?->name ?? '-',
                        'email'         => $item->user?->email ?? '-',
                        'jenis_kelamin' => $item->jenis_kelamin ?? '-',
                        'kategori'      => $this->getKategoriLabel($this->resolveSantriKategori($item)),
                        'kelas'         => $item->kelas?->nama_kelas ?? '-',
                        'status'        => $this->getStatusLabel($item->status),
                    ];
                });

            $namaSistem = Setting::get('nama_sistem', 'SIM TEC AN-NAHL');
            $alamat = Setting::get('alamat', '');
            $telepon = Setting::get('telepon', '');
            $email = Setting::get('email', '');

            $html = view('exports.santri', compact('santri', 'namaSistem', 'alamat', 'telepon', 'email'))->render();
            $pdf = Pdf::loadHTML($html)->setPaper('a4', 'landscape');

            $filename = 'laporan_santri_' . date('Ymd_His') . '.pdf';
            return $pdf->download($filename);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal export laporan santri.',
                'errors'  => $e->getMessage()
            ], 500);
        }
    }
}
