import { useEffect } from 'react'
import { useAppDispatch } from '../store/hooks'
import { loginSuccess, setInitializing } from '../store/slices/authSlice'
import { authService } from '../services'

/**
 * AppInitializer - Restores user session from localStorage on app load
 * Should be placed inside Router but outside Route
 */
export default function AppInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Check if token exists in localStorage
        const token = localStorage.getItem('token')
        if (!token) {
          // No token, initialization complete
          dispatch(setInitializing(false))
          return
        }

        // Create timeout promise (5 seconds)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Token restoration timeout')), 5000)
        )

        // Race between getMe and timeout
        const response = await Promise.race([
          authService.getMe(),
          timeoutPromise,
        ])
        const user = response as any
        if (user) {
          dispatch(
            loginSuccess({
              user: user,
              token: token,
            })
          )
        } else {
          // If user restoration failed, clear token
          localStorage.removeItem('token')
          console.warn('Failed to restore user session: No user data')
        }
      } catch (err) {
        // Handle any errors (timeout, network, API error)
        console.warn('Failed to restore user session:', err)
        localStorage.removeItem('token')
      } finally {
        // Mark initialization as complete (ALWAYS)
        dispatch(setInitializing(false))
      }
    }

    initializeUser()
  }, [dispatch])

  return <>{children}</>
}
