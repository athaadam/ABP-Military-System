import { useEffect, useMemo, useState } from 'react'
import { Package, AlertCircle, Warehouse, Clock3 } from 'lucide-react'
import { StatCard, RecentActivityTable } from '../../../components/dashboard'
import { itemsService, requestsService, warehouseService } from '../../../services'
import { useAppSelector } from '../../../store/hooks'
import type { Item, ItemRequest, Warehouse as WarehouseType } from '../../../types/api'

const formatTimestamp = (createdAt?: string, id?: number) => {
  if (!createdAt) {
    return id ? `Request #${id}` : 'Unknown time'
  }

  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) {
    return id ? `Request #${id}` : 'Unknown time'
  }

  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminDashboard() {
  const currentUser = useAppSelector((state) => state.auth.user)

  const [items, setItems] = useState<Item[]>([])
  const [pendingRequests, setPendingRequests] = useState<ItemRequest[]>([])
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [itemsRes, requestsRes, warehousesRes] = await Promise.all([
        itemsService.getAll(),
        requestsService.getPendingRequests(),
        warehouseService.getAll(),
      ])

      setItems(itemsRes.data ?? [])
      setPendingRequests(requestsRes.data ?? [])
      setWarehouses(warehousesRes.data ?? [])
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal memuat data dashboard admin')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const stats = useMemo(
    () => [
      {
        label: 'Total Items',
        value: items.length,
        icon: <Package size={24} />,
        color: 'blue' as const,
      },
      {
        label: 'Pending Requests',
        value: pendingRequests.length,
        icon: <AlertCircle size={24} />,
        color: 'red' as const,
      },
      {
        label: 'Warehouses in Unit',
        value: warehouses.filter((warehouse) => warehouse.unitId === currentUser?.unitId).length,
        icon: <Warehouse size={24} />,
        color: 'green' as const,
      },
    ],
    [items.length, pendingRequests.length, warehouses, currentUser?.unitId],
  )

  const recentActivities = useMemo(() => {
    return pendingRequests.slice(0, 6).map((request) => ({
      id: String(request.id),
      action: 'Pending Request',
      description: `Item #${request.itemId} - qty ${request.quantity}`,
      timestamp: formatTimestamp(request.created_at, request.id),
      status: 'warning' as const,
      icon: <Clock3 size={16} />,
    }))
  }, [pendingRequests])

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400">Data inventory dan request unit Anda dari API</p>
      </div>

      {error && (
        <div className="p-4 rounded-lg border border-red-500/40 bg-red-500/10 text-red-200 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      <RecentActivityTable items={recentActivities} isLoading={isLoading} />
    </div>
  )
}
