import { useEffect, useMemo, useState } from 'react'
import { Building2, Layers3, Shield, Plus, Edit2, Trash2, X } from 'lucide-react'
import { ChartCard, StatCard } from '../../../components/dashboard'
import { unitService, warehouseService } from '../../../services'
import { useAppSelector } from '../../../store/hooks'
import type { Unit, Warehouse } from '../../../types/api'

export default function WarehousesPage() {
  const user = useAppSelector((state) => state.auth.user)
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Create form state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', unitId: '' })
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState<string | null>(null)

  // Edit form state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null)
  const [editForm, setEditForm] = useState({ name: '', unitId: '' })
  const [isEditing, setIsEditing] = useState(false)
  const [editSuccess, setEditSuccess] = useState<string | null>(null)

  // Delete confirmation state
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [deletingWarehouse, setDeletingWarehouse] = useState<Warehouse | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const warehousePromise = warehouseService.getAll()

      if (user?.role === 'admin' && user?.unitId) {
        const [warehouseRes, unitRes] = await Promise.all([
          warehousePromise,
          unitService.getById(user.unitId),
        ])

        setWarehouses(warehouseRes.data ?? [])
        setUnits(unitRes.data ? [unitRes.data] : [])

        // For admin, auto-populate the createForm with their unitId
        setCreateForm({ name: '', unitId: user.unitId })
      } else {
        const [warehouseRes, unitRes] = await Promise.all([
          warehousePromise,
          unitService.getAll(),
        ])

        setWarehouses(warehouseRes.data ?? [])
        setUnits(unitRes.data ?? [])
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal memuat data warehouse')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const unitMap = useMemo(() => {
    return new Map(units.map((unit) => [unit.id, unit.name]))
  }, [units])

  const stats = useMemo(() => {
    // For admin, show only their unit's data
    let displayWarehuses = warehouses
    let displayUnits = units
    
    if (user?.role === 'admin' && user?.unitId) {
      displayWarehuses = warehouses.filter((w) => w.unitId === user.unitId)
      displayUnits = units.filter((u) => u.id === user.unitId)
    }

    const linkedUnits = new Set(displayWarehuses.map((warehouse) => warehouse.unitId)).size

    return [
      { label: 'Total Warehouses', value: displayWarehuses.length, icon: <Building2 size={24} />, color: 'blue' as const },
      { label: 'Linked Units', value: linkedUnits, icon: <Layers3 size={24} />, color: 'purple' as const },
      { label: 'Registered Units', value: displayUnits.length, icon: <Shield size={24} />, color: 'green' as const },
    ]
  }, [warehouses, units, user])

  // Create handlers
  const handleCreateWarehouse = async () => {
    if (!createForm.name.trim() || !createForm.unitId.trim()) {
      setCreateError('Nama dan unit wajib diisi')
      return
    }

    setIsCreating(true)
    try {
      await warehouseService.create({
        name: createForm.name,
        unitId: createForm.unitId,
      })
      setCreateForm({ name: '', unitId: '' })
      setCreateError(null)
      setCreateSuccess('Warehouse berhasil dibuat!')
      
      // Fetch data first, wait for it to complete
      await fetchData()
      
      // Auto-dismiss success message after 3 seconds
      setTimeout(() => setCreateSuccess(null), 3000)
      
      // Close modal after 1.5 seconds
      setTimeout(() => setIsCreateModalOpen(false), 1500)
    } catch (err: any) {
      setCreateError(err?.response?.data?.message || 'Gagal membuat warehouse')
    } finally {
      setIsCreating(false)
    }
  }

  // Edit handlers
  const handleStartEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse)
    setEditForm({ name: warehouse.name, unitId: warehouse.unitId })
    setEditSuccess(null)
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingWarehouse) return
    if (!editForm.name.trim() || !editForm.unitId.trim()) {
      alert('Nama dan unit wajib diisi')
      return
    }

    setIsEditing(true)
    try {
      await warehouseService.update(editingWarehouse.id, {
        name: editForm.name,
        unitId: editForm.unitId,
      })
      setEditSuccess('Warehouse berhasil diupdate!')
      
      // Fetch data first, wait for it to complete
      await fetchData()
      
      // Auto-dismiss success message after 3 seconds
      setTimeout(() => setEditSuccess(null), 3000)
      
      // Close modal after 1.5 seconds
      setTimeout(() => {
        setIsEditModalOpen(false)
        setEditingWarehouse(null)
      }, 1500)
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Gagal update warehouse')
    } finally {
      setIsEditing(false)
    }
  }

  // Delete handlers
  const handleStartDelete = (warehouse: Warehouse) => {
    setDeletingWarehouse(warehouse)
    setDeleteSuccess(null)
    setIsDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingWarehouse) return

    setIsDeleting(true)
    try {
      await warehouseService.delete(deletingWarehouse.id)
      setDeleteSuccess('Warehouse berhasil dihapus!')
      
      // Fetch data first, wait for it to complete
      await fetchData()
      
      // Auto-dismiss success message after 3 seconds
      setTimeout(() => setDeleteSuccess(null), 3000)
      
      // Close modal after 1.5 seconds
      setTimeout(() => {
        setIsDeleteConfirmOpen(false)
        setDeletingWarehouse(null)
      }, 1500)
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Gagal delete warehouse')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Warehouses</h1>
        <p className="text-slate-300">Pusat distribusi inventory berdasarkan unit militer</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} color={stat.color} />
        ))}
      </div>

      {/* Create Button */}
      <div>
        <button
          onClick={() => {
            if (user?.role === 'admin' && user?.unitId) {
              setCreateForm({ name: '', unitId: user.unitId })
            }
            setIsCreateModalOpen(true)
          }}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Create Warehouse
        </button>
      </div>

      <ChartCard title="Warehouse Directory" subtitle="Daftar warehouse dan keterkaitannya dengan unit">
        {isLoading ? (
          <div className="py-10 text-center text-slate-300">Loading warehouses...</div>
        ) : error ? (
          <div className="py-10 text-center text-red-300">{error}</div>
        ) : warehouses.length === 0 ? (
          <div className="py-10 text-center text-slate-400">Belum ada warehouse terdaftar</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/60">
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-400">Warehouse ID</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-400">Warehouse Name</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-400">Unit Code</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-400">Unit Name</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {warehouses.map((warehouse) => (
                  <tr key={warehouse.id} className="border-b border-slate-800/70 hover:bg-slate-900/60 transition-colors">
                    <td className="py-3 px-3 text-sm text-slate-100 font-medium">#{warehouse.id}</td>
                    <td className="py-3 px-3 text-sm text-slate-200">{warehouse.name}</td>
                    <td className="py-3 px-3 text-sm text-slate-300">{warehouse.unitId}</td>
                    <td className="py-3 px-3 text-sm text-slate-400">{unitMap.get(warehouse.unitId) || '-'}</td>
                    <td className="py-3 px-3 text-sm space-x-2">
                      <button
                        onClick={() => handleStartEdit(warehouse)}
                        className="px-2 py-1 rounded text-xs bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/30 transition-colors inline-flex items-center gap-1"
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleStartDelete(warehouse)}
                        className="px-2 py-1 rounded text-xs bg-red-600/20 text-red-300 hover:bg-red-600/30 border border-red-500/30 transition-colors inline-flex items-center gap-1"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ChartCard>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/60 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Create Warehouse</h2>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false)
                  setCreateError(null)
                  setCreateSuccess(null)
                  setCreateForm({ name: '', unitId: '' })
                }}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            {createSuccess ? (
              <div className="space-y-4 mb-6">
                <div className="p-4 rounded-lg border border-green-500/40 bg-green-500/10 text-green-200 text-sm text-center">
                  ✓ {createSuccess}
                </div>
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Nama Warehouse</label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    disabled={isCreating}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50"
                    placeholder="Gudang 1"
                  />
                </div>

                {/* Unit */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Unit</label>
                  {user?.role === 'admin' ? (
                    <div className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-100 flex items-center">
                      {unitMap.get(createForm.unitId) || 'Unit tidak ditemukan'}
                    </div>
                  ) : (
                    <select
                      value={createForm.unitId}
                      onChange={(e) => setCreateForm({ ...createForm, unitId: e.target.value })}
                      disabled={isCreating}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50"
                    >
                      <option value="">Pilih unit...</option>
                      {units.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name} ({unit.id})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {createError && (
                  <div className="p-3 rounded-lg border border-red-500/40 bg-red-500/10 text-red-200 text-sm">
                    {createError}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsCreateModalOpen(false)
                  setCreateError(null)
                  setCreateSuccess(null)
                  setCreateForm({ name: '', unitId: '' })
                }}
                disabled={isCreating}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-50 font-medium transition-colors"
              >
                {createSuccess ? 'Close' : 'Cancel'}
              </button>
              {!createSuccess && (
                <button
                  onClick={handleCreateWarehouse}
                  disabled={isCreating}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-400 text-white font-medium transition-colors"
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editingWarehouse && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/60 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Edit Warehouse</h2>
              <button
                onClick={() => {
                  setIsEditModalOpen(false)
                  setEditSuccess(null)
                }}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            {editSuccess ? (
              <div className="space-y-4 mb-6">
                <div className="p-4 rounded-lg border border-green-500/40 bg-green-500/10 text-green-200 text-sm text-center">
                  ✓ {editSuccess}
                </div>
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Nama Warehouse</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    disabled={isEditing}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50"
                    placeholder="Gudang 1"
                  />
                </div>

                {/* Unit */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Unit</label>
                  {user?.role === 'admin' ? (
                    <div className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-100 flex items-center">
                      {unitMap.get(editForm.unitId) || 'Unit tidak ditemukan'}
                    </div>
                  ) : (
                    <select
                      value={editForm.unitId}
                      onChange={(e) => setEditForm({ ...editForm, unitId: e.target.value })}
                      disabled={isEditing}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50"
                    >
                      {units.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name} ({unit.id})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsEditModalOpen(false)
                  setEditSuccess(null)
                }}
                disabled={isEditing}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-50 font-medium transition-colors"
              >
                {editSuccess ? 'Close' : 'Cancel'}
              </button>
              {!editSuccess && (
                <button
                  onClick={handleSaveEdit}
                  disabled={isEditing}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-400 text-white font-medium transition-colors"
                >
                  {isEditing ? 'Saving...' : 'Save'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && deletingWarehouse && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/30 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Delete Warehouse</h2>
              <button
                onClick={() => {
                  setIsDeleteConfirmOpen(false)
                  setDeleteSuccess(null)
                }}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            {deleteSuccess ? (
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6">
                <p className="text-green-200 text-center">✓ {deleteSuccess}</p>
              </div>
            ) : (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
                <p className="text-red-200">
                  ⚠️ Anda akan menghapus warehouse <span className="font-bold">{deletingWarehouse.name}</span>
                </p>
                <p className="text-red-300 text-sm mt-2">Aksi ini tidak dapat dibatalkan.</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsDeleteConfirmOpen(false)
                  setDeleteSuccess(null)
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-50 font-medium transition-colors"
              >
                {deleteSuccess ? 'Close' : 'Cancel'}
              </button>
              {!deleteSuccess && (
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:text-slate-400 text-white font-medium transition-colors"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
