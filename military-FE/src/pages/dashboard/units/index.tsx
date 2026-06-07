import { useEffect, useMemo, useState } from 'react'
import { Shield, Building2, Edit2, Trash2, X } from 'lucide-react'
import { ChartCard, StatCard } from '../../../components/dashboard'
import { unitService } from '../../../services'
import type { Unit } from '../../../types/api'

const formatDate = (value?: string) => {
  if (!value) {
    return '-'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreatingUnit, setIsCreatingUnit] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState<string | null>(null)
  const [unitForm, setUnitForm] = useState({ id: '', name: '', logo: '' })
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  
  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
  const [editForm, setEditForm] = useState({ name: '', logo: '' })
  const [editLogoPreview, setEditLogoPreview] = useState<string | null>(null)
  const [isEditingUnit, setIsEditingUnit] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [editSuccess, setEditSuccess] = useState<string | null>(null)

  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingUnitId, setDeletingUnitId] = useState<string | null>(null)
  const [isDeletingUnit, setIsDeletingUnit] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const fetchUnits = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await unitService.getAll()
      setUnits(response.data ?? [])
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal memuat daftar unit')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUnits()
  }, [])

  const handleCreateUnit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalizedUnitId = unitForm.id.trim().toUpperCase()
    const normalizedUnitName = unitForm.name.trim()

    if (!normalizedUnitId || !normalizedUnitName) {
      setCreateError('Kode unit dan nama unit wajib diisi')
      setCreateSuccess(null)
      return
    }

    if (!/^[A-Z0-9\-_]{3,50}$/.test(normalizedUnitId)) {
      setCreateError('Kode unit harus 3-50 karakter, huruf besar/angka/dash/underscore')
      setCreateSuccess(null)
      return
    }

    try {
      setIsCreatingUnit(true)
      setCreateError(null)
      setCreateSuccess(null)

      await unitService.create({
        id: normalizedUnitId,
        name: normalizedUnitName,
        logo: unitForm.logo || undefined,
      })

      setCreateSuccess('Unit berhasil dibuat')
      setUnitForm({ id: '', name: '', logo: '' })
      setLogoPreview(null)
      await fetchUnits()
    } catch (err: any) {
      setCreateError(err?.response?.data?.message || 'Gagal membuat unit')
    } finally {
      setIsCreatingUnit(false)
    }
  }

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      setUnitForm((prev) => ({
        ...prev,
        logo: base64,
      }))
      setLogoPreview(base64)
    }
    reader.readAsDataURL(file)
  }

  const handleEditLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      setEditForm((prev) => ({
        ...prev,
        logo: base64,
      }))
      setEditLogoPreview(base64)
    }
    reader.readAsDataURL(file)
  }

  const openEditModal = (unit: Unit) => {
    setEditingUnit(unit)
    setEditForm({ name: unit.name, logo: '' })
    setEditLogoPreview((unit as any)?.logo || null)
    setEditError(null)
    setEditSuccess(null)
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setEditingUnit(null)
    setEditForm({ name: '', logo: '' })
    setEditLogoPreview(null)
    setEditError(null)
    setEditSuccess(null)
  }

  const handleEditUnit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!editingUnit) return

    const normalizedUnitName = editForm.name.trim()

    if (!normalizedUnitName) {
      setEditError('Nama unit wajib diisi')
      return
    }

    try {
      setIsEditingUnit(true)
      setEditError(null)
      setEditSuccess(null)

      await unitService.update(editingUnit.id, {
        name: normalizedUnitName,
        ...(editForm.logo && { logo: editForm.logo }),
      })

      setEditSuccess('Unit berhasil diupdate')
      setTimeout(() => {
        closeEditModal()
        fetchUnits()
      }, 800)
    } catch (err: any) {
      setEditError(err?.response?.data?.message || 'Gagal update unit')
    } finally {
      setIsEditingUnit(false)
    }
  }

  const openDeleteModal = (unitId: string) => {
    setDeletingUnitId(unitId)
    setDeleteError(null)
    setIsDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setDeletingUnitId(null)
    setDeleteError(null)
  }

  const handleDeleteUnit = async () => {
    if (!deletingUnitId) return

    try {
      setIsDeletingUnit(true)
      setDeleteError(null)

      await unitService.delete(deletingUnitId)

      closeDeleteModal()
      await fetchUnits()
    } catch (err: any) {
      setDeleteError(err?.response?.data?.message || 'Gagal menghapus unit')
    } finally {
      setIsDeletingUnit(false)
    }
  }

  const stats = useMemo(
    () => [
      {
        label: 'Total Units',
        value: units.length,
        icon: <Shield size={24} />,
        color: 'blue' as const,
      },
      {
        label: 'Active Unit Codes',
        value: new Set(units.map((unit) => unit.id)).size,
        icon: <Building2 size={24} />,
        color: 'green' as const,
      },
    ],
    [units],
  )

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Units Directory</h1>
        <p className="text-slate-300">Daftar seluruh unit militer yang terdaftar di sistem</p>
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

      <ChartCard title="Create Unit" subtitle="Tambah unit baru ke sistem">
        <form onSubmit={handleCreateUnit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Kode Unit</label>
            <input
              type="text"
              value={unitForm.id}
              onChange={(event) =>
                setUnitForm((prev) => ({
                  ...prev,
                  id: event.target.value,
                }))
              }
              className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              placeholder="Contoh: MABESAD"
              required
            />
            <p className="text-xs text-slate-500">Gunakan huruf besar, angka, dash, atau underscore</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Nama Unit</label>
            <input
              type="text"
              value={unitForm.name}
              onChange={(event) =>
                setUnitForm((prev) => ({
                  ...prev,
                  name: event.target.value,
                }))
              }
              className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              placeholder="Contoh: Markas Besar Angkatan Darat"
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-semibold text-slate-300">Logo Unit (Opsional)</label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 file:mr-3 file:px-3 file:py-1 file:rounded file:bg-blue-600 file:text-white file:border-0 file:cursor-pointer"
              />
              {logoPreview && (
                <img src={logoPreview} alt="Preview" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-slate-500">Upload gambar logo unit (PNG, JPG, dst)</p>
          </div>

          <div className="md:col-span-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={isCreatingUnit}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-400 text-white font-medium transition-colors"
            >
              {isCreatingUnit ? 'Creating Unit...' : 'Create Unit'}
            </button>
            {createSuccess && <p className="text-sm text-green-300">{createSuccess}</p>}
            {createError && <p className="text-sm text-red-300">{createError}</p>}
          </div>
        </form>
      </ChartCard>

      <ChartCard
        title="Unit List"
        subtitle="Semua unit dari endpoint API /units"
        action={
          <button
            onClick={fetchUnits}
            className="px-3 py-1.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/30 hover:bg-blue-500/25 transition-colors text-sm"
          >
            Refresh
          </button>
        }
      >
        {isLoading ? (
          <div className="py-10 text-center text-slate-300">Loading units...</div>
        ) : units.length === 0 ? (
          <div className="py-10 text-center text-slate-400">Belum ada unit terdaftar</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/60">
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-400">Logo</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-400">Unit Code</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-400">Unit Name</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-400">Created At</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-400">Updated At</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {units.map((unit) => (
                  <tr key={unit.id} className="border-b border-slate-800/70 hover:bg-slate-900/60 transition-colors">
                    <td className="py-3 px-3">
                      {(unit as any)?.logo ? (
                        <img src={(unit as any).logo} alt={unit.name} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-xs text-slate-400">
                          -
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-sm font-medium text-slate-100">{unit.id}</td>
                    <td className="py-3 px-3 text-sm text-slate-300">{unit.name}</td>
                    <td className="py-3 px-3 text-sm text-slate-400">{formatDate(unit.created_at)}</td>
                    <td className="py-3 px-3 text-sm text-slate-400">{formatDate(unit.updated_at)}</td>
                    <td className="py-3 px-3 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(unit)}
                          className="px-3 py-1.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/30 hover:bg-blue-500/25 transition-colors flex items-center gap-2 text-xs font-medium"
                        >
                          <Edit2 size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteModal(unit.id)}
                          className="px-3 py-1.5 rounded-md bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25 transition-colors flex items-center gap-2 text-xs font-medium"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ChartCard>

      {/* Edit Modal */}
      {isEditModalOpen && editingUnit && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/60 rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Edit Unit</h2>
              <button
                onClick={closeEditModal}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditUnit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Kode Unit</label>
                <input
                  type="text"
                  value={editingUnit.id}
                  disabled
                  className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-800 text-slate-400 text-sm"
                />
                <p className="text-xs text-slate-500">Kode unit tidak dapat diubah</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Nama Unit</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  placeholder="Masukkan nama unit baru"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Logo Unit (Opsional)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditLogoChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 file:mr-3 file:px-3 file:py-1 file:rounded file:bg-blue-600 file:text-white file:border-0 file:cursor-pointer text-xs"
                  />
                  {editLogoPreview && (
                    <img src={editLogoPreview} alt="Preview" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-500">Kosongi jika tidak ingin mengubah logo</p>
              </div>

              {editError && (
                <div className="p-3 rounded-lg border border-red-500/40 bg-red-500/10 text-red-200 text-sm">
                  {editError}
                </div>
              )}

              {editSuccess && (
                <div className="p-3 rounded-lg border border-green-500/40 bg-green-500/10 text-green-200 text-sm">
                  {editSuccess}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditingUnit}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-400 text-white font-medium transition-colors"
                >
                  {isEditingUnit ? 'Updating...' : 'Update Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingUnitId && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/60 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Hapus Unit</h2>
              <button
                onClick={closeDeleteModal}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-slate-300 mb-6">
              Apakah Anda yakin ingin menghapus unit <span className="font-bold">{deletingUnitId}</span>? Aksi ini tidak dapat dibatalkan.
            </p>

            {deleteError && (
              <div className="p-3 rounded-lg border border-red-500/40 bg-red-500/10 text-red-200 text-sm mb-4">
                {deleteError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={isDeletingUnit}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-50 font-medium transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteUnit}
                disabled={isDeletingUnit}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:text-slate-400 text-white font-medium transition-colors"
              >
                {isDeletingUnit ? 'Menghapus...' : 'Hapus Unit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
