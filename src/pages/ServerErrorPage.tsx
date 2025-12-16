import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft, RefreshCw, AlertTriangle, ServerCrash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DASHBOARD_OVERVIEW } from '@/constants/routerConstants'

interface ServerErrorPageProps {
  error?: Error
  resetError?: () => void
}

const ServerErrorPage = ({ error, resetError }: ServerErrorPageProps) => {
  const navigate = useNavigate()

  const handleRefresh = () => {
    if (resetError) {
      resetError()
    }
    window.location.reload()
  }

  const handleGoHome = () => {
    if (resetError) {
      resetError()
    }
    navigate(DASHBOARD_OVERVIEW)
  }

  return (
    <div className="h-screen w-full flex items-center justify-center px-4 bg-gradient-to-br from-red-50 via-white to-orange-50">
      <div className="max-w-2xl w-full">
        {/* Error Illustration */}
        <div className="relative mb-8 text-center">
          {/* Animated background circles */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-72 h-72 bg-red-200 rounded-full opacity-20 animate-pulse"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-56 h-56 bg-orange-200 rounded-full opacity-20 animate-pulse delay-75"></div>
          </div>
          
          {/* 500 Text */}
          <div className="relative">
            <h1 className="text-9xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              500
            </h1>
            <div className="flex items-center justify-center gap-3 mt-4">
              <ServerCrash className="h-10 w-10 text-red-600 animate-bounce" />
              <AlertTriangle className="h-8 w-8 text-orange-600 animate-bounce delay-100" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Internal Server Error
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            Oops! Something went wrong on our end.
          </p>
          <p className="text-gray-500 mb-6">
            We're working to fix the issue. Please try again in a moment.
          </p>

          {/* Error Details Card (for development) */}
          {error && process.env.NODE_ENV === 'development' && (
            <Card className="mt-6 border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="text-left">
                  <p className="text-sm font-semibold text-red-800 mb-2">Error Details:</p>
                  <p className="text-xs text-red-700 font-mono break-all">
                    {error.message}
                  </p>
                  {error.stack && (
                    <details className="mt-3">
                      <summary className="text-xs text-red-600 cursor-pointer hover:text-red-800">
                        View Stack Trace
                      </summary>
                      <pre className="mt-2 text-xs text-red-600 overflow-auto max-h-40 p-2 bg-red-100 rounded">
                        {error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* Refresh Button */}
          <Button
            onClick={handleRefresh}
            className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold px-8 py-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Try Again
          </Button>

          {/* Go Home Button */}
          <Button
            onClick={handleGoHome}
            variant="outline"
            className="w-full sm:w-auto border-2 border-gray-300 hover:border-gray-400 px-8 py-6 rounded-lg shadow hover:shadow-md transform hover:scale-105 transition-all duration-200"
          >
            <Home className="h-5 w-5 mr-2" />
            Go to Dashboard
          </Button>

          {/* Go Back Button */}
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="w-full sm:w-auto px-8 py-6 rounded-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            If the problem persists, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ServerErrorPage
