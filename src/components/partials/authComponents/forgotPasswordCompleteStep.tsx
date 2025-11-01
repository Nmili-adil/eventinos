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
          Mot de passe réinitialisé !
        </CardTitle>
        <CardDescription className="text-lg">
          Votre mot de passe a été modifié avec succès
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Success Message */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">
            Félicitations
          </h3>
          <p className="text-gray-600">
            Vous pouvez maintenant vous connecter avec votre nouveau mot de passe
          </p>
        </div>

        {/* Security Tips */}
        <div className="bg-blue-50 rounded-lg p-4 text-left">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Conseils de sécurité :</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Utilisez un mot de passe unique pour chaque compte</li>
            <li>• Évitez les informations personnelles dans vos mots de passe</li>
            <li>• Changez régulièrement vos mots de passe</li>
          </ul>
        </div>

        {/* Countdown */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            Redirection automatique vers la connexion dans{' '}
            <span className="font-semibold text-blue-600">5 secondes</span>
          </p>
        </div>

        {/* Action Button */}
        <Button 
          className="w-full bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
          onClick={handleGoToLogin}
        >
          <LogIn className="h-4 w-4 mr-2" />
          Se connecter
        </Button>

        {/* Quick Links */}
        <div className="border-t pt-4">
          <p className="text-sm text-gray-600">
            Vous avez besoin d'aide ?{' '}
            <Link to="/contact" className="text-blue-600 hover:text-blue-500 underline">
              Contactez le support
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}