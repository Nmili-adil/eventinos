import { COMPTES_PAGE, CONTACTS_PAGE, DASHBOARD_OVERVIEW, EVENT_LISTE_PAGE, MEMBERS_PAGE } from "@/constants/routerConstants"
import { Link, useLocation } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  UserCheck, 
  MessageSquare 
} from 'lucide-react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/app/rootReducer'
import { getUserData } from '@/services/localStorage'

interface NavLink {
  nameKey: string
  path: string
  icon: React.ComponentType<{ className?: string }>
  requiresAdminOrOrganizer?: boolean
}

const allNavLinks: NavLink[] = [
  { 
    nameKey: 'navigation.dashboard', 
    path: DASHBOARD_OVERVIEW, 
    icon: LayoutDashboard 
  },
  { 
    nameKey: 'navigation.events', 
    path: EVENT_LISTE_PAGE, 
    icon: Calendar 
  },
  { 
    nameKey: 'navigation.members', 
    path: MEMBERS_PAGE, 
    icon: Users 
  },
  { 
    nameKey: 'navigation.accounts', 
    path: COMPTES_PAGE, 
    icon: UserCheck,
    requiresAdminOrOrganizer: true
  },
  { 
    nameKey: 'navigation.contacts', 
    path: CONTACTS_PAGE, 
    icon: MessageSquare 
  },
]

interface SimpleNavBarProps {
  mobile?: boolean
}

const SimpleNavBar = ({ mobile = false }: SimpleNavBarProps) => {
  const location = useLocation()
  const { t } = useTranslation()
  const { role: authRole } = useSelector((state: RootState) => state.auth)
  const userData = getUserData()
  const userRole = authRole || userData?.user?.toLowerCase()
  const isAdminOrOrganizer = userRole === 'admin' 
  
  // Filter nav links based on user role
  const navLinks = allNavLinks.filter(link => 
    !link.requiresAdminOrOrganizer || isAdminOrOrganizer
  )

  const isActive = (path: string): boolean => {
    return location.pathname === path
  }

  if (mobile) {
    return (
        <nav className="bg-white border border-slate-300 rounded-lg shadow-sm">
        <div className="flex flex-col space-y-2">
          {navLinks.map((link) => {
            const IconComponent = link.icon
            return (
              <Link
                key={link.nameKey}
                to={link.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200",
                  isActive(link.path)
                    ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
                onClick={() => {
                  // Close mobile menu when link is clicked
                  const event = new CustomEvent('closeMobileMenu')
                  window.dispatchEvent(event)
                }}
              >
                <IconComponent className={cn(
                  "w-5 h-5",
                  isActive(link.path) ? "text-blue-600" : "text-gray-500"
                )} />
                <span>{t(link.nameKey)}</span>
                {isActive(link.path) && (
                  <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    )
  }

  return (
      <nav className="bg-transparent">
      {/* Desktop Navigation */}
      <div className="flex items-center justify-center space-x-1 lg:space-x-6">
        {navLinks.map((link) => {
          const IconComponent = link.icon
          return (
            <Link
              key={link.nameKey}
              to={link.path}
              className={cn(
                "relative flex items-center gap-2 px-3 lg:px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-lg group",
                isActive(link.path)
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              {/* Icon for tablet and mobile view */}
              <IconComponent className={cn(
                "w-4 h-4 lg:w-4 lg:h-4",
                isActive(link.path) 
                  ? "text-blue-600" 
                  : "text-gray-500 group-hover:text-gray-700"
              )} />
              {/* Text hidden on mobile, visible on tablet and up */}
              <span className="hidden sm:block">{t(link.nameKey)}</span>
              {isActive(link.path) && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default SimpleNavBar