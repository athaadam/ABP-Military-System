import clsx from 'clsx'

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  onClose?: () => void
  closeable?: boolean
}

export default function Alert({
  type = 'info',
  title,
  message,
  onClose,
  closeable = true,
}: AlertProps) {
  const typeStyles = {
    success: 'bg-green-500/15 border-green-500/35 text-green-100',
    error: 'bg-red-500/15 border-red-500/35 text-red-100',
    warning: 'bg-yellow-500/15 border-yellow-500/35 text-yellow-100',
    info: 'bg-blue-500/15 border-blue-500/35 text-blue-100',
  }

  const iconColor = {
    success: 'text-green-300',
    error: 'text-red-300',
    warning: 'text-yellow-300',
    info: 'text-blue-300',
  }

  return (
    <div className={clsx('border rounded-lg p-4', typeStyles[type])}>
      <div className="flex items-start gap-3">
        <div className={clsx('text-xl flex-shrink-0', iconColor[type])}>
          {type === 'success' && '✓'}
          {type === 'error' && '✕'}
          {type === 'warning' && '⚠'}
          {type === 'info' && 'ℹ'}
        </div>
        <div className="flex-1">
          {title && <h3 className="font-semibold mb-1">{title}</h3>}
          <p className="text-sm">{message}</p>
        </div>
        {closeable && onClose && (
          <button
            onClick={onClose}
            className="text-lg font-semibold opacity-50 hover:opacity-100 flex-shrink-0"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}
