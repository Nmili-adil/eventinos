import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft, Search, Calendar } from 'lucide-react'
import { DASHBOARD_OVERVIEW, EVENT_LISTE_PAGE, MEMBERS_PAGE } from '@/constants/routerConstants'

const NotFoundPage = () => {
  const navigate = useNavigate()

  return (
    <div className="h-full w-full flex items-center justify-center px-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Illustration */}
        <div className="relative mb-8">
          {/* Animated background circles */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 bg-purple-200 rounded-full opacity-20 animate-pulse delay-75"></div>
          </div>
          
          {/* 404 Text */}
          <div className="relative">
            <h1 className="text-9xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              404
            </h1>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Calendar className="h-8 w-8 text-blue-600 animate-bounce" />
              <Search className="h-6 w-6 text-purple-600 animate-bounce delay-100" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Page introuvable
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            Oups ! La page que vous recherchez n'existe pas.
          </p>
          <p className="text-gray-500">
            Elle a peut-être été déplacée ou supprimée.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* Go Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Retour</span>
          </button>

          {/* Home Button */}
          <button
            onClick={() => navigate(DASHBOARD_OVERVIEW)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Home className="h-5 w-5" />
            <span className="font-medium">Accueil</span>
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Pages utiles :</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => navigate(EVENT_LISTE_PAGE)}
              className="text-blue-600 hover:text-blue-700 hover:underline text-sm font-medium"
            >
              Événements
            </button>
            <button
              onClick={() => navigate(DASHBOARD_OVERVIEW)}
              className="text-blue-600 hover:text-blue-700 hover:underline text-sm font-medium"
            >
              Statistiques
            </button>
            <button
              onClick={() => navigate(MEMBERS_PAGE)}
              className="text-blue-600 hover:text-blue-700 hover:underline text-sm font-medium"
            >
              Membres
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
