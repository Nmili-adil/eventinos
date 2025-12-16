import { CheckCircle, LogIn } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LOGIN_PAGE } from '@/constants/routerConstants'

export default function ForgotPasswordCompleteStep() {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect to login after 5 seconds
    const timer = setTimeout(() => {
      navigate(LOGIN_PAGE)
    }, 5000)

    return () => clearTimeout(timer)
  }, [navigate])

  const handleGoToLogin = () => {
    navigate('/login')
  }

  return (
    <Card className="shadow-lg border-0 text-center">
      <CardHeader className="pb-4">
        <div className="flex justify-center mb-4">
          <div className="bg-linear-to-r from-green-600 to-emerald-600 rounded-full p-3">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-green-600">
          Password Reset!
        </CardTitle>
        <CardDescription className="text-lg">
          Your password has been successfully changed
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Success Message */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">
            Congratulations
          </h3>
          <p className="text-gray-600">
            You can now sign in with your new password
          </p>
        </div>

        {/* Security Tips */}
        <div className="bg-blue-50 rounded-lg p-4 text-left">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Security Tips:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use a unique password for each account</li>
            <li>• Avoid personal information in your passwords</li>
            <li>• Change your passwords regularly</li>
          </ul>
        </div>

        {/* Countdown */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            Automatically redirecting to login in{' '}
            <span className="font-semibold text-blue-600">5 seconds</span>
          </p>
        </div>

        {/* Action Button */}
        <Button 
          className="w-full bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
          onClick={handleGoToLogin}
        >
          <LogIn className="h-4 w-4 mr-2" />
          Sign In
        </Button>

        {/* Quick Links */}
        <div className="border-t pt-4">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <Link to="/contact" className="text-blue-600 hover:text-blue-500 underline">
              Contact Support
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}