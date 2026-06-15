import { useEffect, useMemo, useState } from 'react'
import {
  Users,
  Package,
  Warehouse,
  TrendingUp,
  AlertCircle,
  Clock,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../../store/hooks'
import { StatCard, ChartCard, RecentActivityTable } from '../../../components/dashboard'
import { itemsService, requestsService, unitService, userService, warehouseService } from '../../../services'
import type { Item, ItemRequest, Unit, User, Warehouse as WarehouseType } from '../../../types/api'

interface PendingRequestView {
  id: number
  itemName: string
  unitName: string
  quantity: number
  reason: string
}

const toTimestampLabel = (createdAt?: string, fallbackId?: number) => {
  if (!createdAt) {
    return fallbackId ? `Request #${fallbackId}` : 'Unknown time'
  }

  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) {
    return fallbackId ? `Request #${fallbackId}` : 'Unknown time'
  }

  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function SuperAdminDashboard() {
  const navigate = useNavigate()
  const selectedUnitId = useAppSelector((state) => state.auth.selectedUnitId)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [users, setUsers] = useState<User[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [pendingRequests, setPendingRequests] = useState<ItemRequest[]>([])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const pendingRequestsPromise = selectedUnitId
        ? requestsService.getPendingRequests(selectedUnitId)
        : Promise.resolve({ data: [] as ItemRequest[] })

      const [usersRes, itemsRes, warehousesRes, requestsRes, unitsRes] = await Promise.all([
        userService.getAll(),
        itemsService.getAll(),
        warehouseService.getAll(),
        pendingRequestsPromise,
        unitService.getAll(),
      ])

      setUsers(usersRes.data ?? [])
      setItems(itemsRes.data ?? [])
      setWarehouses(warehousesRes.data ?? [])
      setPendingRequests(requestsRes.data ?? [])
      setUnits(unitsRes.data ?? [])
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal memuat data dashboard superadmin')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [selectedUnitId])

  const maps = useMemo(() => {
    const itemMap = new Map(items.map((item) => [item.id, item.name]))
    const userMap = new Map(users.map((user) => [user.id, user]))
    const unitMap = new Map(units.map((unit) => [unit.id, unit.name]))

    return { itemMap, userMap, unitMap }
  }, [items, users, units])

  const stats = useMemo(
    () => [
      {
        label: 'Total Users',
        value: users.length,
        icon: <Users size={24} />,
        color: 'blue' as const,
      },
      {
        label: 'Total Items',
        value: items.length,
        icon: <Package size={24} />,
        color: 'purple' as const,
      },
      {
        label: 'Warehouses',
        value: warehouses.length,
        icon: <Warehouse size={24} />,
        color: 'green' as const,
      },
      {
        label: 'Pending Requests',
        value: pendingRequests.length,
        icon: <AlertCircle size={24} />,
        color: 'red' as const,
      },
    ],
    [users.length, items.length, warehouses.length, pendingRequests.length],
  )

  const recentActivities = useMemo(() => {
    return pendingRequests.slice(0, 6).map((request) => {
      const requester = maps.userMap.get(request.userId)
      const itemName = maps.itemMap.get(request.itemId) || `Item #${request.itemId}`

      return {
        id: String(request.id),
        action: 'Request Pending',
        description: `${request.quantity}x ${itemName}`,
        timestamp: toTimestampLabel(request.created_at, request.id),
        user: requester?.name || `User #${request.userId}`,
        status: 'warning' as const,
        icon: <Clock size={16} />,
      }
    })
  }, [pendingRequests, maps])

  const topRequests = useMemo<PendingRequestView[]>(() => {
    return pendingRequests.slice(0, 8).map((request) => {
      const requester = maps.userMap.get(request.userId)

      return {
        id: request.id,
        itemName: maps.itemMap.get(request.itemId) || `Item #${request.itemId}`,
        unitName: requester ? maps.unitMap.get(requester.unitId) || requester.unitId : '-',
        quantity: request.quantity,
        reason: request.reason,
      }
    })
  }, [pendingRequests, maps])

  const totalStock = useMemo(() => items.reduce((sum, item) => sum + item.stock, 0), [items])

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Welcome back, Super Administrator</h1>
        <p className="text-slate-400">Data dashboard saat ini ditarik langsung dari API backend</p>
      </div>

      {error && (
        <div className="p-4 rounded-lg border border-red-500/40 bg-red-500/10 text-red-200 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivityTable
            items={recentActivities}
            onViewAll={() => {}}
            isLoading={isLoading}
          />
        </div>

        <ChartCard title="System Status" subtitle="Real-time metrics from API">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/20">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span className="text-sm text-slate-300">API Status</span>
              </div>
              <span className="text-sm font-semibold text-green-400">Online</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/20">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span className="text-sm text-slate-300">Warehouse Records</span>
              </div>
              <span className="text-sm font-semibold text-slate-200">{warehouses.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/20">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span className="text-sm text-slate-300">Total Stock</span>
              </div>
              <span className="text-sm font-semibold text-blue-300">{totalStock}</span>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-slate-400 mb-2">Last Sync</p>
              <p className="text-sm font-semibold text-blue-300">{new Date().toLocaleTimeString('id-ID')}</p>
            </div>
          </div>
        </ChartCard>
      </div>

      <ChartCard
        title="Pending Requests"
        subtitle="Antrian request yang menunggu approval"
        action={
          <button
            onClick={fetchDashboardData}
            className="px-3 py-1 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            Refresh
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">Request ID</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">Item</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">Unit</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">Qty</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">Reason</th>
              </tr>
            </thead>
            <tbody>
              {topRequests.length === 0 ? (
                <tr>
                  <td className="py-6 px-4 text-sm text-slate-400" colSpan={5}>
                    Tidak ada pending request.
                  </td>
                </tr>
              ) : (
                topRequests.map((req) => (
                  <tr
                    key={req.id}
                    className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm font-medium text-white">#{req.id}</td>
                    <td className="py-3 px-4 text-sm text-slate-300">{req.itemName}</td>
                    <td className="py-3 px-4 text-sm text-slate-400">{req.unitName}</td>
                    <td className="py-3 px-4 text-sm text-slate-300 font-medium">{req.quantity}</td>
                    <td className="py-3 px-4 text-sm text-slate-400 max-w-[280px] truncate" title={req.reason}>
                      {req.reason}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </ChartCard>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/dashboard/users')}
          className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 backdrop-blur-sm transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
              <Users className="text-blue-400" size={20} />
            </div>
            <div className="text-left">
              <p className="text-xs text-slate-400">Quick Action</p>
              <p className="text-sm font-semibold text-white">Create User</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/dashboard/inventory')}
          className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 backdrop-blur-sm transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
              <Package className="text-purple-400" size={20} />
            </div>
            <div className="text-left">
              <p className="text-xs text-slate-400">Quick Action</p>
              <p className="text-sm font-semibold text-white">Add Item</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/dashboard/warehouses')}
          className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 backdrop-blur-sm transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
              <Warehouse className="text-green-400" size={20} />
            </div>
            <div className="text-left">
              <p className="text-xs text-slate-400">Quick Action</p>
              <p className="text-sm font-semibold text-white">Manage Warehouses</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/dashboard/statistics')}
          className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 backdrop-blur-sm transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/20 group-hover:bg-orange-500/30 transition-colors">
              <TrendingUp className="text-orange-400" size={20} />
            </div>
            <div className="text-left">
              <p className="text-xs text-slate-400">Quick Action</p>
              <p className="text-sm font-semibold text-white">View Reports</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}
