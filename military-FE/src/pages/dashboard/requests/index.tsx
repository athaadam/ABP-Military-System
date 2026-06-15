import { useEffect, useMemo, useState } from 'react'
import { Clock3, CheckCircle2, XCircle, FileText } from 'lucide-react'
import { useAppSelector } from '../../../store/hooks'
import { ChartCard, StatCard } from '../../../components/dashboard'
import { UnitSelector } from '../../../components/common/UnitSelector'
import { requestsService } from '../../../services'
import type { ItemRequest, User } from '../../../types/api'

interface RequestsPageProps {
  role: User['role']
}

const statusClasses: Record<ItemRequest['status'], string> = {
  pending: 'bg-amber-500/15 text-amber-300 border border-amber-500/35',
  approved: 'bg-green-500/15 text-green-300 border border-green-500/35',
  rejected: 'bg-red-500/15 text-red-300 border border-red-500/35',
  completed: 'bg-blue-500/15 text-blue-300 border border-blue-500/35',
}

export default function RequestsPage({ role }: RequestsPageProps) {
  const selectedUnitId = useAppSelector((state) => state.auth.selectedUnitId)
  const [requests, setRequests] = useState<ItemRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isAdminScope = role === 'superadmin' || role === 'admin'

  const fetchRequests = async () => {
    if (role === 'superadmin' && !selectedUnitId) {
      setRequests([])
      setError(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const unitIdToUse = role === 'superadmin' ? (selectedUnitId ?? undefined) : undefined
      const response = isAdminScope
        ? await requestsService.getPendingRequests(unitIdToUse)
        : await requestsService.getMyRequests()
      setRequests(response.data ?? [])
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal memuat data request')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [role, selectedUnitId])

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    try {
      setProcessingId(id)
      if (action === 'approve') {
        await requestsService.approve(id)
      } else {
        await requestsService.reject(id)
      }
      await fetchRequests()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Aksi request gagal diproses')
    } finally {
      setProcessingId(null)
    }
  }

  const stats = useMemo(() => {
    const pending = requests.filter((request) => request.status === 'pending').length
    const approved = requests.filter((request) => request.status === 'approved').length
    const rejected = requests.filter((request) => request.status === 'rejected').length

    return [
      { label: 'Total Requests', value: requests.length, icon: <FileText size={24} />, color: 'blue' as const },
      { label: 'Pending', value: pending, icon: <Clock3 size={24} />, color: 'orange' as const },
      { label: 'Approved', value: approved, icon: <CheckCircle2 size={24} />, color: 'green' as const },
      { label: 'Rejected', value: rejected, icon: <XCircle size={24} />, color: 'red' as const },
    ]
  }, [requests])

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Requests</h1>
        <p className="text-slate-300">
          {isAdminScope
            ? 'Daftar request pending yang menunggu persetujuan'
            : 'Daftar request item yang pernah Anda ajukan'}
        </p>
      </div>

      {role === 'superadmin' && !selectedUnitId && (
        <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-200 flex items-start gap-3">
          <div className="mt-0.5">⚠️</div>
          <div>
            <p className="font-semibold">Silahkan pilih unit terlebih dahulu</p>
            <p className="text-sm text-amber-200/80">Gunakan dropdown unit selector di bawah untuk memilih unit yang ingin dikelola.</p>
          </div>
        </div>
      )}

      {role === 'superadmin' && (
        <div className="max-w-sm">
          <label className="block text-sm font-medium text-slate-300 mb-2">Pilih Unit</label>
          <UnitSelector />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} color={stat.color} />
        ))}
      </div>

      <ChartCard
        title="Request List"
        subtitle={isAdminScope ? 'Approval queue untuk admin' : 'Riwayat request Anda'}
        action={
          <button
            onClick={fetchRequests}
            className="px-3 py-1.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/30 hover:bg-blue-500/25 transition-colors text-sm"
          >
            Refresh
          </button>
        }
      >
        {isLoading ? (
          <div className="py-10 text-center text-slate-300">Loading requests...</div>
        ) : error ? (
          <div className="py-10 text-center text-red-300">{error}</div>
        ) : requests.length === 0 ? (
          <div className="py-10 text-center text-slate-400">Belum ada data request</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/60">
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-400">Request</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-400">Item ID</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-400">Quantity</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-400">Reason</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-400">Status</th>
                  {isAdminScope && (
                    <th className="text-left py-3 px-3 text-xs font-semibold text-slate-400">Action</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id} className="border-b border-slate-800/70 hover:bg-slate-900/60 transition-colors">
                    <td className="py-3 px-3 text-sm text-slate-100 font-medium">#{request.id}</td>
                    <td className="py-3 px-3 text-sm text-slate-300">#{request.itemId}</td>
                    <td className="py-3 px-3 text-sm text-slate-200">{request.quantity}</td>
                    <td className="py-3 px-3 text-sm text-slate-400 max-w-[260px] truncate">{request.reason}</td>
                    <td className="py-3 px-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${statusClasses[request.status]}`}>
                        {request.status}
                      </span>
                    </td>
                    {isAdminScope && (
                      <td className="py-3 px-3 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAction(request.id, 'approve')}
                            disabled={processingId === request.id || request.status !== 'pending'}
                            className="px-2.5 py-1 rounded text-xs bg-green-500/15 text-green-300 border border-green-500/35 hover:bg-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(request.id, 'reject')}
                            disabled={processingId === request.id || request.status !== 'pending'}
                            className="px-2.5 py-1 rounded text-xs bg-red-500/15 text-red-300 border border-red-500/35 hover:bg-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ChartCard>
    </div>
  )
}
