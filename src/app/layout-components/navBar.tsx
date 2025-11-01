import { DASHBOARD_OVERVIEW } from "@/constants/routerConstants"
import { Link, useLocation } from "react-router-dom"


interface Link {
    name:string,
    path:string
}

const links:Link[] = [
    {
        name:'statistique',
        path:DASHBOARD_OVERVIEW
    },
    {
        name:'evenements',
        path:'#'
    },
    {
        name:'membres',
        path:'#'
    },
    {
        name:'comptes',
        path:'#'
    },
    {
        name:'contacts',
        path:'#'
    },
]



const NavBar = () => {
    const location = useLocation()
    const currentLocation = (path:string) :string => {
        return location.pathname === path ? 'text-blue-500 underline' : ''
    }

  return (
    <div
        className="border border-slate-400 px-10 py-2 shadow-md"
    >
       <ul className="flex gap-2">
        {
            links.map((link:Link) => (
                <li key={link.name} className="px-3 capitalize">
                    <Link to={link.path}
                        className={`hover:text-blue-500 ${currentLocation(link.path)}`}
                    >{link.name}</Link>
                </li>
            ))
        }
        </ul> 
    </div>
  )
}

export default NavBar