import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Calendar, Package, FileText, Shield, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  const navigation = [
    { name: 'Fleet Calendar', href: '/calendar', icon: Calendar },
    { name: 'Asset Drawer', href: '/assets', icon: Package },
    { name: 'Contract Cockpit', href: '/contracts', icon: FileText },
    { name: 'Compliance Board', href: '/compliance', icon: Shield },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-center h-16 bg-primary-600 text-white">
          <h1 className="text-xl font-bold">EdgeNetIQ</h1>
        </div>
        <nav className="mt-5 px-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "group flex items-center px-2 py-2 text-base font-medium rounded-md mb-1",
                  isActive
                    ? "bg-primary-100 text-primary-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon
                  className={cn(
                    "mr-4 h-6 w-6",
                    isActive ? "text-primary-500" : "text-gray-400 group-hover:text-gray-500"
                  )}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <button
                type="button"
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="flex items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
                </h2>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  Fleet Operations Center
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}