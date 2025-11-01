import LoginForm from '@/components/partials/authComponents/loginForm'
import { DASHBOARD_OVERVIEW } from '@/constants/routerConstants'
import { getAuthToken } from '@/services/localStorage'
import type { RootState } from '@/store/app/rootReducer'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export default function LoginPage() {
  const { message, isAuthenticated, user, isLoading, error } = useSelector((state: RootState) => state.auth)
  const navigate = useNavigate()
  const location = useLocation()
  const token = getAuthToken()
  useEffect(() => {
    console.log('Auth state:', { isAuthenticated, user, message })

    if (isAuthenticated && user) {
      toast.success(message || 'Connexion réussie!')
      navigate(DASHBOARD_OVERVIEW)
    }

    if (error) {
      toast.error(typeof error === 'string' ? error : error?.message || 'Erreur de connexion')
    }
  }, [isAuthenticated, user, message, error, navigate])

  useEffect(() => {
    if (token) {
      navigate(DASHBOARD_OVERVIEW)
    }
  }, [])

  return (
    <div className="h-screen flex">
      <main className="flex-1 flex">
        <div className="md:flex-1 flex-1/2 bg-[url(/login-cover.png)] shadow-xl bg-center bg-no-repeat bg-cover relative">
          <div className='absolute flex items-center justify-center top-0 left-0 w-full h-full bg-black/40'>
            <img src="/logo-bg.svg" className='w-1/2 h-1/2' alt="UrEvent Logo" />
          </div>
        </div>
        <div className='mx-6 xl:mx-3 lg:w-4/12 flex flex-col items-center justify-center'>
          <div className="text-center mb-8">
            <h1 className="page-heading text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Bienvenue
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Accédez à votre compte <span className='font-semibold text-[#6e51e7] underline cursor-pointer'>Eventify</span>
            </p>
          </div>
          <LoginForm />
        </div>
      </main>
    </div>
  )
}