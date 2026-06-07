import { useEffect, useMemo, useState } from 'react'
import { UserCog, UserRound, Users, Eye, EyeOff, X, Copy, CheckCircle } from 'lucide-react'
import { ChartCard, StatCard } from '../../../components/dashboard'
import { unitService, userService } from '../../../services'
import type { Unit, User } from '../../../types/api'

const roleClasses: Record<User['role'], string> = {
  superadmin: 'bg-purple-500/15 text-purple-300 border border-purple-500/35',
  admin: 'bg-blue-500/15 text-blue-300 border border-blue-500/35',
  user: 'bg-slate-500/15 text-slate-300 border border-slate-500/35',
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState<string | null>(null)
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    unitId: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [pendingFormData, setPendingFormData] = useState<typeof adminForm | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User & { password?: string } | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [showPasswordHash, setShowPasswordHash] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [newPassword, setNewPassword] = useState<string | null>(null)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [isEditingUser, setIsEditingUser] = useState(false)
  const [editFormData, setEditFormData] = useState({ name: '', email: '', role: 'user' as 'superadmin' | 'admin' | 'user', unitId: '' })
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [userRes, unitRes] = await Promise.all([userService.getAll(), unitService.getAll()])
      setUsers(userRes.data ?? [])
      setUnits(unitRes.data ?? [])
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal memuat data users')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const unitMap = useMemo(() => new Map(units.map((unit) => [unit.id, unit.name])), [units])

  const stats = useMemo(() => {
    const admins = users.filter((user) => user.role === 'admin').length
    const standardUsers = users.filter((user) => user.role === 'user').length

    return [
      { label: 'Total Users', value: users.length, icon: <Users size={24} />, color: 'blue' as const },
      { label: 'Admin', value: admins, icon: <UserCog size={24} />, color: 'green' as const },
      { label: 'User', value: standardUsers, icon: <UserRound size={24} />, color: 'orange' as const },
    ]
  }, [users])

  const validateForm = (): string | null => {
    const normalizedUnitId = adminForm.unitId.trim()

    if (!adminForm.name.trim()) {
      return 'Nama admin wajib diisi'
    }
    if (!adminForm.email.trim()) {
      return 'Email wajib diisi'
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminForm.email)) {
      return 'Format email tidak valid'
    }
    if (!adminForm.password) {
      return 'Password wajib diisi'
    }
    if (adminForm.password.length < 6) {
      return 'Password minimal 6 karakter'
    }
    if (!normalizedUnitId) {
      return 'Unit wajib diisi'
    }

    const unitExists = units.some((unit) => unit.id === normalizedUnitId)
    if (!unitExists) {
      return 'Unit tidak ditemukan. Buat unit terlebih dahulu atau gunakan kode unit yang sudah ada.'
    }

    return null
  }

  const handleCreateAdmin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setCreateError(validationError)
      setCreateSuccess(null)
      return
    }

    setPendingFormData(adminForm)
    setIsConfirmModalOpen(true)
  }

  const handleConfirmCreate = async () => {
    if (!pendingFormData) return

    try {
      setIsCreatingAdmin(true)
      setCreateError(null)
      setCreateSuccess(null)

      await userService.create({
        name: pendingFormData.name,
        email: pendingFormData.email,
        password: pendingFormData.password,
        role: 'admin',
        unitId: pendingFormData.unitId.trim(),
      })

      setCreateSuccess('Akun admin berhasil dibuat')
      setAdminForm(() => ({
        name: '',
        email: '',
        password: '',
        unitId: '',
      }))
      setIsConfirmModalOpen(false)
      setPendingFormData(null)

      await fetchData()
    } catch (err: any) {
      setCreateError(err?.response?.data?.message || 'Gagal membuat akun admin')
    } finally {
      setIsCreatingAdmin(false)
    }
  }

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false)
    setPendingFormData(null)
  }

  const handleViewDetail = async (user: User) => {
    setSelectedUser(user)
    setIsDetailModalOpen(true)
    setIsLoadingDetail(true)
    setNewPassword(null)
    setShowNewPassword(false)
    setShowPasswordHash(false)
    
    try {
      const response = await userService.getById(user.id)
      setSelectedUser(response.data as any)
    } catch (err: any) {
      console.error('Failed to fetch user details:', err)
    } finally {
      setIsLoadingDetail(false)
    }
  }

  const closeDetailModal = () => {
    setIsDetailModalOpen(false)
    setSelectedUser(null)
    setCopiedField(null)
    setNewPassword(null)
    setShowNewPassword(false)
    setShowPasswordHash(false)
  }

  const handleCopyField = (value: string, field: string) => {
    navigator.clipboard.writeText(value)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleResetPassword = async () => {
    if (!selectedUser) return

    setIsResettingPassword(true)
    try {
      const response = await userService.resetPassword(selectedUser.id)
      setNewPassword(response.data?.password || null)
    } catch (err: any) {
      console.error('Failed to reset password:', err)
      alert(err?.response?.data?.message || 'Gagal reset password')
    } finally {
      setIsResettingPassword(false)
    }
  }

  const handleStartEdit = () => {
    if (!selectedUser) return
    setEditFormData({
      name: selectedUser.name,
      email: selectedUser.email,
      role: selectedUser.role as 'superadmin' | 'admin' | 'user',
      unitId: selectedUser.unitId,
    })
    setIsEditingUser(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedUser) return

    try {
      await userService.update(selectedUser.id, {
        name: editFormData.name,
        email: editFormData.email,
        role: editFormData.role,
        unitId: editFormData.unitId,
      })
      setIsEditingUser(false)
      await fetchData()
      const updated = await userService.getById(selectedUser.id)
      setSelectedUser(updated.data as any)
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Gagal update user')
    }
  }

  const handleStartDelete = () => {
    setIsDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedUser) return

    setIsDeleting(true)
    try {
      await userService.delete(selectedUser.id)
      setIsDeleteConfirmOpen(false)
      setIsDetailModalOpen(false)
      setSelectedUser(null)
      await fetchData()
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Gagal delete user')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Users Management</h1>
        <p className="text-slate-300">Kelola akun, role, dan unit assignment pengguna sistem</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} color={stat.color} />
        ))}
      </div>

      <ChartCard title="Create Admin Account" subtitle="Superadmin dapat membuat akun admin baru">
        <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Nama Admin</label>
            <input
              type="text"
              value={adminForm.name}
              onChange={(event) =>
                setAdminForm((prev) => ({
                  ...prev,
                  name: event.target.value,
                }))
              }
              className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              placeholder="Contoh: Budi Santoso"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Email</label>
            <input
              type="email"
              value={adminForm.email}
              onChange={(event) =>
                setAdminForm((prev) => ({
                  ...prev,
                  email: event.target.value,
                }))
              }
              className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              placeholder="admin@military.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={adminForm.password}
                onChange={(event) =>
                  setAdminForm((prev) => ({
                    ...prev,
                    password: event.target.value,
                  }))
                }
                className="w-full px-3 py-2 pr-10 rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                placeholder="Minimal 6 karakter"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {adminForm.password && adminForm.password.length < 6 && (
              <p className="text-xs text-red-300">Password minimal 6 karakter</p>
            )}
            {adminForm.password && adminForm.password.length >= 6 && (
              <p className="text-xs text-green-300">Password kuat ✓</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Unit</label>
            <input
              type="text"
              value={adminForm.unitId}
              onChange={(event) =>
                setAdminForm((prev) => ({
                  ...prev,
                  unitId: event.target.value,
                }))
              }
              list="unit-suggestions"
              className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              placeholder="Contoh: MABESAD"
              required
            />
            <datalist id="unit-suggestions">
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </datalist>
            <p className="text-xs text-slate-500">Isi kode unit secara manual, contoh: MABESAD</p>
          </div>

          <div className="md:col-span-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={isCreatingAdmin}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-400 text-white font-medium transition-colors"
            >
              {isCreatingAdmin ? 'Creating...' : 'Create Admin'}
            </button>
            {createSuccess && <p className="text-sm text-green-300">{createSuccess}</p>}
            {createError && <p className="text-sm text-red-300">{createError}</p>}
          </div>
        </form>
      </ChartCard>

      <ChartCard
        title="Users Directory"
        subtitle="Daftar seluruh user berdasarkan role"
        action={
          <button
            onClick={fetchData}
            className="px-3 py-1.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/30 hover:bg-blue-500/25 transition-colors text-sm"
          >
            Refresh
          </button>
        }
      >
        {isLoading ? (
          <div className="py-10 text-center text-slate-300">Loading users...</div>
        ) : error ? (
          <div className="py-10 text-center text-red-300">{error}</div>
        ) : users.length === 0 ? (
          <div className="py-10 text-center text-slate-400">Belum ada user terdaftar</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/60">
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-400">Name</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-400">Email</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-400">Role</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-400">Unit</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-800/70 hover:bg-slate-900/60 transition-colors">
                    <td className="py-3 px-3 text-sm text-slate-100 font-medium">{user.name}</td>
                    <td className="py-3 px-3 text-sm text-slate-300">{user.email}</td>
                    <td className="py-3 px-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${roleClasses[user.role]}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-sm text-slate-400">
                      {unitMap.get(user.unitId) || user.unitId}
                    </td>
                    <td className="py-3 px-3 text-sm">
                      <button
                        onClick={() => handleViewDetail(user)}
                        className="px-3 py-1 rounded text-xs font-medium bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/30 transition-colors"
                      >
                        View Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ChartCard>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && pendingFormData && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/60 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Konfirmasi Buat Akun Admin</h2>
              <button
                onClick={closeConfirmModal}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 mb-6 text-sm">
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wide">Nama</p>
                <p className="text-white font-medium">{pendingFormData.name}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wide">Email</p>
                <p className="text-white font-medium">{pendingFormData.email}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wide">Unit</p>
                <p className="text-white font-medium">{pendingFormData.unitId} ({unitMap.get(pendingFormData.unitId) || '-'})</p>
              </div>
            </div>

            <p className="text-slate-300 mb-6 text-sm">
              Apakah Anda yakin ingin membuat akun admin dengan data di atas?
            </p>

            {createError && (
              <div className="p-3 rounded-lg border border-red-500/40 bg-red-500/10 text-red-200 text-sm mb-4">
                {createError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeConfirmModal}
                disabled={isCreatingAdmin}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-50 font-medium transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmCreate}
                disabled={isCreatingAdmin}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-400 text-white font-medium transition-colors"
              >
                {isCreatingAdmin ? 'Creating...' : 'Buat Admin'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail User Modal */}
      {isDetailModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/60 rounded-xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">User Detail</h2>
              <button
                onClick={closeDetailModal}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            {isLoadingDetail ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-slate-300">Loading...</div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {/* ID */}
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/30">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-slate-400 text-xs uppercase tracking-wide">ID</p>
                    <button
                      onClick={() => handleCopyField(selectedUser.id.toString(), 'id')}
                      className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-300"
                      title="Copy"
                    >
                      {copiedField === 'id' ? <CheckCircle size={16} className="text-green-400" /> : <Copy size={16} />}
                    </button>
                  </div>
                  <p className="text-white font-mono text-sm break-all">{selectedUser.id}</p>
                </div>

                {/* Name */}
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/30">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-slate-400 text-xs uppercase tracking-wide">Nama</p>
                    <button
                      onClick={() => handleCopyField(selectedUser.name, 'name')}
                      className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-300"
                      title="Copy"
                    >
                      {copiedField === 'name' ? <CheckCircle size={16} className="text-green-400" /> : <Copy size={16} />}
                    </button>
                  </div>
                  <p className="text-white font-medium">{selectedUser.name}</p>
                </div>

                {/* Email */}
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/30">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-slate-400 text-xs uppercase tracking-wide">Email</p>
                    <button
                      onClick={() => handleCopyField(selectedUser.email, 'email')}
                      className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-300"
                      title="Copy"
                    >
                      {copiedField === 'email' ? <CheckCircle size={16} className="text-green-400" /> : <Copy size={16} />}
                    </button>
                  </div>
                  <p className="text-white font-mono text-sm break-all">{selectedUser.email}</p>
                </div>

                {/* Role */}
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/30">
                  <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">Role</p>
                  <span className={`px-3 py-1 rounded text-sm font-semibold inline-block ${roleClasses[selectedUser.role]}`}>
                    {selectedUser.role}
                  </span>
                </div>

                {/* Unit ID */}
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/30">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-slate-400 text-xs uppercase tracking-wide">Unit ID</p>
                    <button
                      onClick={() => handleCopyField(selectedUser.unitId, 'unitId')}
                      className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-300"
                      title="Copy"
                    >
                      {copiedField === 'unitId' ? <CheckCircle size={16} className="text-green-400" /> : <Copy size={16} />}
                    </button>
                  </div>
                  <p className="text-white font-mono text-sm font-bold">{selectedUser.unitId}</p>
                  <p className="text-slate-400 text-xs mt-1">{unitMap.get(selectedUser.unitId) || '-'}</p>
                </div>

                {/* Created At */}
                {selectedUser.created_at && (
                  <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/30">
                    <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">Dibuat</p>
                    <p className="text-white text-sm">{new Date(selectedUser.created_at).toLocaleString('id-ID')}</p>
                  </div>
                )}

                {/* Updated At */}
                {selectedUser.updated_at && (
                  <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/30">
                    <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">Diupdate</p>
                    <p className="text-white text-sm">{new Date(selectedUser.updated_at).toLocaleString('id-ID')}</p>
                  </div>
                )}

                {/* Password Hash - Full width */}
                {selectedUser.password && !newPassword && (
                  <div className="col-span-2 p-4 rounded-lg bg-red-900/20 border border-red-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-red-300 text-xs uppercase tracking-wide font-bold">⚠️ Password Hash (Bcrypt - Not Decodable)</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowPasswordHash(!showPasswordHash)}
                          className="p-1.5 hover:bg-red-900/40 rounded text-red-300 hover:text-red-200"
                          title={showPasswordHash ? 'Hide' : 'Show'}
                        >
                          {showPasswordHash ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                          onClick={() => handleCopyField(selectedUser.password!, 'password')}
                          className="p-1.5 hover:bg-red-900/40 rounded text-red-300 hover:text-red-200"
                          title="Copy Hash"
                        >
                          {copiedField === 'password' ? <CheckCircle size={16} className="text-green-400" /> : <Copy size={16} />}
                        </button>
                      </div>
                    </div>
                    {showPasswordHash ? (
                      <p className="text-red-100 font-mono text-xs break-all bg-slate-900/60 p-3 rounded border border-red-500/20 mb-2">
                        {selectedUser.password}
                      </p>
                    ) : (
                      <p className="text-red-100 font-mono text-xs bg-slate-900/60 p-3 rounded border border-red-500/20 mb-2">
                        ••••••••••••••••••••••••••••••••••••••••••••••
                      </p>
                    )}
                    <p className="text-red-300 text-xs leading-relaxed mb-3">
                      ⚠️ <span className="font-semibold">Password hash ini tidak bisa di-decode.</span> Ini adalah fitur keamanan bcrypt - password di-hash secara one-way. Jika user lupa password, gunakan tombol "Reset Password" di bawah.
                    </p>
                    <button
                      onClick={handleResetPassword}
                      disabled={isResettingPassword}
                      className="w-full px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:text-slate-400 text-white text-sm font-medium transition-colors"
                    >
                      {isResettingPassword ? 'Generating...' : '🔄 Reset Password'}
                    </button>
                  </div>
                )}

                {/* New Password Display */}
                {newPassword && (
                  <div className="col-span-2 p-4 rounded-lg bg-green-900/20 border border-green-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-green-300 text-xs uppercase tracking-wide font-bold">✓ Password Baru (Sementara)</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="p-1.5 hover:bg-green-900/40 rounded text-green-300 hover:text-green-200"
                          title={showNewPassword ? 'Hide' : 'Show'}
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                          onClick={() => handleCopyField(newPassword, 'newpass')}
                          className="p-1.5 hover:bg-green-900/40 rounded text-green-300 hover:text-green-200"
                          title="Copy Password"
                        >
                          {copiedField === 'newpass' ? <CheckCircle size={16} className="text-green-400" /> : <Copy size={16} />}
                        </button>
                      </div>
                    </div>
                    {showNewPassword ? (
                      <p className="text-green-100 font-mono text-sm font-bold bg-slate-900/60 p-3 rounded border border-green-500/20 mb-3 break-all">
                        {newPassword}
                      </p>
                    ) : (
                      <p className="text-green-100 font-mono text-sm font-bold bg-slate-900/60 p-3 rounded border border-green-500/20 mb-3">
                        ••••••••••••••••••••••••••••••••••••••••••
                      </p>
                    )}
                    <p className="text-green-300 text-xs leading-relaxed">
                      ✓ Password telah direset. <span className="font-semibold">Copy password ini dan berikan kepada user.</span> User harus mengubah password pada login pertama.
                    </p>
                    <button
                      onClick={() => setNewPassword(null)}
                      className="w-full mt-3 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={handleStartEdit}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
              >
                ✏️ Edit User
              </button>
              <button
                onClick={handleStartDelete}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
              >
                🗑️ Delete User
              </button>
              <button
                onClick={closeDetailModal}
                className="flex-1 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditingUser && selectedUser && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/60 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Edit User</h2>
              <button
                onClick={() => setIsEditingUser(false)}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Nama</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  placeholder="Nama user"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Email</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  placeholder="user@example.com"
                />
              </div>

              {/* Role */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Role</label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Unit ID */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Unit</label>
                <datalist id="units-edit">
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id} />
                  ))}
                </datalist>
                <input
                  list="units-edit"
                  value={editFormData.unitId}
                  onChange={(e) => setEditFormData({ ...editFormData, unitId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  placeholder="Pilih unit..."
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsEditingUser(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {isDeleteConfirmOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/30 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Delete User</h2>
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-200">
                ⚠️ Anda akan menghapus user <span className="font-bold">{selectedUser.name}</span> ({selectedUser.email})
              </p>
              <p className="text-red-300 text-sm mt-2">Aksi ini tidak dapat dibatalkan. Semua data terkait user akan dihapus.</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:text-slate-400 text-white font-medium transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
