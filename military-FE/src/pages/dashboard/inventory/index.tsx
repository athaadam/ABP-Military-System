import { useEffect, useMemo, useState } from 'react'
import { Package, AlertTriangle, ShieldCheck, Boxes, Plus, Edit2, Trash2, X, ImagePlus, Circle } from 'lucide-react'
import { ChartCard, StatCard } from '../../../components/dashboard'
import { itemsService, warehouseService } from '../../../services'
import { useAppSelector } from '../../../store/hooks'
import type { CreateItemRequest, Item, UpdateItemRequest, Warehouse } from '../../../types/api'

type ItemFormState = {
  name: string
  category: CreateItemRequest['category']
  stock: string
  condition: NonNullable<CreateItemRequest['condition']>
  warehouseId: string
  imageUrl: string
}

type CategoryKey = CreateItemRequest['category']

const categoryOrder: CategoryKey[] = ['Persenjataan', 'Amunisi', 'Kendaraan Militer']

const categoryMeta: Record<CategoryKey, { label: string; subtitle: string; accent: string; border: string }> = {
  Persenjataan: {
    label: 'Persenjataan',
    subtitle: 'Senjata dan perlengkapan tempur',
    accent: 'from-rose-500/25 via-rose-500/10 to-slate-900',
    border: 'border-rose-500/30',
  },
  Amunisi: {
    label: 'Amunisi',
    subtitle: 'Peluru, magazin, dan bahan tembak',
    accent: 'from-amber-500/25 via-amber-500/10 to-slate-900',
    border: 'border-amber-500/30',
  },
  'Kendaraan Militer': {
    label: 'Kendaraan Militer',
    subtitle: 'Unit mobilisasi dan transport taktis',
    accent: 'from-cyan-500/25 via-cyan-500/10 to-slate-900',
    border: 'border-cyan-500/30',
  },
}

