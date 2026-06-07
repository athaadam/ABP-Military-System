
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import { Toaster } from 'sonner'
import ProtectedRoute from './middleware/ProtectedRoute'
import BlurredBackground from './components/common/BlurredBackground'
import AppInitializer from './components/AppInitializer'

// Pages
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/dashboard'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <Provider store={store}>
      <BlurredBackground>
        <Router>
          <AppInitializer>
            <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Error Pages */}
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </AppInitializer>
        </Router>
      </BlurredBackground>
      <Toaster position="top-right" />
    </Provider>
  )
}

export default App
