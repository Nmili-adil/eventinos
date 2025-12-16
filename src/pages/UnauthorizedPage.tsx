import { ShieldAlert, ArrowLeft, Home, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { DASHBOARD_OVERVIEW } from '@/constants/routerConstants'

const UnauthorizedPage = () => {
  const navigate = useNavigate()

  return (
    <div className="h-[calc(100vh-15rem)] flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full  rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-purple-100/30 to-pink-100/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-2xl w-full mx-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header section with gradient */}
          <div className="bg-gradient-to-r from-red-500 via-red-600 to-rose-600 p-8 text-center relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative">
              <div className="inline-flex p-5 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 animate-bounce">
                <ShieldAlert className="h-16 w-16 text-white drop-shadow-lg" />
              </div>
              <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">401</h1>
              <p className="text-xl font-semibold text-white/90 drop-shadow-md">Unauthorized Access</p>
            </div>
          </div>

          {/* Content section */}
          <div className="p-10 text-center">
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-red-50 border-2 border-red-100 rounded-full">
                <Lock className="h-5 w-5 text-red-600" />
                <span className="text-sm font-semibold text-red-700">Restricted Area</span>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Insufficient Permissions
            </h2>
            
            <p className="text-gray-600 mb-3 leading-relaxed max-w-md mx-auto">
              You don't have the necessary permissions to access this page. This area is restricted to authorized users only.
            </p>
            
            <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto">
              If you believe this is an error, please contact your system administrator.
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="group relative overflow-hidden px-8 py-6 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center gap-2 font-semibold text-gray-700">
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
                  Go Back
                </span>
              </Button>

              <Button
                onClick={() => navigate(DASHBOARD_OVERVIEW)}
                className="group relative overflow-hidden px-8 py-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl border-0"
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center gap-2 font-semibold text-white">
                  <Home className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  Dashboard
                </span>
              </Button>
            </div>
          </div>

          {/* Footer decoration */}
          <div className="h-2 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500"></div>
        </div>

        {/* Additional info card */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 inline-block border border-white/40 shadow-sm">
            Need access? Contact your administrator to request permissions.
          </p>
        </div>
      </div>
    </div>
  )
}

export default UnauthorizedPage
