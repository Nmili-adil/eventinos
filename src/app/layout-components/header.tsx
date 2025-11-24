import { useEffect, useMemo, useState, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Bell, Search, Menu, Loader2, CheckCircle, Mail, X } from 'lucide-react'
import ProfileDropDown from './profileDropDown'
import NavBar from './navBar'
import LanguageSwitcher from '@/components/shared/languageSwitcher'
import { useTranslation } from 'react-i18next'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { fetchNotificationsApi, markAllNotificationsReadApi, markNotificationReadApi, type NotificationItem } from '@/api/notificationsApi'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

const Header = () => {
    const { t } = useTranslation()
    const [notifications, setNotifications] = useState<NotificationItem[]>([])
    const [notificationsLoading, setNotificationsLoading] = useState(false)
    const [markingAll, setMarkingAll] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
    
    const mobileMenuRef = useRef<HTMLDivElement>(null)
    const mobileSearchRef = useRef<HTMLDivElement>(null)

    const unreadCount = useMemo(
        () => notifications.filter((notification) => !notification.read).length,
        [notifications]
    )

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Close mobile menu if clicked outside
            if (mobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
                setMobileMenuOpen(false)
            }
            
            // Close mobile search if clicked outside
            if (mobileSearchOpen && mobileSearchRef.current && !mobileSearchRef.current.contains(event.target as Node)) {
                setMobileSearchOpen(false)
            }
        }

        // Add event listener when components are open
        if (mobileMenuOpen || mobileSearchOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        // Cleanup
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [mobileMenuOpen, mobileSearchOpen])

    // Close mobile menu when route changes (optional)
    useEffect(() => {
        const handleRouteChange = () => {
            setMobileMenuOpen(false)
            setMobileSearchOpen(false)
        }

        // Listen for custom event from NavBar
        const handleCloseMobileMenu = () => {
            setMobileMenuOpen(false)
        }

        window.addEventListener('closeMobileMenu', handleCloseMobileMenu)
        
        return () => {
            window.removeEventListener('closeMobileMenu', handleCloseMobileMenu)
        }
    }, [])

    const loadNotifications = async () => {
        setNotificationsLoading(true)
        try {
            const response = await fetchNotificationsApi()
            const data = response.data?.data ?? []
            setNotifications(data)
        } catch (error) {
            console.error('Failed to load notifications', error)
        } finally {
            setNotificationsLoading(false)
        }
    }

    useEffect(() => {
        loadNotifications()
    }, [])

    const handleNotificationClick = async (notification: NotificationItem) => {
        if (!notification.read) {
            try {
                await markNotificationReadApi(notification._id)
                setNotifications((prev) =>
                    prev.map((item) =>
                        item._id === notification._id ? { ...item, read: true } : item
                    )
                )
            } catch (error) {
                console.error('Failed to mark notification as read', error)
            }
        }
    }

    const handleMarkAllRead = async () => {
        setMarkingAll(true)
        try {
            await markAllNotificationsReadApi()
            setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))
        } catch (error) {
            console.error('Failed to mark all notifications as read', error)
        } finally {
            setMarkingAll(false)
        }
    }

    return (
        <div className="flex flex-col bg-white border-b border-gray-200/60 shadow-sm sticky top-0 z-50 w-full">
            {/* Top Header Section */}
            <div className="flex items-center justify-between h-20 py-3 container mx-auto px-4 sm:px-6">
                {/* Left Section - Brand & Mobile Menu */}
                <div className="flex items-center gap-4">
                    {/* Mobile Menu Button */}
                    <button 
                        className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? (
                            <X className="w-5 h-5 text-gray-600" />
                        ) : (
                            <Menu className="w-5 h-5 text-gray-600" />
                        )}
                    </button>

                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <img
                            src="/Eventinas Logo.jpeg"
                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover"
                            alt="Eventinas Logo"
                        />
                    </div>

                    {/* Search Bar - Desktop */}
                    <div className="hidden md:block relative w-60 lg:w-80">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            className="pl-10 pr-4 py-2 bg-gray-50/80 border-gray-200 rounded-xl focus:bg-white focus:border-purple-300 transition-all duration-200 placeholder:text-gray-400"
                            placeholder={t('header.searchPlaceholder')}
                        />
                    </div>
                </div>

                {/* Navigation Bar - Desktop */}
                <div className="hidden lg:flex flex-1 mx-8">
                    <NavBar />
                </div>

                {/* Right Section - Notifications & Profile */}
                <div className="flex items-center gap-3 sm:gap-4">
                    {/* Language Switcher */}
                    <div className="">
                        <LanguageSwitcher />
                    </div>
                    
                    {/* Search Button (Mobile) */}
                    <button 
                        className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                        onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                    >
                        {mobileSearchOpen ? (
                            <X className="w-5 h-5 text-gray-600" />
                        ) : (
                            <Search className="w-5 h-5 text-gray-600" />
                        )}
                    </button>

                    {/* Notifications */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors group">
                                {notificationsLoading ? (
                                    <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
                                ) : (
                                    <Bell className="w-5 h-5 text-gray-600 group-hover:text-purple-600 transition-colors" />
                                )}
                                {unreadCount > 0 && (
                                    <>
                                        <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-semibold rounded-full border-2 border-white">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                        <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        </span>
                                    </>
                                )}
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 sm:w-96 p-0" align="end">
                            <div className="flex items-center justify-between px-4 py-3 border-b">
                                <div>
                                    <p className="text-sm font-semibold">Notifications</p>
                                    <p className="text-xs text-muted-foreground">
                                        {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs"
                                    disabled={markingAll || unreadCount === 0}
                                    onClick={handleMarkAllRead}
                                >
                                    {markingAll ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                        'Mark all'
                                    )}
                                </Button>
                            </div>
                            <ScrollArea className="max-h-80">
                                <div className="divide-y">
                                    {notificationsLoading && notifications.length === 0 && (
                                        <div className="flex flex-col gap-2 p-4">
                                            {Array.from({ length: 3 }).map((_, idx) => (
                                                <div key={idx} className="space-y-2">
                                                    <div className="h-3 w-1/2 bg-muted rounded" />
                                                    <div className="h-3 w-full bg-muted rounded" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {!notificationsLoading && notifications.length === 0 && (
                                        <div className="py-10 px-4 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                                            <Mail className="w-8 h-8 text-muted-foreground" />
                                            <p>No notifications yet</p>
                                        </div>
                                    )}
                                    {notifications.map((notification) => (
                                        <button
                                            key={notification._id}
                                            className={cn(
                                                "w-full text-left px-4 py-3 transition flex gap-3",
                                                notification.read ? "bg-white hover:bg-muted/60" : "bg-muted/40 hover:bg-muted/70"
                                            )}
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <div className="flex-shrink-0 mt-1">
                                                {notification.read ? (
                                                    <CheckCircle className="w-4 h-4 text-muted-foreground" />
                                                ) : (
                                                    <span className="block w-2 h-2 rounded-full bg-blue-500" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={cn(
                                                    "text-sm font-medium",
                                                    notification.read ? "text-muted-foreground" : "text-foreground"
                                                )}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {notification.message}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground mt-1">
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </PopoverContent>
                    </Popover>

                    {/* Profile Dropdown */}
                    <ProfileDropDown />
                </div>
            </div>

            {/* Mobile Search Bar */}
            {mobileSearchOpen && (
                <div 
                    ref={mobileSearchRef}
                    className="lg:hidden px-4 sm:px-6 pb-3 bg-white border-t border-gray-200"
                >
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            className="pl-10 pr-4 py-2 bg-gray-50/80 border-gray-200 rounded-xl focus:bg-white focus:border-purple-300 transition-all duration-200 placeholder:text-gray-400"
                            placeholder={t('header.searchPlaceholderMobile')}
                            autoFocus
                        />
                    </div>
                </div>
            )}

            {/* Mobile Navigation Menu */}
            {mobileMenuOpen && (
                <div 
                    ref={mobileMenuRef}
                    className="lg:hidden bg-transparent  relative"
                >
                    <div className="container mx-auto px-4 pt-2 backdrop-blur-2xl absolute ">
                        <NavBar mobile />
                    </div>
                </div>
            )}
        </div>
    )
}

export default Header