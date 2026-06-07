import { useEffect, useMemo, useState } from 'react'
import { Bell, Database, Shield, Warehouse } from 'lucide-react'
import { ChartCard, StatCard } from '../../../components/dashboard'
import { unitService, userService, warehouseService } from '../../../services'
import type { Unit, User, Warehouse as WarehouseType } from '../../../types/api'

export default function SettingsPage() {
  const [users, setUsers] = useState<User[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        setIsLoading(true)
        const [usersRes, unitsRes, warehousesRes] = await Promise.all([
          userService.getAll(),
          unitService.getAll(),
          warehouseService.getAll(),
        ])

        setUsers(usersRes.data ?? [])
        setUnits(unitsRes.data ?? [])
        setWarehouses(warehousesRes.data ?? [])
      } catch {
        setUsers([])
        setUnits([])
        setWarehouses([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSystemData()
  }, [])

  const stats = useMemo(
    () => [
      { label: 'Registered Users', value: users.length, icon: <Shield size={24} />, color: 'blue' as const },
      { label: 'Registered Units', value: units.length, icon: <Database size={24} />, color: 'purple' as const },
      { label: 'Warehouses', value: warehouses.length, icon: <Warehouse size={24} />, color: 'green' as const },
    ],
    [users.length, units.length, warehouses.length],
  )

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">System Settings</h1>
        <p className="text-slate-300">Konfigurasi global untuk superadmin dan kontrol sistem inti</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} color={stat.color} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartCard title="Security Preferences" subtitle="Kebijakan autentikasi dan akses sistem">
          {isLoading ? (
            <div className="text-slate-300">Loading settings...</div>
          ) : (
            <div className="space-y-3">
              <label className="flex items-center justify-between rounded-lg border border-slate-700/60 bg-slate-900/70 p-3">
                <span className="text-sm text-slate-200">Force password rotation (90 hari)</span>
                <input type="checkbox" className="accent-blue-500" defaultChecked />
              </label>
              <label className="flex items-center justify-between rounded-lg border border-slate-700/60 bg-slate-900/70 p-3">
                <span className="text-sm text-slate-200">Require admin verification for approvals</span>
                <input type="checkbox" className="accent-blue-500" defaultChecked />
              </label>
              <label className="flex items-center justify-between rounded-lg border border-slate-700/60 bg-slate-900/70 p-3">
                <span className="text-sm text-slate-200">Lock account after 5 failed login attempts</span>
                <input type="checkbox" className="accent-blue-500" defaultChecked />
              </label>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Notification Preferences"
          subtitle="Atur notifikasi sistem"
          action={
            <span className="inline-flex items-center gap-2 text-xs text-blue-300 bg-blue-500/15 border border-blue-500/30 rounded-md px-2 py-1">
              <Bell size={14} />
              Internal Alerts Enabled
            </span>
          }
        >
          <div className="space-y-3">
            <label className="flex items-center justify-between rounded-lg border border-slate-700/60 bg-slate-900/70 p-3">
              <span className="text-sm text-slate-200">Email alert untuk low stock</span>
              <input type="checkbox" className="accent-blue-500" defaultChecked />
            </label>
            <label className="flex items-center justify-between rounded-lg border border-slate-700/60 bg-slate-900/70 p-3">
              <span className="text-sm text-slate-200">Alert saat request baru masuk</span>
              <input type="checkbox" className="accent-blue-500" defaultChecked />
            </label>
            <label className="flex items-center justify-between rounded-lg border border-slate-700/60 bg-slate-900/70 p-3">
              <span className="text-sm text-slate-200">Ringkasan aktivitas harian</span>
              <input type="checkbox" className="accent-blue-500" />
            </label>
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
