import { Button } from "@/components/ui/button"
import { LogOut, Settings } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User } from 'lucide-react'
import { Link, useNavigate } from "react-router-dom"
import { LOGIN_PAGE, PROFILE_PAGE, SETTINGS_PAGE } from "@/constants/routerConstants"
import { useDispatch, useSelector } from "react-redux"
import { authLogout } from "@/store/features/auth/auth.actions"
import type { AppDispatch } from "@/store/app/store"
import type { RootState } from "@/store/app/rootReducer"
import { getUserData } from "@/services/localStorage"
import { useTranslation } from 'react-i18next'

const ProfileDropDown = () => {
  const { user, role: authRole } = useSelector((state: RootState) => state.auth)
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { t } = useTranslation()
  
  const userData = getUserData()
  const userRole = authRole || userData?.user?.toLowerCase()
  const isAdminOrOrganizer = userRole === 'admin'

  const handleLogout = (e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
    e.preventDefault()
    dispatch(authLogout())
    navigate(LOGIN_PAGE)
  }




  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {
          user && 'picture' in user && user.picture ?
            (<img src={user.picture as string} alt="user" className="w-10 h-10 object-cover rounded-full" />) :
            (
              <Button variant="outline" className="rounded-full">
                <User className="w-24 h-24 " />
              </Button>
            )
        }

      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 mr-2 border-gray-100" align="start">
        <DropdownMenuLabel className="" >{t('common.myAccount')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="hover:bg-gray-100 hover:text-gray-900">
            <Link className="w-full flex items-center gap-2" to={PROFILE_PAGE(getUserData()._id)}>
            <User className="w-4 h-4" />
            {t('common.profile')}
            </Link>
          </DropdownMenuItem>

          {isAdminOrOrganizer && (
            <DropdownMenuItem className="hover:bg-gray-100 hover:text-gray-900">
              <Link to={SETTINGS_PAGE} className="w-full flex items-center gap-2" >
              <Settings className="w-4 h-4" />
              {t('common.settings')}
              </Link>
            </DropdownMenuItem>
          )}

        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="hover:bg-red-600 hover:text-white flex items-center gap-2" onClick={handleLogout}>
          <LogOut className="w-4 h-4 hover:text-white" />
          {t('common.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ProfileDropDown