import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { loginStart, loginSuccess, loginFailure, clearError } from '../../store/slices/authSlice'
import { authService } from '../../services'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Mail, Lock, AlertCircle, LogIn } from 'lucide-react'
import { Alert } from '../../components/common'

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const onSubmit = async (data: LoginFormData) => {
    try {
      dispatch(loginStart())
      const response = await authService.login({
        email: data.email,
        password: data.password,
      })

      dispatch(
        loginSuccess({
          user: response.user,
          token: response.token,
        }),
      )
      navigate('/dashboard')
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login gagal'
      dispatch(loginFailure(errorMessage))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
      </div>

      {/* Login Container */}
      <div className="relative w-full max-w-md px-6 sm:px-8">
        <div className="rounded-2xl border border-slate-700/60 bg-slate-950/72 backdrop-blur-xl shadow-[0_20px_45px_rgba(2,6,23,0.55)] p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <LogIn className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Military System</h1>
          <p className="text-slate-400">Silakan login ke akun Anda</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6">
            <Alert
              type="error"
              title="Login Gagal"
              message={error}
              closeable
              onClose={() => dispatch(clearError())}
            />
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="email"
                placeholder="your@email.com"
                {...register('email')}
                className="w-full pl-12 pr-4 py-3 bg-slate-900/85 border border-slate-700/70 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all"
              />
            </div>
            {errors.email && (
              <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className="w-full pl-12 pr-4 py-3 bg-slate-900/85 border border-slate-700/70 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all"
              />
            </div>
            {errors.password && (
              <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.password.message}
              </p>
            )}
          </div>

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 bg-slate-800 border-slate-700 rounded text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
              />
              <span className="text-slate-400">Ingat saya</span>
            </label>
            <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
              Lupa password?
            </a>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sedang login...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Login
              </>
            )}
          </button>
        </form>
        </div>
      </div>
    </div>
  )
}
