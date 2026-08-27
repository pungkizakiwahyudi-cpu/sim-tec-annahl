import React from 'react'

const LoadingSpinner = ({ size = 'md', color = 'emerald' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4',
  }

  const colors = {
    emerald: 'border-emerald-200 border-t-emerald-600',
    white:   'border-white/30 border-t-white',
    slate:   'border-slate-200 border-t-slate-600',
  }

  return (
    <div
      className={`
        ${sizes[size] || sizes.md}
        ${colors[color] || colors.emerald}
        rounded-full animate-spin
      `}
      role="status"
      aria-label="Loading"
    />
  )
}

export default LoadingSpinner