import { useEffect, useMemo, useState } from 'react'
import { Package, ShieldCheck, Boxes, Plus, Edit2, Trash2, X, ImagePlus, Circle, Eye, ArrowRightLeft, Info } from 'lucide-react'
import { ChartCard, StatCard } from '../../../components/dashboard'
import { UnitSelector } from '../../../components/common/UnitSelector'
import { itemsService, warehouseService } from '../../../services'
import { useAppSelector } from '../../../store/hooks'
import type {
  AddStockRequest,
  CreateItemRequest,
  Item,
  ItemCondition,
  ItemDetail,
  TransferItemConditionRequest,
  UpdateItemRequest,
  Warehouse,
} from '../../../types/api'

type ItemFormState = {
  name: string
  category: CreateItemRequest['category']
  stock: string
  condition: NonNullable<CreateItemRequest['condition']>
  warehouseId: string
  imageUrl: string
}

type EditItemFormState = {
  name: string
  category: CreateItemRequest['category']
  warehouseId: string
  imageUrl: string
}

type AddStockFormState = {
  quantity: string
  condition: ItemCondition
  note: string
}

type CategoryKey = CreateItemRequest['category']
type TransferFormState = {
  fromCondition: ItemCondition
  toCondition: ItemCondition
  quantity: string
  note: string
}

const conditionOrder: ItemCondition[] = ['Aktif', 'Digunakan', 'Rusak', 'Perbaikan', 'Cadangan', 'Habis']

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

const defaultEditForm: EditItemFormState = {
  name: '',
  category: 'Persenjataan',
  warehouseId: '',
  imageUrl: '',
}

const defaultTransferForm: TransferFormState = {
  fromCondition: 'Aktif',
  toCondition: 'Rusak',
  quantity: '1',
  note: '',
}

const defaultAddStockForm: AddStockFormState = {
  quantity: '',
  condition: 'Aktif',
  note: '',
}

