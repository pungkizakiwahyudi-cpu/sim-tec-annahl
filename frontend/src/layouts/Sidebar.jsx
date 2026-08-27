import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Wallet,
  Settings,
  LogOut,
  ClipboardList,
  Star,
  UserCheck,
  User,
  X
} from 'lucide-react'
import useAuthStore from '@/store/authStore'

// Coba beberapa format logo secara berurutan
const LOGO_CANDIDATES = [
  '/logo-tec-annahl.png',
  '/logo-tec-annahl.jpg',
  '/logo-tec-annahl.jpeg',
  '/logo-tec-annahl.svg',
  '/logo.png',
  '/logo.jpg',
  '/logo.svg',
]

const Sidebar = ({ onLogout, isOpen, onClose }) => {
  const { user } = useAuthStore()
  const role = user?.role || 'admin'
  const [logoIndex, setLogoIndex] = useState(0)
  const [logoError, setLogoError] = useState(false)

  // Daftar menu Admin
  const adminMenuItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Manajemen Santri', path: '/admin/santri', icon: Users },
    { label: 'Manajemen Ustadz', path: '/admin/ustadz', icon: GraduationCap },
    { label: 'Manajemen Kelas', path: '/admin/kelas', icon: BookOpen },
    { label: 'Kelola Infaq', path: '/admin/infaq', icon: Wallet },
  ]

  // Daftar menu Ustadz
  const ustadzMenuItems = [
    { label: 'Dashboard', path: '/ustadz/dashboard', icon: LayoutDashboard },
    { label: 'Kelas Saya', path: '/ustadz/kelas', icon: BookOpen },
    { label: 'Input Absensi', path: '/ustadz/absensi', icon: ClipboardList },
    { label: 'Input Nilai', path: '/ustadz/nilai', icon: Star },
  ]

  // Daftar menu Santri
  const santriMenuItems = [
    { label: 'Dashboard', path: '/santri/dashboard', icon: LayoutDashboard },
    { label: 'Riwayat Absensi', path: '/santri/absensi', icon: ClipboardList },
    { label: 'Nilai Hafalan', path: '/santri/nilai', icon: Star },
    { label: 'Catatan Hijaiyah', path: '/santri/hijaiyah', icon: BookOpen },
    { label: 'Infaq Saya', path: '/santri/infaq', icon: Wallet },
  ]

  // Pilih menu berdasarkan role user
  const menuItems = role === 'ustadz' 
    ? ustadzMenuItems 
    : role === 'santri' 
    ? santriMenuItems 
    : adminMenuItems

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div>
        {/* Logo Brand Header Sidebar */}
        <div className="flex flex-col items-center text-center pt-2 pb-6 mb-4 border-b border-white/10">
          {!logoError && logoIndex < LOGO_CANDIDATES.length ? (
            <img
              src={LOGO_CANDIDATES[logoIndex]}
              alt="Logo TEC AN-NAHL"
              className="w-16 h-16 mb-3 drop-shadow-lg"
              onError={() => {
                setLogoIndex((prev) => prev + 1)
                setLogoError(logoIndex >= LOGO_CANDIDATES.length - 1)
              }}
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-2xl font-bold mb-3 text-emerald-200 border border-white/20">
              ن
            </div>
          )}
          <h2 className="font-extrabold text-xl tracking-tight text-white">
            TEC AN-NAHL
          </h2>
          <p className="text-[11px] font-medium text-emerald-200/80 tracking-wide mt-0.5">
            Islamic Management System
          </p>
        </div>

        {/* Navigation Links */}
        <div className="space-y-1.5">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-white/15 text-white shadow-inner border-l-4 border-amber-400 font-semibold'
                    : 'text-emerald-100/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Footer Bottom Links */}
      <div className="pt-4 border-t border-white/10 space-y-1 mt-auto">
        {/* Profil Saya - untuk semua role */}
        <NavLink
          to={`/${role}/profil`}
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
              isActive
                ? 'bg-white/15 text-white'
                : 'text-emerald-100/70 hover:bg-white/10 hover:text-white'
            }`
          }
        >
          <User className="w-5 h-5 shrink-0" />
          <span className="truncate">Profil Saya</span>
        </NavLink>

        {/* Pengaturan - hanya untuk admin */}
        {role === 'admin' && (
          <NavLink
            to="/admin/pengaturan"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-emerald-100/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Settings className="w-5 h-5 shrink-0" />
            <span className="truncate">Pengaturan</span>
          </NavLink>
        )}

        <button
          onClick={() => {
            if (onClose) onClose()
            onLogout()
          }}
          type="button"
          className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-medium text-sm text-emerald-100/70 hover:bg-rose-500/20 hover:text-rose-200 transition-all text-left cursor-pointer"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="truncate">Logout</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Overlay untuk mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Desktop (lg ke atas) */}
      <aside className="hidden lg:flex w-64 bg-[#0B4832] text-white min-h-screen flex-col justify-between p-5 sticky top-0 h-screen z-30 shrink-0">
        {sidebarContent}
      </aside>

      {/* Sidebar Mobile (drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0B4832] text-white p-5 flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Tombol close mobile */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-emerald-100/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          aria-label="Tutup menu"
        >
          <X className="w-5 h-5" />
        </button>
        {sidebarContent}
      </aside>
    </>
  )
}

export default Sidebar