import React from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

const icons = {
  success: CheckCircle,
  error:   XCircle,
  warning: AlertTriangle,
  info:    Info,
}

const styles = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error:   'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info:    'bg-blue-50 border-blue-200 text-blue-800',
}

const iconStyles = {
  success: 'text-emerald-500',
  error:   'text-red-500',
  warning: 'text-amber-500',
  info:    'text-blue-500',
}

const Alert = ({ type = 'info', message, onClose, className = '' }) => {
  if (!message) return null

  const Icon = icons[type] || Info

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border
        ${styles[type] || styles.info}
        ${className}
      `}
      role="alert"
    >
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconStyles[type]}`} />
      <p className="text-sm font-medium flex-1">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Tutup notifikasi"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

export default Alert