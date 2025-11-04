import { DASHBOARD_OVERVIEW } from "@/constants/routerConstants"
import { Link, useLocation } from "react-router-dom"

interface NavLink {
  name: string
  path: string
}

const navLinks: NavLink[] = [
  { name: 'Tableau de bord', path: DASHBOARD_OVERVIEW },
  { name: 'Événements', path: '/events' },
  { name: 'Membres', path: '/members' },
  { name: 'Comptes', path: '/accounts' },
  { name: 'Contacts', path: '/contacts' },
]

const SimpleNavBar = () => {
  const location = useLocation()

  const isActive = (path: string): boolean => {
    return location.pathname === path
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">UE</span>
            </div>
            {/* <span className="text-lg font-semibold text-gray-900">UrEvent</span> */}
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`
                  relative text-sm font-medium transition-colors duration-200 py-2
                  ${isActive(link.path) 
                    ? 'text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                {link.name}
                {isActive(link.path) && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-700 text-sm font-medium">A</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default SimpleNavBar