export default function InventoryPage() {
  const currentUser = useAppSelector((state) => state.auth.user)
  const selectedUnitId = useAppSelector((state) => state.auth.selectedUnitId)

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
  const [editForm, setEditForm] = useState<EditItemFormState>(defaultEditForm)
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [editSuccess, setEditSuccess] = useState<string | null>(null)

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedItemDetail, setSelectedItemDetail] = useState<ItemDetail | null>(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [transferForm, setTransferForm] = useState<TransferFormState>(defaultTransferForm)
  const [isTransferring, setIsTransferring] = useState(false)
  const [transferError, setTransferError] = useState<string | null>(null)
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null)

  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false)
  const [addStockItem, setAddStockItem] = useState<Item | null>(null)
  const [addStockForm, setAddStockForm] = useState<AddStockFormState>(defaultAddStockForm)
  const [isAddingStock, setIsAddingStock] = useState(false)
  const [addStockError, setAddStockError] = useState<string | null>(null)
  const [addStockSuccess, setAddStockSuccess] = useState<string | null>(null)

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

      const unitIdToUse = currentUser?.role === 'superadmin' ? (selectedUnitId ?? undefined) : undefined

      const [itemsRes, warehousesRes] = await Promise.all([
        itemsService.getAll(unitIdToUse),
        warehouseService.getAll(unitIdToUse ? { unitId: unitIdToUse } : undefined),
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
  }, [selectedUnitId])

  const warehouseMap = useMemo(() => {
    return new Map(warehouses.map((warehouse) => [warehouse.id, warehouse.name]))
  }, [warehouses])

  const stats = useMemo(() => {
    const totalPhysicalStock = items.reduce((sum, item) => sum + item.stock, 0)
    const totalAvailableStock = items.reduce((sum, item) => sum + (item.availableStock ?? item.stock), 0)
    const damaged = items.filter(
      (item) => item.condition === 'Rusak' || item.condition === 'Perbaikan',
    ).length

    return [
      { label: 'Total Items', value: items.length, icon: <Package size={24} />, color: 'blue' as const },
      { label: 'Physical', value: totalPhysicalStock, icon: <Boxes size={24} />, color: 'purple' as const },
      { label: 'Available', value: totalAvailableStock, icon: <Boxes size={24} />, color: 'orange' as const },
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

  const resetDetailState = () => {
    setSelectedItemDetail(null)
    setDetailError(null)
    setTransferForm(defaultTransferForm)
    setTransferError(null)
    setTransferSuccess(null)
  }

  const resetAddStockState = () => {
    setAddStockItem(null)
    setAddStockForm(defaultAddStockForm)
    setAddStockError(null)
    setAddStockSuccess(null)
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
      warehouseId: String(item.warehouseId),
      imageUrl: item.imageUrl || '',
    })
    setEditImagePreview(item.imageUrl || null)
    resetEditState()
    setIsEditModalOpen(true)
  }

  const openAddStockModal = (item: Item) => {
    setAddStockItem(item)
    setAddStockForm(defaultAddStockForm)
    setAddStockError(null)
    setAddStockSuccess(null)
    setIsAddStockModalOpen(true)
  }

  const handleOpenDetail = async (itemId: number) => {
    setIsDetailModalOpen(true)
    setIsDetailLoading(true)
    setDetailError(null)
    setTransferError(null)
    setTransferSuccess(null)
    try {
      const response = await itemsService.getDetail(itemId)
      const detail = response.data
      setSelectedItemDetail(detail ?? null)

      const availableCondition = conditionOrder.find(
        (condition) => (detail?.conditionStock?.[condition] || 0) > 0,
      ) || 'Aktif'

      setTransferForm({
        fromCondition: availableCondition,
        toCondition: availableCondition === 'Aktif' ? 'Rusak' : 'Aktif',
        quantity: '1',
        note: '',
      })
    } catch (err: any) {
      setDetailError(err?.response?.data?.message || 'Gagal memuat detail item')
    } finally {
      setIsDetailLoading(false)
    }
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

  const handleTransferCondition = async () => {
    if (!selectedItemDetail) {
      return
    }

    const quantityValue = Number(transferForm.quantity)
    if (!Number.isInteger(quantityValue) || quantityValue <= 0) {
      setTransferError('Quantity harus bilangan bulat lebih dari 0')
      return
    }

    setIsTransferring(true)
    try {
      const payload: TransferItemConditionRequest = {
        fromCondition: transferForm.fromCondition,
        toCondition: transferForm.toCondition,
        quantity: quantityValue,
        note: transferForm.note.trim() || undefined,
      }

      const response = await itemsService.transferCondition(selectedItemDetail.id, payload)
      const updatedDetail = response.data
      setSelectedItemDetail(updatedDetail ?? null)
      setTransferSuccess('Mutasi kondisi berhasil disimpan')
      setTransferError(null)
      await fetchData()
      setTimeout(() => setTransferSuccess(null), 2500)
    } catch (err: any) {
      setTransferError(err?.response?.data?.message || 'Gagal memutasi kondisi item')
    } finally {
      setIsTransferring(false)
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

    setIsEditing(true)
    try {
      const payload: UpdateItemRequest = {
        name: editForm.name.trim(),
        category: editForm.category,
        stock: editingItem.stock,
        condition: editingItem.condition,
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

  const handleAddStock = async () => {
    if (!addStockItem) {
      return
    }

    const quantityValue = Number(addStockForm.quantity)
    if (!Number.isInteger(quantityValue) || quantityValue <= 0) {
      setAddStockError('Quantity harus bilangan bulat lebih dari 0')
      return
    }

    setIsAddingStock(true)
    try {
      const payload: AddStockRequest = {
        quantity: quantityValue,
        condition: addStockForm.condition,
        note: addStockForm.note.trim() || undefined,
      }

      await itemsService.addStock(addStockItem.id, payload)
      setAddStockSuccess('Stok berhasil ditambahkan!')
      await fetchData()
      setTimeout(() => setAddStockSuccess(null), 3000)
      setTimeout(() => setIsAddStockModalOpen(false), 1500)
    } catch (err: any) {
      setAddStockError(err?.response?.data?.message || 'Gagal menambahkan stok item')
    } finally {
      setIsAddingStock(false)
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

      {currentUser?.role === 'superadmin' && !selectedUnitId && (
        <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-200 flex items-start gap-3">
          <div className="mt-0.5">⚠️</div>
          <div>
            <p className="font-semibold">Silahkan pilih unit terlebih dahulu</p>
            <p className="text-sm text-amber-200/80">Gunakan dropdown unit selector di bawah untuk memilih unit yang ingin dikelola.</p>
          </div>
        </div>
      )}

      {currentUser?.role === 'superadmin' && (
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
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Available</p>
                            <p className="text-lg font-semibold text-white">{item.availableStock ?? item.stock}</p>
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-700/60 bg-slate-950/55 p-3 text-sm text-slate-300">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-slate-500">Physical</span>
                            <span className="font-medium text-slate-100">{item.stock}</span>
                          </div>
                          <div className="mt-2 flex items-center justify-between gap-3">
                            <span className="text-slate-500">Unavailable</span>
                            <span className="font-medium text-slate-100">{item.unavailableStock ?? Math.max(item.stock - (item.availableStock ?? item.stock), 0)}</span>
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

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleOpenDetail(item.id)}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-500/30 bg-slate-600/15 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-600/25 active:bg-slate-600/35"
                          >
                            <Eye size={14} />
                            <span className="hidden sm:inline">Detail</span>
                          </button>
                          <button
                            onClick={() => openAddStockModal(item)}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-green-500/30 bg-green-600/15 px-3 py-2 text-sm font-medium text-green-200 transition-colors hover:bg-green-600/25 active:bg-green-600/35"
                          >
                            <Plus size={14} />
                            <span className="hidden sm:inline">Add Stock</span>
                          </button>
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/15 px-3 py-2 text-sm font-medium text-blue-200 transition-colors hover:bg-blue-600/25 active:bg-blue-600/35"
                          >
                            <Edit2 size={14} />
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button
                            onClick={() => handleStartDelete(item)}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-600/15 px-3 py-2 text-sm font-medium text-red-200 transition-colors hover:bg-red-600/25 active:bg-red-600/35"
                          >
                            <Trash2 size={14} />
                            <span className="hidden sm:inline">Delete</span>
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

      {isDetailModalOpen && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/60 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Detail Item</h2>
              <button
                onClick={() => {
                  setIsDetailModalOpen(false)
                  resetDetailState()
                }}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            {isDetailLoading ? (
              <div className="py-10 text-center text-slate-300">Loading detail item...</div>
            ) : detailError ? (
              <div className="p-4 rounded-lg border border-red-500/40 bg-red-500/10 text-red-200 text-sm mb-6">
                {detailError}
              </div>
            ) : selectedItemDetail ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
                  <div className="overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-950/65">
                    <div className={`h-56 bg-gradient-to-br ${categoryMeta[selectedItemDetail.category].accent}`}>
                      <img
                        src={getItemImage(selectedItemDetail)}
                        alt={selectedItemDetail.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-4 space-y-2">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Item ID</p>
                      <h3 className="text-2xl font-bold text-white">{selectedItemDetail.name}</h3>
                      <p className="text-sm text-slate-400">{selectedItemDetail.category}</p>
                      <div className="flex items-center gap-2 pt-2">
                        <span className="rounded-full border border-slate-600/60 bg-slate-800/70 px-2.5 py-1 text-xs text-slate-200">
                          Physical: {selectedItemDetail.stock}
                        </span>
                        <span className="rounded-full border border-slate-600/60 bg-slate-800/70 px-2.5 py-1 text-xs text-slate-200">
                          Available: {selectedItemDetail.availableStock ?? selectedItemDetail.stock}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {conditionOrder.map((condition) => {
                        const quantity = selectedItemDetail.conditionStock?.[condition] || 0
                        return (
                          <div
                            key={condition}
                            className="rounded-xl border border-slate-700/60 bg-slate-950/55 p-4"
                          >
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{condition}</p>
                            <p className="mt-2 text-2xl font-bold text-white">{quantity}</p>
                          </div>
                        )
                      })}
                    </div>

                    <div className="rounded-2xl border border-slate-700/60 bg-slate-950/55 p-4 space-y-4">
                      <div className="flex items-center gap-2 text-slate-200 font-semibold">
                        <ArrowRightLeft size={18} />
                        Mutasi Kondisi
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-300">Dari Kondisi</label>
                          <select
                            value={transferForm.fromCondition}
                            onChange={(e) => setTransferForm({ ...transferForm, fromCondition: e.target.value as ItemCondition })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                          >
                            {conditionOrder.map((condition) => (
                              <option key={condition} value={condition}>{condition}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-300">Ke Kondisi</label>
                          <select
                            value={transferForm.toCondition}
                            onChange={(e) => setTransferForm({ ...transferForm, toCondition: e.target.value as ItemCondition })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                          >
                            {conditionOrder.map((condition) => (
                              <option key={condition} value={condition}>{condition}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-300">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={transferForm.quantity}
                            onChange={(e) => setTransferForm({ ...transferForm, quantity: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-300">Catatan</label>
                          <input
                            type="text"
                            value={transferForm.note}
                            onChange={(e) => setTransferForm({ ...transferForm, note: e.target.value })}
                            placeholder="Opsional"
                            className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                          />
                        </div>
                      </div>

                      {transferError && (
                        <div className="p-3 rounded-lg border border-red-500/40 bg-red-500/10 text-red-200 text-sm">
                          {transferError}
                        </div>
                      )}

                      {transferSuccess && (
                        <div className="p-3 rounded-lg border border-green-500/40 bg-green-500/10 text-green-200 text-sm">
                          {transferSuccess}
                        </div>
                      )}

                      <button
                        onClick={handleTransferCondition}
                        disabled={isTransferring}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white font-medium transition-colors hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-400"
                      >
                        <ArrowRightLeft size={16} />
                        {isTransferring ? 'Menyimpan...' : 'Simpan Mutasi'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-700/60 bg-slate-950/55 p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Riwayat Mutasi</h3>
                  {selectedItemDetail.mutationHistory?.length ? (
                    <div className="space-y-3">
                      {selectedItemDetail.mutationHistory.map((record) => (
                        <div key={record.id} className="rounded-xl border border-slate-700/60 bg-slate-900/70 p-4 text-sm text-slate-300">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-slate-100 font-medium">
                              {record.quantity} unit: {record.fromCondition} → {record.toCondition}
                            </p>
                            <span className="text-xs text-slate-500">{record.created_at ? new Date(record.created_at).toLocaleString('id-ID') : '-'}</span>
                          </div>
                          {record.note && <p className="mt-2 text-slate-400">{record.note}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-slate-500 text-sm">Belum ada riwayat mutasi.</div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

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
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value as EditItemFormState['category'] })}
                      disabled={isEditing}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50"
                    >
                      <option value="Persenjataan">Persenjataan</option>
                      <option value="Amunisi">Amunisi</option>
                      <option value="Kendaraan Militer">Kendaraan Militer</option>
                    </select>
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

                <div className="p-3 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-200 text-sm flex items-start gap-2">
                  <Info size={16} className="flex-shrink-0 mt-0.5" />
                  <span>Untuk mutasi stok atau mengubah kondisi item, gunakan tombol Detail dan Transfer Condition di inventory list.</span>
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

      {isAddStockModalOpen && addStockItem && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-green-500/30 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Add Stock - {addStockItem.name}</h2>
              <button
                onClick={() => {
                  setIsAddStockModalOpen(false)
                  resetAddStockState()
                }}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            {addStockSuccess ? (
              <div className="space-y-4 mb-6">
                <div className="p-4 rounded-lg border border-green-500/40 bg-green-500/10 text-green-200 text-sm text-center">
                  ✓ {addStockSuccess}
                </div>
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={addStockForm.quantity}
                    onChange={(e) => setAddStockForm({ ...addStockForm, quantity: e.target.value })}
                    disabled={isAddingStock}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 disabled:opacity-50"
                    placeholder="Jumlah stok"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Condition</label>
                  <select
                    value={addStockForm.condition}
                    onChange={(e) => setAddStockForm({ ...addStockForm, condition: e.target.value as ItemCondition })}
                    disabled={isAddingStock}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500/40 disabled:opacity-50"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Digunakan">Digunakan</option>
                    <option value="Rusak">Rusak</option>
                    <option value="Perbaikan">Perbaikan</option>
                    <option value="Cadangan">Cadangan</option>
                    <option value="Habis">Habis</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Note (Optional)</label>
                  <textarea
                    value={addStockForm.note}
                    onChange={(e) => setAddStockForm({ ...addStockForm, note: e.target.value })}
                    disabled={isAddingStock}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 disabled:opacity-50 resize-none"
                    placeholder="Misal: Pembelian barang baru, restok dari supplier..."
                  />
                </div>

                {addStockError && (
                  <div className="p-3 rounded-lg border border-red-500/40 bg-red-500/10 text-red-200 text-sm">
                    {addStockError}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsAddStockModalOpen(false)
                  resetAddStockState()
                }}
                disabled={isAddingStock}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-50 font-medium transition-colors"
              >
                {addStockSuccess ? 'Close' : 'Cancel'}
              </button>
              {!addStockSuccess && (
                <button
                  onClick={handleAddStock}
                  disabled={isAddingStock}
                  className="flex-1 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:text-slate-400 text-white font-medium transition-colors"
                >
                  {isAddingStock ? 'Adding...' : 'Add Stock'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}