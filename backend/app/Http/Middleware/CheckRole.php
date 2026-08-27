<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     * Usage di routes: middleware('role:admin') atau middleware('role:admin,ustadz')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // Pastikan user sudah login
        if (!$request->user()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated. Silakan login terlebih dahulu.',
                'errors'  => null,
            ], 401);
        }

        // Cek apakah role user ada di daftar role yang diizinkan
        if (!in_array($request->user()->role, $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden. Anda tidak memiliki izin untuk mengakses endpoint ini.',
                'errors'  => null,
            ], 403);
        }

        return $next($request);
    }
}