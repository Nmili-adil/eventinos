import { Input } from '@/components/ui/input'
import { Bell, Search, Menu } from 'lucide-react'
import ProfileDropDown from './profileDropDown'
import NavBar from './navBar'

const Header = () => {
    return (
        <div className="flex flex-col bg-white border-b border-gray-200/60 shadow-sm sticky top-0 z-50 w-full">
            {/* Top Header Section */}
            <div className="flex items-center justify-between h-14 py-3 container mx-auto px-6">
                {/* Left Section - Brand & Search */}
                <div className="flex items-center justify-between gap-6">
                    {/* Mobile Menu Button */}
                    <button className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                        <Menu className="w-5 h-5 text-gray-600" />
                    </button>

                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Eventify
                        </h1>
                    </div>

                    {/* Search Bar */}
                    <div className="hidden md:block relative w-80">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            className="pl-10 pr-4 py-2 bg-gray-50/80 border-gray-200 rounded-xl focus:bg-white focus:border-purple-300 transition-all duration-200 placeholder:text-gray-400"
                            placeholder="Rechercher des événements, membres..."
                        />
                    </div>
                </div>
                <div className="flex-1">

                <NavBar />
                </div>
                {/* Right Section - Notifications & Profile */}
                <div className="flex items-center gap-4">
                    {/* Search Button (Mobile) */}
                    <button className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                        <Search className="w-5 h-5 text-gray-600" />
                    </button>

                    {/* Notifications */}
                    <div className="relative">
                        <button className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors group">
                            <Bell className="w-5 h-5 text-gray-600 group-hover:text-purple-600 transition-colors" />

                            {/* Notification Badge */}
                            <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-semibold rounded-full border-2 border-white">
                                3
                            </span>

                            {/* Pulse Animation */}
                            <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            </span>
                        </button>
                    </div>

                    {/* Profile Dropdown */}
                    <ProfileDropDown />
                </div>
            </div>

            {/* Navigation Bar */}


            {/* Mobile Search Bar (Collapsible) */}
            <div className="md:hidden px-6 pb-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        className="pl-10 pr-4 py-2 bg-gray-50/80 border-gray-200 rounded-xl focus:bg-white focus:border-purple-300 transition-all duration-200 placeholder:text-gray-400"
                        placeholder="Rechercher..."
                    />
                </div>
            </div>
        </div>
    )
}

export default Header