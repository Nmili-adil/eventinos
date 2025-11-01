import { Input } from '@/components/ui/input'
import { Bell, Search } from 'lucide-react'
import ProfileDropDown from './profileDropDown'
import NavBar from './navBar'

const Header = () => {
    return (
        <div className='felx flex-col '>

       
        <div className='flex justify-between px-10 py-1 '>
            <div className='flex items-center gap-3'>
                <h1 className='capitalize text-xl font-semibold'>eventify</h1>
                <div className='relative'>
                    <Input className='pl-8 placeholder:text-slate-400' placeholder='search' />
                    <Search className='absolute top-1/2 -translate-1/2 left-4 border-r px-1 border-slate-400' />
                </div>
            </div>
            <div className='flex items-center gap-4'>
                <div className='relative'>
                    <span className='absolute top-0 right-0 bg-red-500 rounded-full w-2 h-2' />

                    <Bell />
                </div>
                <ProfileDropDown />
            </div>
        </div>
        <NavBar />
         </div>
    )
}

export default Header