const createFallbackImage = (item: Item) => {
  const initials = item.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || '')
    .join('')
    .slice(0, 2) || 'IT'

  const palette = {
    Persenjataan: ['#7f1d1d', '#ef4444'],
    Amunisi: ['#78350f', '#f59e0b'],
    'Kendaraan Militer': ['#164e63', '#06b6d4'],
  }[item.category]

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360" fill="none">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="640" y2="360" gradientUnits="userSpaceOnUse">
          <stop stop-color="${palette[0]}" />
          <stop offset="1" stop-color="${palette[1]}" />
        </linearGradient>
      </defs>
      <rect width="640" height="360" rx="36" fill="url(#bg)" />
      <circle cx="548" cy="76" r="88" fill="rgba(255,255,255,0.10)" />
      <circle cx="108" cy="274" r="118" fill="rgba(255,255,255,0.08)" />
      <rect x="64" y="64" width="512" height="232" rx="28" fill="rgba(15,23,42,0.38)" stroke="rgba(255,255,255,0.18)" stroke-width="2" />
      <text x="96" y="136" fill="white" font-size="60" font-family="Arial, sans-serif" font-weight="700">${initials}</text>
      <text x="96" y="190" fill="rgba(255,255,255,0.88)" font-size="28" font-family="Arial, sans-serif" font-weight="600">${item.name.replace(/&/g, '&amp;')}</text>
      <text x="96" y="234" fill="rgba(255,255,255,0.72)" font-size="22" font-family="Arial, sans-serif">${item.category}</text>
    </svg>
  `

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

const getItemImage = (item: Item) => item.imageUrl || createFallbackImage(item)

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'))
    reader.readAsDataURL(file)
  })

const defaultForm: ItemFormState = {
  name: '',
  category: 'Persenjataan',
  stock: '0',
  condition: 'Aktif',
  warehouseId: '',
  imageUrl: '',
}

export default function InventoryPage() {
  const currentUser = useAppSelector((state) => state.auth.user)

  const [items, setItems] = useState<Item[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createForm, setCreateForm] = useState<ItemFormState>(defaultForm)
  const [createImagePreview, setCreateImagePreview] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState<string | null>(null)

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [editForm, setEditForm] = useState<ItemFormState>(defaultForm)
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [editSuccess, setEditSuccess] = useState<string | null>(null)

  const [activeCategory, setActiveCategory] = useState<CategoryKey>(categoryOrder[0])

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [deletingItem, setDeletingItem] = useState<Item | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [itemsRes, warehousesRes] = await Promise.all([
        itemsService.getAll(),
        warehouseService.getAll(),
      ])

      setItems(itemsRes.data ?? [])
      setWarehouses(warehousesRes.data ?? [])

      if (currentUser?.role === 'admin' && warehousesRes.data?.length) {
        setCreateForm((prev) => ({
          ...prev,
          warehouseId: prev.warehouseId || String(warehousesRes.data?.[0]?.id ?? ''),
        }))
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal memuat data inventory')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const warehouseMap = useMemo(() => {
    return new Map(warehouses.map((warehouse) => [warehouse.id, warehouse.name]))
  }, [warehouses])

  const stats = useMemo(() => {
    const totalStock = items.reduce((sum, item) => sum + item.stock, 0)
    const lowStock = items.filter((item) => item.stock <= 10).length
    const damaged = items.filter(
      (item) => item.condition === 'Rusak' || item.condition === 'Perbaikan',
    ).length

    return [
      { label: 'Total Items', value: items.length, icon: <Package size={24} />, color: 'blue' as const },
      { label: 'Total Stock', value: totalStock, icon: <Boxes size={24} />, color: 'purple' as const },
      { label: 'Low Stock', value: lowStock, icon: <AlertTriangle size={24} />, color: 'orange' as const },
      { label: 'Need Repair', value: damaged, icon: <ShieldCheck size={24} />, color: 'red' as const },
    ]
  }, [items])

  const resetCreateState = () => {
    setCreateForm({
      ...defaultForm,
      warehouseId: currentUser?.role === 'admin' && warehouses.length ? String(warehouses[0].id) : '',
    })
    setCreateImagePreview(null)
    setCreateError(null)
    setCreateSuccess(null)
  }

  const resetEditState = () => {
    setEditImagePreview(null)
    setEditError(null)
    setEditSuccess(null)
  }

  const openCreateModal = () => {
    setCreateForm({
      ...defaultForm,
      warehouseId: currentUser?.role === 'admin' && warehouses.length ? String(warehouses[0].id) : '',
    })
    setCreateImagePreview(null)
    setCreateError(null)
    setCreateSuccess(null)
    setIsCreateModalOpen(true)
  }

  const handleStartEdit = (item: Item) => {
    setEditingItem(item)
    setEditForm({
      name: item.name,
      category: item.category,
      stock: String(item.stock),
      condition: item.condition,
      warehouseId: String(item.warehouseId),
      imageUrl: item.imageUrl || '',
    })
    setEditImagePreview(item.imageUrl || null)
    resetEditState()
    setIsEditModalOpen(true)
  }

  const handleCreateImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const dataUrl = await fileToDataUrl(file)
    setCreateForm((prev) => ({ ...prev, imageUrl: dataUrl }))
    setCreateImagePreview(dataUrl)
  }

  const handleEditImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const dataUrl = await fileToDataUrl(file)
    setEditForm((prev) => ({ ...prev, imageUrl: dataUrl }))
    setEditImagePreview(dataUrl)
  }

  const handleStartDelete = (item: Item) => {
    setDeletingItem(item)
    setDeleteError(null)
    setDeleteSuccess(null)
    setIsDeleteConfirmOpen(true)
  }

  const handleCreateItem = async () => {
    if (!createForm.name.trim() || !createForm.warehouseId || !createForm.imageUrl) {
      setCreateError('Nama item, warehouse, dan gambar wajib diisi')
      return
    }

    const stockValue = Number(createForm.stock)
    if (Number.isNaN(stockValue) || stockValue < 0) {
      setCreateError('Stock harus berupa angka non-negatif')
      return
    }

    setIsCreating(true)
    try {
      const payload: CreateItemRequest = {
        name: createForm.name.trim(),
        category: createForm.category,
        stock: stockValue,
        condition: createForm.condition,
        warehouseId: Number(createForm.warehouseId),
        imageUrl: createForm.imageUrl,
      }

      await itemsService.create(payload)
      setCreateSuccess('Item berhasil dibuat!')
      await fetchData()
      setTimeout(() => setCreateSuccess(null), 3000)
      setTimeout(() => setIsCreateModalOpen(false), 1500)
    } catch (err: any) {
      setCreateError(err?.response?.data?.message || 'Gagal membuat item')
    } finally {
      setIsCreating(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!editingItem) {
      return
    }

    if (!editForm.name.trim() || !editForm.warehouseId) {
      setEditError('Nama item dan warehouse wajib diisi')
      return
    }

    const stockValue = Number(editForm.stock)
    if (Number.isNaN(stockValue) || stockValue < 0) {
      setEditError('Stock harus berupa angka non-negatif')
      return
    }

    setIsEditing(true)
    try {
      const payload: UpdateItemRequest = {
        name: editForm.name.trim(),
        category: editForm.category,
        stock: stockValue,
        condition: editForm.condition,
        warehouseId: Number(editForm.warehouseId),
        imageUrl: editForm.imageUrl || undefined,
      }

      await itemsService.update(editingItem.id, payload)
      setEditSuccess('Item berhasil diupdate!')
      await fetchData()
      setTimeout(() => setEditSuccess(null), 3000)
      setTimeout(() => setIsEditModalOpen(false), 1500)
    } catch (err: any) {
      setEditError(err?.response?.data?.message || 'Gagal mengupdate item')
    } finally {
      setIsEditing(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingItem) {
      return
    }

    setIsDeleting(true)
    try {
      await itemsService.delete(deletingItem.id)
      setDeleteSuccess('Item berhasil dihapus!')
      await fetchData()
      setTimeout(() => setDeleteSuccess(null), 3000)
      setTimeout(() => setIsDeleteConfirmOpen(false), 1500)
    } catch (err: any) {
      setDeleteError(err?.response?.data?.message || 'Gagal menghapus item')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Inventory Management</h1>
        <p className="text-slate-300">Kelola item, stok, dan distribusi per warehouse</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} color={stat.color} />
        ))}
      </div>

      <div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Create Item
        </button>
      </div>

      <ChartCard
        title={activeCategory}
        subtitle={categoryMeta[activeCategory].subtitle}
        action={
          <button
            onClick={fetchData}
            className="px-3 py-1.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/30 hover:bg-blue-500/25 transition-colors text-sm"
          >
            Refresh
          </button>
        }
      >
        <div className="mb-4 rounded-2xl border border-slate-700/60 bg-slate-950/60 p-2 backdrop-blur">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {categoryOrder.map((category) => {
              const isActive = activeCategory === category
              const total = items.filter((item) => item.category === category).length

              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                      : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  {isActive ? <Circle size={14} fill="currentColor" /> : <Circle size={14} />}
                  <span>{category}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] ${isActive ? 'bg-white/15 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {total}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {isLoading ? (
          <div className="py-10 text-center text-slate-300">Loading inventory...</div>
        ) : error ? (
          <div className="py-10 text-center text-red-300">
            <p>{error}</p>
            <button
              onClick={fetchData}
              className="mt-3 px-3 py-1.5 rounded-md bg-red-500/15 text-red-200 border border-red-500/30 hover:bg-red-500/25 transition-colors text-sm"
            >
              Coba Lagi
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="py-10 text-center text-slate-400">Belum ada item inventory</div>
        ) : (
          <section className={`rounded-2xl border ${categoryMeta[activeCategory].border} bg-slate-950/55 p-4 md:p-5`}>
            {items.filter((item) => item.category === activeCategory).length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-700/70 bg-slate-950/40 px-4 py-8 text-center text-slate-500">
                Belum ada item pada kategori ini.
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
                {items
                  .filter((item) => item.category === activeCategory)
                  .map((item) => (
                    <article
                      key={item.id}
                      className="w-[290px] shrink-0 snap-start overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900/85 shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
                    >
                      <div className={`relative h-44 bg-gradient-to-br ${categoryMeta[item.category].accent}`}>
                        <img
                          src={getItemImage(item)}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/15 to-transparent" />
                        <div className="absolute left-4 right-4 bottom-4 flex items-end justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-200/80">{item.category}</p>
                            <h4 className="mt-1 truncate text-lg font-semibold text-white">{item.name}</h4>
                          </div>
                          <span className="shrink-0 rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-[11px] font-semibold text-white/90 backdrop-blur">
                            #{item.id}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Condition</p>
                            <span className="inline-flex rounded-full border border-slate-600/60 bg-slate-800/70 px-2.5 py-1 text-xs font-medium text-slate-200">
                              {item.condition}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Stock</p>
                            <p className="text-lg font-semibold text-white">{item.stock}</p>
                          </div>
                        </div>

                        <div className="space-y-1 rounded-xl border border-slate-700/60 bg-slate-950/55 p-3 text-sm text-slate-300">
                          <p className="truncate">
                            <span className="text-slate-500">Warehouse:</span>{' '}
                            {item.warehouseName || warehouseMap.get(item.warehouseId) || `#${item.warehouseId}`}
                          </p>
                          <p className="truncate">
                            <span className="text-slate-500">Unit:</span> {item.unitId || '-'}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/15 px-3 py-2 text-sm font-medium text-blue-200 transition-colors hover:bg-blue-600/25"
                          >
                            <Edit2 size={14} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleStartDelete(item)}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-600/15 px-3 py-2 text-sm font-medium text-red-200 transition-colors hover:bg-red-600/25"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
              </div>
            )}
          </section>
        )}
      </ChartCard>

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/60 rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Create Item</h2>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false)
                  resetCreateState()
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
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Nama Item</label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    disabled={isCreating}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50"
                    placeholder="Contoh: Amunisi 5.56"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Category</label>
                    <select
                      value={createForm.category}
                      onChange={(e) => setCreateForm({ ...createForm, category: e.target.value as ItemFormState['category'] })}
                      disabled={isCreating}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50"
                    >
                      <option value="Persenjataan">Persenjataan</option>
                      <option value="Amunisi">Amunisi</option>
                      <option value="Kendaraan Militer">Kendaraan Militer</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Condition</label>
                    <select
                      value={createForm.condition}
                      onChange={(e) => setCreateForm({ ...createForm, condition: e.target.value as ItemFormState['condition'] })}
                      disabled={isCreating}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50"
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Digunakan">Digunakan</option>
                      <option value="Rusak">Rusak</option>
                      <option value="Perbaikan">Perbaikan</option>
                      <option value="Cadangan">Cadangan</option>
                      <option value="Habis">Habis</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Gambar Item</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCreateImageChange}
                      disabled={isCreating}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50 file:mr-3 file:px-3 file:py-1 file:rounded file:bg-blue-600 file:text-white file:border-0 file:cursor-pointer"
                    />
                    {createImagePreview && (
                      <img src={createImagePreview} alt="Preview item" className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-slate-700/60" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <ImagePlus size={14} />
                    Gambar wajib diisi saat create item.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Stock</label>
                    <input
                      type="number"
                      min="0"
                      value={createForm.stock}
                      onChange={(e) => setCreateForm({ ...createForm, stock: e.target.value })}
                      disabled={isCreating}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Warehouse</label>
                    <select
                      value={createForm.warehouseId}
                      onChange={(e) => setCreateForm({ ...createForm, warehouseId: e.target.value })}
                      disabled={isCreating || warehouses.length === 0}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50"
                    >
                      <option value="">Pilih warehouse...</option>
                      {warehouses.map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name} ({warehouse.unitId})
                        </option>
                      ))}
                    </select>
                    {warehouses.length === 0 && (
                      <p className="text-xs text-slate-500">Belum ada warehouse yang bisa dipakai.</p>
                    )}
                  </div>
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
                  resetCreateState()
                }}
                disabled={isCreating}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-50 font-medium transition-colors"
              >
                {createSuccess ? 'Close' : 'Cancel'}
              </button>
              {!createSuccess && (
                <button
                  onClick={handleCreateItem}
                  disabled={isCreating || warehouses.length === 0}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-400 text-white font-medium transition-colors"
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/60 rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Edit Item</h2>
              <button
                onClick={() => {
                  setIsEditModalOpen(false)
                  resetEditState()
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
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Nama Item</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    disabled={isEditing}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50"
                    placeholder="Contoh: Amunisi 5.56"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Category</label>
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value as ItemFormState['category'] })}
                      disabled={isEditing}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50"
                    >
                      <option value="Persenjataan">Persenjataan</option>
                      <option value="Amunisi">Amunisi</option>
                      <option value="Kendaraan Militer">Kendaraan Militer</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Condition</label>
                    <select
                      value={editForm.condition}
                      onChange={(e) => setEditForm({ ...editForm, condition: e.target.value as ItemFormState['condition'] })}
                      disabled={isEditing}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50"
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Digunakan">Digunakan</option>
                      <option value="Rusak">Rusak</option>
                      <option value="Perbaikan">Perbaikan</option>
                      <option value="Cadangan">Cadangan</option>
                      <option value="Habis">Habis</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Stock</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.stock}
                      onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                      disabled={isEditing}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Warehouse</label>
                    <select
                      value={editForm.warehouseId}
                      onChange={(e) => setEditForm({ ...editForm, warehouseId: e.target.value })}
                      disabled={isEditing || warehouses.length === 0}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50"
                    >
                      <option value="">Pilih warehouse...</option>
                      {warehouses.map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name} ({warehouse.unitId})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Gambar Item</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditImageChange}
                      disabled={isEditing}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50 file:mr-3 file:px-3 file:py-1 file:rounded file:bg-blue-600 file:text-white file:border-0 file:cursor-pointer"
                    />
                    {editImagePreview && (
                      <img src={editImagePreview} alt="Preview item" className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-slate-700/60" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <ImagePlus size={14} />
                    Jika item lama belum punya gambar, upload gambar baru di sini.
                  </p>
                </div>

                {editError && (
                  <div className="p-3 rounded-lg border border-red-500/40 bg-red-500/10 text-red-200 text-sm">
                    {editError}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsEditModalOpen(false)
                  resetEditState()
                }}
                disabled={isEditing}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-50 font-medium transition-colors"
              >
                {editSuccess ? 'Close' : 'Cancel'}
              </button>
              {!editSuccess && (
                <button
                  onClick={handleSaveEdit}
                  disabled={isEditing || warehouses.length === 0}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-400 text-white font-medium transition-colors"
                >
                  {isEditing ? 'Saving...' : 'Save'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {isDeleteConfirmOpen && deletingItem && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/30 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Delete Item</h2>
              <button
                onClick={() => {
                  setIsDeleteConfirmOpen(false)
                  setDeleteSuccess(null)
                  setDeleteError(null)
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
                  ⚠️ Anda akan menghapus item <span className="font-bold">{deletingItem.name}</span>
                </p>
              </div>
            )}

            {deleteError && !deleteSuccess && (
              <div className="p-3 rounded-lg border border-red-500/40 bg-red-500/10 text-red-200 text-sm mb-4">
                {deleteError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsDeleteConfirmOpen(false)
                  setDeleteError(null)
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