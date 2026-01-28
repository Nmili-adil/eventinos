import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft, Search, Calendar } from 'lucide-react'
import { DASHBOARD_OVERVIEW, EVENT_LISTE_PAGE, MEMBERS_PAGE } from '@/constants/routerConstants'
import { useTranslation } from 'react-i18next'

const NotFoundPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Illustration */}
        <div className="relative mb-8">
          {/* Animated background circles */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 md:w-64 h-48 md:h-64 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 md:w-48 h-32 md:h-48 bg-purple-200 rounded-full opacity-20 animate-pulse delay-75"></div>
          </div>
          
          {/* 404 Text */}
          <div className="relative">
            <h1 className="text-7xl md:text-9xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              404
            </h1>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Calendar className="h-6 md:h-8 w-6 md:w-8 text-blue-600 animate-bounce" />
              <Search className="h-4 md:h-6 w-4 md:w-6 text-purple-600 animate-bounce delay-100" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t('notFound.title')}
          </h2>
          <p className="text-base md:text-lg text-gray-600 mb-2">
            {t('notFound.message')}
          </p>
          <p className="text-gray-500">
            {t('notFound.subMessage')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* Go Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">{t('notFound.goBack')}</span>
          </button>

          {/* Home Button */}
          <button
            onClick={() => navigate(DASHBOARD_OVERVIEW)}
            className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Home className="h-5 w-5" />
            <span className="font-medium">{t('notFound.goHome')}</span>
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">{t('notFound.usefulPages', 'Useful pages:')}</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => navigate(EVENT_LISTE_PAGE)}
              className="text-blue-600 hover:text-blue-700 hover:underline text-sm font-medium"
            >
              {t('nav.events', 'Events')}
            </button>
            <button
              onClick={() => navigate(DASHBOARD_OVERVIEW)}
              className="text-blue-600 hover:text-blue-700 hover:underline text-sm font-medium"
            >
              {t('nav.statistics', 'Statistics')}
            </button>
            <button
              onClick={() => navigate(MEMBERS_PAGE)}
              className="text-blue-600 hover:text-blue-700 hover:underline text-sm font-medium"
            >
              {t('nav.members', 'Members')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
