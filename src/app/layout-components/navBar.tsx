import { COMPTES_PAGE, CONTACTS_PAGE, DASHBOARD_OVERVIEW, EVENT_LISTE_PAGE, MEMBERS_PAGE } from "@/constants/routerConstants"
import { Link, useLocation } from "react-router-dom"
import { useTranslation } from 'react-i18next'

interface NavLink {
  nameKey: string
  path: string
}

const navLinks: NavLink[] = [
  { nameKey: 'navigation.dashboard', path: DASHBOARD_OVERVIEW },
  { nameKey: 'navigation.events', path: EVENT_LISTE_PAGE },
  { nameKey: 'navigation.members', path: MEMBERS_PAGE },
  { nameKey: 'navigation.accounts', path: COMPTES_PAGE },
  { nameKey: 'navigation.contacts', path: CONTACTS_PAGE },
]

const SimpleNavBar = () => {
  const location = useLocation()
  const { t } = useTranslation()

  const isActive = (path: string): boolean => {
    return location.pathname === path
  }

  return (
    <nav className="bg-white ">

         

          {/* Navigation Links */}
          <div className="flex  items-center space-x-6 justify-center ">
            {navLinks.map((link) => (
              <Link
                key={link.nameKey}
                to={link.path}
                className={`
                  relative text-sm font-medium transition-colors duration-200 py-2
                  ${isActive(link.path) 
                    ? 'text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                {t(link.nameKey)}
                {isActive(link.path) && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
                )}
              </Link>
            ))}
          </div>

       
    </nav>
  )
}

export default SimpleNavBar