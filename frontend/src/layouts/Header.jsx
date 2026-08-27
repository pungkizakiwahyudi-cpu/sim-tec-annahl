import React, { useState, useRef, useEffect } from 'react'
import { Search, Bell, Settings, ChevronDown, LogOut, Menu, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '@/store/authStore'

const Header = ({ onLogout, onToggleSidebar }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const { user } = useAuthStore()

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogoutClick = () => {
    setIsOpen(false)
    if (onLogout) onLogout()
  }

  const handleProfileClick = () => {
    setIsOpen(false)
    const role = user?.role || 'admin'
    navigate(`/${role}/profil`)
  }

  const getInitials = (name = '') => {
    if (!name) return 'AS'
    return name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  return (
    <header className="bg-slate-50 px-4 sm:px-6 lg:px-8 py-3 lg:py-4 flex items-center justify-between gap-3 sticky top-0 z-20 border-b border-slate-200/60">
      {/* Kiri: Tombol Hamburger (mobile) + Breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-200/60 transition-colors lg:hidden cursor-pointer shrink-0"
          aria-label="Buka menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 truncate">
          <span className="hidden sm:inline">Home</span>
          <span className="hidden sm:inline">{'>'}</span>
          <span className="text-slate-800 underline decoration-slate-400 underline-offset-4 truncate">
            Dashboard
          </span>
        </div>
      </div>

      {/* Tengah: Search Input (sembunyikan di mobile) */}
      <div className="hidden md:block flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-slate-100/80 text-slate-700 text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0B4832]/20 transition-all"
          />
        </div>
      </div>

      {/* Kanan: User Bar */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <button
          type="button"
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-200/60 transition-colors"
        >
          <Bell className="w-4 h-4" />
        </button>
        <button
          type="button"
          className="hidden sm:block p-2 rounded-xl text-slate-500 hover:bg-slate-200/60 transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1 pl-1 pr-1.5 sm:pl-1.5 sm:pr-2.5 rounded-full hover:bg-slate-200/50 transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs overflow-hidden border border-slate-200 shrink-0">
              {getInitials(user?.name)}
            </div>
            <span className="hidden sm:block text-xs font-bold text-slate-800 max-w-[120px] lg:max-w-[160px] truncate">
              {user?.name || 'Admin SIM TEC'}
            </span>
            <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-slate-500" />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="font-bold text-slate-800 text-xs">{user?.name || 'Admin SIM TEC'}</p>
                <p className="text-[11px] text-slate-400 break-words">{user?.email || 'admin@tec-annahl.id'}</p>
              </div>
              <button
                type="button"
                onClick={handleProfileClick}
                className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>Profil Saya</span>
              </button>
              <button
                type="button"
                onClick={handleLogoutClick}
                className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header