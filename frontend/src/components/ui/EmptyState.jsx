import React from 'react'

const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="text-center py-16 text-slate-400">
      {Icon && <Icon className="w-12 h-12 mx-auto mb-3 opacity-30" />}
      <p className="font-medium text-slate-600">{title}</p>
      {description && (
        <p className="text-xs text-slate-400 mt-1">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export default EmptyState