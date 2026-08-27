import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from '@/store/authStore'
import ErrorBoundary from '@/components/ErrorBoundary'

// Layouts
import MainLayout from '@/layouts/MainLayout'

// Pages — Auth
import Login from '@/pages/Login'

// Pages — Umum
import Profil from '@/pages/Profil'
import NotFound from '@/pages/NotFound'

// Pages — Admin
import AdminDashboard     from '@/pages/admin/Dashboard'
import ManajemenSantri    from '@/pages/admin/ManajemenSantri'
import ManajemenUstadz    from '@/pages/admin/ManajemenUstadz'
import ManajemenKelas     from '@/pages/admin/ManajemenKelas'
import ManajemenInfaq     from '@/pages/admin/ManajemenInfaq'
import AdminSettings      from '@/pages/admin/Settings'

// Pages — Ustadz
import UstadzDashboard    from '@/pages/ustadz/Dashboard'
import UstadzKelasSaya    from '@/pages/ustadz/KelasSaya'
import UstadzAbsensi      from '@/pages/ustadz/Absensi'
import UstadzNilaiHafalan from '@/pages/ustadz/NilaiHafalan'

// Pages — Santri
import SantriDashboard    from '@/pages/santri/Dashboard'
import SantriAbsensi      from '@/pages/santri/Absensi'
import SantriNilaiHafalan from '@/pages/santri/NilaiHafalan'
import SantriInfaq        from '@/pages/santri/Infaq'
import SantriCatatanHijaiyah from '@/pages/santri/CatatanHijaiyah'

// ── Komponen: ProtectedRoute ─────────────────────────────
// Mengecek apakah user sudah login dan memiliki role yang sesuai
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore()

  // Belum login → redirect ke /login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Sudah login tapi role tidak sesuai → redirect ke dashboard role masing-masing
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    if (user?.role === 'admin')   return <Navigate to="/admin/dashboard" replace />
    if (user?.role === 'ustadz')  return <Navigate to="/ustadz/dashboard" replace />
    if (user?.role === 'santri')  return <Navigate to="/santri/dashboard" replace />
    return <Navigate to="/login" replace />
  }

  return children
}

// ── Komponen: RootRedirect ────────────────────────────────
// Redirect dari "/" ke dashboard sesuai role
const RootRedirect = () => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (user?.role === 'admin')  return <Navigate to="/admin/dashboard" replace />
  if (user?.role === 'ustadz') return <Navigate to="/ustadz/dashboard" replace />
  if (user?.role === 'santri') return <Navigate to="/santri/dashboard" replace />

  return <Navigate to="/login" replace />
}

// ── Main Router ──────────────────────────────────────────
const AppRoutes = () => {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Halaman Login (publik) */}
        <Route path="/login" element={<Login />} />

        {/* Halaman 404 */}
        <Route path="/404" element={<NotFound />} />

        {/* ── ADMIN ROUTES ── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <MainLayout role="admin" />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="santri"    element={<ManajemenSantri />} />
          <Route path="ustadz"    element={<ManajemenUstadz />} />
          <Route path="kelas"     element={<ManajemenKelas />} />
          <Route path="infaq"     element={<ManajemenInfaq />} />
          <Route path="pengaturan" element={<AdminSettings />} />
          <Route path="profil"    element={<Profil />} />
        </Route>

        {/* ── USTADZ ROUTES ── */}
        <Route
          path="/ustadz"
          element={
            <ProtectedRoute allowedRoles={['ustadz']}>
              <MainLayout role="ustadz" />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<UstadzDashboard />} />
          <Route path="kelas"     element={<UstadzKelasSaya />} />
          <Route path="absensi"   element={<UstadzAbsensi />} />
          <Route path="nilai"     element={<UstadzNilaiHafalan />} />
          <Route path="profil"    element={<Profil />} />
        </Route>

        {/* ── SANTRI ROUTES ── */}
        <Route
          path="/santri"
          element={
            <ProtectedRoute allowedRoles={['santri']}>
              <MainLayout role="santri" />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SantriDashboard />} />
          <Route path="absensi"   element={<SantriAbsensi />} />
          <Route path="nilai"     element={<SantriNilaiHafalan />} />
          <Route path="infaq"     element={<SantriInfaq />} />
          <Route path="hijaiyah"  element={<SantriCatatanHijaiyah />} />
          <Route path="profil"    element={<Profil />} />
        </Route>

        {/* 404 — Halaman tidak ditemukan */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  )
}

export default AppRoutes