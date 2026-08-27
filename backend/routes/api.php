<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\PublicPendaftaranController;
use App\Http\Controllers\UstadzController;
use App\Http\Controllers\SantriController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public Routes (dengan rate limiting untuk keamanan)
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
Route::post('/pendaftaran-public', [PublicPendaftaranController::class, 'store'])->middleware('throttle:3,10');
Route::get('/program-public', [PublicPendaftaranController::class, 'getProgramPilihan']);

// Protected Routes (Butuh Token Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth Check & Logout
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/me', [AuthController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // ── ADMIN ROUTES ──────────────────────────────────────────
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        
        // Dashboard Stats
        Route::get('/dashboard', [AdminController::class, 'getDashboardStats']);

        // Santri CRUD
        Route::get('/santri', [AdminController::class, 'getSantri']);
        Route::get('/santri/{id}', [AdminController::class, 'getSantriDetail']);
        Route::post('/santri', [AdminController::class, 'storeSantri']);
        Route::put('/santri/{id}', [AdminController::class, 'updateSantri']);
        Route::delete('/santri/{id}', [AdminController::class, 'deleteSantri']);
        Route::patch('/santri/{id}/status', [AdminController::class, 'patchStatusPendaftaran']);

        // Ustadz CRUD
        Route::get('/ustadz', [AdminController::class, 'getUstadz']);
        Route::post('/ustadz', [AdminController::class, 'storeUstadz']);
        Route::put('/ustadz/{id}', [AdminController::class, 'updateUstadz']);
        Route::delete('/ustadz/{id}', [AdminController::class, 'deleteUstadz']);

        // Kelas CRUD
        Route::get('/kelas', [AdminController::class, 'getKelas']);
        Route::post('/kelas', [AdminController::class, 'storeKelas']);
        Route::put('/kelas/{id}', [AdminController::class, 'updateKelas']);
        Route::delete('/kelas/{id}', [AdminController::class, 'deleteKelas']);

        // Infaq Management
        Route::get('/infaq', [AdminController::class, 'getInfaq']);
        Route::patch('/infaq/{id}/status', [AdminController::class, 'updateStatusInfaq']);
        Route::post('/infaq/generate', [AdminController::class, 'generateTagihanInfaq']);
        Route::get('/infaq/tarif', [AdminController::class, 'getInfaqTarif']);
        Route::put('/infaq/tarif', [AdminController::class, 'updateInfaqTarif']);

        // Settings
        Route::get('/settings', [AdminController::class, 'getSettings']);
        Route::post('/settings', [AdminController::class, 'updateSettings']);

        // Export Laporan
        Route::get('/laporan/absensi', [AdminController::class, 'exportAbsensi']);
        Route::get('/laporan/infaq', [AdminController::class, 'exportInfaq']);
        Route::get('/laporan/santri', [AdminController::class, 'exportSantri']);
    });

    // ── USTADZ ROUTES ─────────────────────────────────────────
    Route::middleware('role:ustadz')->prefix('ustadz')->group(function () {
        Route::get('/jadwal', [UstadzController::class, 'getJadwalMengajar']);
        Route::get('/kelas', [UstadzController::class, 'getKelasSaya']);
        Route::get('/kelas/{kelas_id}/santri', [UstadzController::class, 'getSantriByKelas']);
        
        Route::get('/absensi', [UstadzController::class, 'getAbsensiByKelas']);
        Route::post('/absensi/bulk', [UstadzController::class, 'storeBulkAbsensi']);
        
        Route::get('/nilai', [UstadzController::class, 'getNilaiPerkembangan']);
        Route::post('/nilai', [UstadzController::class, 'storeNilaiPerkembangan']);
    });

    // ── SANTRI ROUTES ─────────────────────────────────────────
    Route::middleware('role:santri')->prefix('santri')->group(function () {
        Route::get('/profil', [SantriController::class, 'getProfilSaya']);
        Route::get('/kelas', [SantriController::class, 'getJadwalDanKelasSaya']);
        Route::get('/absensi', [SantriController::class, 'getAbsensiSaya']);
        Route::get('/nilai', [SantriController::class, 'getNilaiSaya']);
        
        Route::get('/infaq', [SantriController::class, 'getTagihanInfaq']);
        Route::post('/infaq/{id}/upload', [SantriController::class, 'uploadBuktiInfaq']);

        // Catatan Hijaiyah (khusus Akhi & Akhwat)
        Route::get('/hijaiyah/huruf', [SantriController::class, 'getHurufHijaiyah']);
        Route::get('/hijaiyah/catatan', [SantriController::class, 'getCatatanHijaiyah']);
        Route::post('/hijaiyah/catatan', [SantriController::class, 'storeCatatanHijaiyah']);
        Route::put('/hijaiyah/catatan/{id}', [SantriController::class, 'updateCatatanHijaiyah']);
        Route::delete('/hijaiyah/catatan/{id}', [SantriController::class, 'deleteCatatanHijaiyah']);
    });
});