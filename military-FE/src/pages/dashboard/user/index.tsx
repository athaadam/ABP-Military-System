import { useEffect, useMemo, useState } from 'react'
import { FileText, Package, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { StatCard, ChartCard, RecentActivityTable } from '../../../components/dashboard'
import { itemsService, requestsService } from '../../../services'
import type { Item, ItemRequest } from '../../../types/api'

const timestampLabel = (createdAt?: string, id?: number) => {
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

export default function UserDashboard() {
  const navigate = useNavigate()
  const [items, setItems] = useState<Item[]>([])
  const [myRequests, setMyRequests] = useState<ItemRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [itemsRes, requestsRes] = await Promise.all([
        itemsService.getAll(),
        requestsService.getMyRequests(),
      ])

      setItems(itemsRes.data ?? [])
      setMyRequests(requestsRes.data ?? [])
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal memuat data dashboard user')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const pendingCount = useMemo(
    () => myRequests.filter((request) => request.status === 'pending').length,
    [myRequests],
  )

  const stats = useMemo(
    () => [
      {
        label: 'My Requests',
        value: myRequests.length,
        icon: <FileText size={24} />,
        color: 'blue' as const,
      },
      {
        label: 'Available Items',
        value: items.length,
        icon: <Package size={24} />,
        color: 'green' as const,
      },
      {
        label: 'Pending',
        value: pendingCount,
        icon: <Clock size={24} />,
        color: 'orange' as const,
      },
    ],
    [myRequests.length, items.length, pendingCount],
  )

  const myActivities = useMemo(() => {
    return myRequests.slice(0, 6).map((request) => ({
      id: String(request.id),
      action: `Request ${request.status}`,
      description: `Item #${request.itemId} - qty ${request.quantity}`,
      timestamp: timestampLabel(request.created_at, request.id),
      status:
        request.status === 'approved'
          ? ('success' as const)
          : request.status === 'rejected'
            ? ('error' as const)
            : ('info' as const),
    }))
  }, [myRequests])

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">My Dashboard</h1>
        <p className="text-slate-400">Data request dan inventory tersedia dari API</p>
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

      <ChartCard title="Quick Actions">
        <button
          onClick={() => navigate('/dashboard/requests')}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Create New Request
        </button>
      </ChartCard>

      <RecentActivityTable items={myActivities} title="My Activity" isLoading={isLoading} />
    </div>
  )
}
