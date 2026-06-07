import type { ReactNode } from 'react'
import { useState } from 'react'
import { Menu } from 'lucide-react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

interface MainLayoutProps {
  children: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="h-screen overflow-hidden bg-transparent">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main Content */}
      <div
        className={`flex flex-col h-full overflow-hidden transition-[margin] duration-300 ease-out ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'
        }`}
      >
        {/* Navbar */}
        <Navbar onMenuClick={toggleSidebar} />

        {/* Content Area */}
        <main className="flex-1 overflow-y-scroll [scrollbar-gutter:stable] bg-transparent">
          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Menu Button (for very small screens) */}
      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors z-50 lg:hidden"
        >
          <Menu size={24} />
        </button>
      )}
    </div>
  )
}
