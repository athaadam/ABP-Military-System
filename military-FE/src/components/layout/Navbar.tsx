import { useState, useRef, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { logout } from '../../store/slices/authSlice'
import { ChevronDown, LogOut, User, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface NavbarProps {
  onMenuClick: () => void
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const user = useAppSelector((state) => state.auth.user)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <nav className="bg-slate-950/70 backdrop-blur-xl border-b border-slate-700/60 sticky top-0 z-40 shadow-[0_8px_24px_rgba(2,6,23,0.45)]">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo & Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-300 hover:text-white"
              aria-label="Toggle sidebar"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div className="hidden md:flex flex-col">
              <h1 className="text-lg font-bold text-white">Military Inventory</h1>
              <p className="text-xs text-slate-400">System Management</p>
            </div>
          </div>

          {/* Right: User Profile */}
          <div className="flex items-center gap-4">
            {/* Notification Bell (placeholder) */}
            <button className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-white relative">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-800/70 transition-colors group"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-sm font-medium text-white">{user?.name || 'User'}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-slate-500/20 text-slate-300 border border-slate-500/30">
                    {user?.unitId || '-'}
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-slate-400 group-hover:text-white transition-all ${
                    dropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-950/90 border border-slate-700/60 rounded-lg shadow-xl backdrop-blur-xl overflow-hidden">
                  <div className="p-3 border-b border-slate-700/50">
                    <p className="text-xs text-slate-400">Logged in as</p>
                    <p className="text-sm font-semibold text-white">{user?.email || 'user@example.com'}</p>
                  </div>
                  <div className="py-1">
                    <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors">
                      <User size={16} />
                      Profile
                    </button>
                    <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors">
                      <Settings size={16} />
                      Settings
                    </button>
                  </div>
                  <div className="border-t border-slate-700/50 p-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
