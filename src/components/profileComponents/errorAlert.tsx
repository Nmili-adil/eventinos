import { AlertCircle } from "lucide-react"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/store/app/store"
import { fetchUserByIdRequest } from "@/store/features/users/users.actions"
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'

// Check environment
const isDevelopment = (import.meta.env.VITE_APP_ENV || import.meta.env.MODE) === 'development'

const ErrorAlert = ({error, userId}: {error: any, userId: any}) => {
    const dispatch = useDispatch<AppDispatch>()
    const { t } = useTranslation()

    // In production, trigger global error dialog
    useEffect(() => {
      if (!isDevelopment && error) {
        window.dispatchEvent(new CustomEvent('global-error-dialog', {
          detail: {
            title: t('profile.error.title'),
            message: 'Impossible de charger les données du profil. Veuillez réessayer plus tard.'
          }
        }))
      }
    }, [error, t])

    // In production, don't show inline error
    if (!isDevelopment) {
      return null
    }

  return (
    <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-6 w-6" />
              <div>
                <h3 className="font-semibold">{t('profile.error.title')}</h3>
                <p className="text-sm">{error}</p>
              </div>
            </div>
            <Button 
              className="mt-4" 
              onClick={() => userId && dispatch(fetchUserByIdRequest(userId))}
            >
              {t('profile.error.tryAgain')}
            </Button>
          </CardContent>
        </Card>
      </div>
  )
}

export default ErrorAlert