import { useEffect, useMemo, useState } from 'react'
import { BarChart3, TrendingUp, AlertTriangle, PackageCheck, Warehouse, Clock3 } from 'lucide-react'
import { ChartCard, StatCard } from '../../../components/dashboard'
import { itemsService, requestsService, userService, warehouseService } from '../../../services'
import type { Item, ItemRequest, User, Warehouse as WarehouseType } from '../../../types/api'
import { useAppSelector } from '../../../store/hooks'

type StatisticsRole = 'superadmin' | 'admin'

interface StatisticsPageProps {
  role: StatisticsRole
}

export default function StatisticsPage({ role }: StatisticsPageProps) {
  const selectedUnitId = useAppSelector((state) => state.auth.selectedUnitId)
  const [items, setItems] = useState<Item[]>([])
  const [pendingRequests, setPendingRequests] = useState<ItemRequest[]>([])
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatisticsData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const itemsPromise = itemsService.getAll(selectedUnitId ?? undefined)
      const warehousesPromise = warehouseService.getAll(
        selectedUnitId ? { unitId: selectedUnitId } : undefined,
      )

      let requestsPromise
      if (role === 'superadmin' && !selectedUnitId) {
        requestsPromise = Promise.resolve({ data: [] })
      } else {
        requestsPromise = requestsService.getPendingRequests(selectedUnitId ?? undefined)
      }

      const [itemsRes, requestsRes, warehousesRes] = await Promise.all([
        itemsPromise,
        requestsPromise,
        warehousesPromise,
      ])
      setItems(itemsRes.data ?? [])
      setPendingRequests(requestsRes.data ?? [])
      setWarehouses(warehousesRes.data ?? [])

      if (role === 'superadmin') {
        const usersRes = await userService.getAll()
        setUsers(usersRes.data ?? [])
      } else {
        setUsers([])
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal memuat data statistics')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStatisticsData()
  }, [role, selectedUnitId])

  const lowStockCount = useMemo(() => items.filter((item) => item.stock <= 10).length, [items])

  const approvalRate = useMemo(() => {
    if (pendingRequests.length === 0) {
      return 0
    }

    const approved = pendingRequests.filter((request) => request.status === 'approved').length
    return Math.round((approved / pendingRequests.length) * 100)
  }, [pendingRequests])

  const categoryStats = useMemo(() => {
    const grouped = new Map<string, number>()
    for (const item of items) {
      grouped.set(item.category, (grouped.get(item.category) || 0) + 1)
    }

    return Array.from(grouped.entries()).map(([category, total]) => ({
      category,
      total,
    }))
  }, [items])

  const requestByStatus = useMemo(() => {
    const statuses: Array<ItemRequest['status']> = ['pending', 'approved', 'rejected', 'completed']

    return statuses.map((status) => ({
      status,
      total: pendingRequests.filter((request) => request.status === status).length,
    }))
  }, [pendingRequests])

  const stats = useMemo(
    () => [
      {
        label: 'Total Requests (Visible)',
        value: pendingRequests.length,
        icon: <BarChart3 size={24} />,
        color: 'blue' as const,
      },
      {
        label: 'Approval Rate',
        value: `${approvalRate}%`,
        icon: <PackageCheck size={24} />,
        color: 'green' as const,
      },
      {
        label: 'Low Stock Alerts',
        value: lowStockCount,
        icon: <AlertTriangle size={24} />,
        color: 'orange' as const,
      },
      {
        label: role === 'superadmin' ? 'Registered Users' : 'Active Warehouses',
        value: role === 'superadmin' ? users.length : warehouses.length,
        icon: role === 'superadmin' ? <TrendingUp size={24} /> : <Warehouse size={24} />,
        color: 'purple' as const,
      },
    ],
    [pendingRequests.length, approvalRate, lowStockCount, role, users.length, warehouses.length],
  )

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Statistics Overview</h1>
        <p className="text-slate-300">
          Statistik berbasis API untuk role {role === 'superadmin' ? 'Super Admin' : 'Admin'}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg border border-red-500/40 bg-red-500/10 text-red-200 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ChartCard
            title="Request by Status"
            subtitle="Distribusi status request dari endpoint yang tersedia"
            action={
              <button
                onClick={fetchStatisticsData}
                className="inline-flex items-center gap-2 text-xs text-slate-300 bg-slate-800/70 border border-slate-700/60 rounded-md px-2 py-1"
              >
                <Clock3 size={14} />
                Refresh
              </button>
            }
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {requestByStatus.map((entry) => (
                <div
                  key={entry.status}
                  className="rounded-lg border border-slate-700/60 bg-slate-900/70 p-3 text-center"
                >
                  <p className="text-xs text-slate-400 capitalize">{entry.status}</p>
                  <p className="text-2xl font-bold text-blue-300 mt-1">{entry.total}</p>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        <ChartCard title="Trend Summary" subtitle="Ringkasan cepat dari data terkini">
          <div className="space-y-3">
            <div className="rounded-lg border border-slate-700/60 bg-slate-900/70 p-3">
              <p className="text-xs text-slate-400">Total Inventory Stock</p>
              <p className="text-2xl font-bold text-cyan-300 mt-1">
                {items.reduce((sum, item) => sum + item.stock, 0)}
              </p>
            </div>
            <div className="rounded-lg border border-slate-700/60 bg-slate-900/70 p-3">
              <p className="text-xs text-slate-400">Warehouse Count</p>
              <p className="text-2xl font-bold text-green-300 mt-1">{warehouses.length}</p>
            </div>
            <div className="rounded-lg border border-slate-700/60 bg-slate-900/70 p-3">
              <p className="text-xs text-slate-400">Data Source</p>
              <p className="text-sm font-semibold text-amber-300 mt-1">Live API</p>
            </div>
          </div>
        </ChartCard>
      </div>

      <ChartCard
        title="Inventory Category Performance"
        subtitle="Jumlah item per kategori dari endpoint items"
      >
        <div className="space-y-3">
          {categoryStats.length === 0 ? (
            <p className="text-sm text-slate-400">Belum ada data kategori.</p>
          ) : (
            categoryStats.map((row) => (
              <div
                key={row.category}
                className="rounded-lg border border-slate-700/60 bg-slate-900/70 p-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{row.category}</p>
                  <p className="text-xs text-slate-400 mt-1">Total item tercatat</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-100">{row.total}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </ChartCard>

      {isLoading && <p className="text-sm text-slate-400">Loading statistics data...</p>}
    </div>
  )
}
