import { useEffect, useState } from 'react'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { setSelectedUnit } from '../../store/slices/authSlice'
import { ChevronDown } from 'lucide-react'

interface Unit {
  id: string
  name: string
}

export function UnitSelector() {
  const user = useAppSelector((state) => state.auth.user)
  const selectedUnitId = useAppSelector((state) => state.auth.selectedUnitId)
  const dispatch = useAppDispatch()

  const [allUnits, setAllUnits] = useState<Unit[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedUnitName, setSelectedUnitName] = useState<string | null>(null)

  // Fetch all units for superadmin
  useEffect(() => {
    if (user?.role === 'superadmin') {
      const fetchUnits = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/units`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          })

          if (response.ok) {
            const data = await response.json()
            const units = data.data || []
            setAllUnits(units)

            // Find and set name for currently selected unit
            if (selectedUnitId) {
              const selected = units.find((u: Unit) => u.id === selectedUnitId)
              setSelectedUnitName(selected?.name || null)
            }
          }
        } catch {
          setAllUnits([])
        }
      }

      fetchUnits()
    }
  }, [user?.role, selectedUnitId])

  // Only show for superadmin
  if (user?.role !== 'superadmin') {
    return null
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center justify-between px-4 py-2 rounded-lg border border-slate-600/50 bg-slate-800/30 hover:bg-slate-800/50 text-slate-200 text-sm transition-colors w-full"
      >
        <span className="truncate">{selectedUnitName || 'Pilih Unit'}</span>
        <ChevronDown size={16} className={`transition-transform flex-shrink-0 ml-2 ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {isDropdownOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-lg border border-slate-600/50 bg-slate-800 shadow-xl z-50 max-h-64 overflow-y-auto">
          {allUnits.map((unit) => (
            <button
              key={unit.id}
              onClick={() => {
                dispatch(setSelectedUnit(unit.id))
                setIsDropdownOpen(false)
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                selectedUnitId === unit.id
                  ? 'bg-blue-500/20 text-blue-300'
                  : 'text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              {unit.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
