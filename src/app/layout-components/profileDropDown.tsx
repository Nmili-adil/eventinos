import { Button } from "@/components/ui/button"
import { LogOut } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User } from 'lucide-react'
import { useNavigate } from "react-router-dom"
import { LOGIN_PAGE } from "@/constants/routerConstants"
import { useDispatch, useSelector } from "react-redux"
import { authLogout } from "@/store/features/auth/auth.actions"
import type { AppDispatch } from "@/store/app/store"
import type { RootState } from "@/store/app/rootReducer"

const ProfileDropDown = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()

  const handleLogout = (e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
    e.preventDefault()
    dispatch(authLogout())
    navigate(LOGIN_PAGE)
  }


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {
          user?.picture ?
            (<img src={user.picture} alt="user" className="w-10 h-10 object-cover rounded-full" />) :
            (
              <Button variant="outline" className="rounded-full">
                <User className="w-24 h-24 " />
              </Button>
            )
        }

      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 mr-2 border-gray-100" align="start">
        <DropdownMenuLabel className="" >My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Profile
          </DropdownMenuItem>

          <DropdownMenuItem>
            Settings
          </DropdownMenuItem>

        </DropdownMenuGroup>
        <DropdownMenuItem>Invite Users</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="hover:bg-red-600" onClick={handleLogout}>
          Log out
          <DropdownMenuShortcut><LogOut /></DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ProfileDropDown