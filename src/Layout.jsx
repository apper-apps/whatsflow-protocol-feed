import { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'
import { routeArray } from '@/config/routes'

const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="flex-shrink-0 h-16 bg-white border-b border-surface-200 z-40">
        <div className="h-full flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-lg hover:bg-surface-100 transition-colors"
              aria-label="Toggle menu"
            >
              <ApperIcon name="Menu" size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ApperIcon name="MessageSquare" size={20} className="text-white" />
              </div>
              <h1 className="text-xl font-semibold text-surface-900">WhatsFlow CRM</h1>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <ApperIcon 
                name="Search" 
                size={16} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400"
              />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-surface-100 transition-colors">
              <ApperIcon name="Bell" size={20} className="text-surface-600" />
            </button>
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">U</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-52 bg-white border-r border-surface-200 flex-col z-40">
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {routeArray.map((route) => (
                <li key={route.id}>
                  <NavLink
                    to={route.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-primary/10 text-primary border-l-4 border-primary'
                          : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                      }`
                    }
                  >
                    <ApperIcon name={route.icon} size={18} />
                    {route.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 lg:hidden"
                onClick={toggleMobileMenu}
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-surface-200 z-50 lg:hidden"
              >
                <div className="p-4 border-b border-surface-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <ApperIcon name="MessageSquare" size={20} className="text-white" />
                      </div>
                      <h2 className="text-lg font-semibold">WhatsFlow CRM</h2>
                    </div>
                    <button
                      onClick={toggleMobileMenu}
                      className="p-2 rounded-lg hover:bg-surface-100"
                    >
                      <ApperIcon name="X" size={18} />
                    </button>
                  </div>
                </div>
                <nav className="flex-1 p-4">
                  <ul className="space-y-2">
                    {routeArray.map((route) => (
                      <li key={route.id}>
                        <NavLink
                          to={route.path}
                          onClick={toggleMobileMenu}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                              isActive
                                ? 'bg-primary/10 text-primary border-l-4 border-primary'
                                : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                            }`
                          }
                        >
                          <ApperIcon name={route.icon} size={18} />
                          {route.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout