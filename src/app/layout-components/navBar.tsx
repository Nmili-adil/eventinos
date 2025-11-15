import { COMPTES_PAGE, CONTACTS_PAGE, DASHBOARD_OVERVIEW, EVENT_LISTE_PAGE, MEMBERS_PAGE } from "@/constants/routerConstants"
import { Link, useLocation } from "react-router-dom"

interface NavLink {
  name: string
  path: string
}

const navLinks: NavLink[] = [
  { name: 'Tableau de bord', path: DASHBOARD_OVERVIEW },
  { name: 'Événements', path: EVENT_LISTE_PAGE },
  { name: 'Membres', path: MEMBERS_PAGE },
  { name: 'Comptes', path: COMPTES_PAGE },
  { name: 'Contacts', path: CONTACTS_PAGE },
]

const SimpleNavBar = () => {
  const location = useLocation()

  const isActive = (path: string): boolean => {
    return location.pathname === path
  }

  return (
    <nav className="bg-white ">

         

          {/* Navigation Links */}
          <div className="flex  items-center space-x-6 justify-center ">
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

       
    </nav>
  )
}

export default SimpleNavBar