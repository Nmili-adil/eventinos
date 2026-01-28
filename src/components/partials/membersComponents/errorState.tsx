import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { AppDispatch } from "@/store/app/store"
import { fetchMembersRequest } from "@/store/features/members/members.actions"
import { AlertCircle } from "lucide-react"
import { useDispatch } from "react-redux"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"

// Check environment
const isDevelopment = (import.meta.env.VITE_APP_ENV || import.meta.env.MODE) === 'development'

const ErrorState = ({error}: {error: string | null}) => {
    const dispatch = useDispatch<AppDispatch>()
    const { t } = useTranslation()

    // In production, trigger global error dialog
    useEffect(() => {
      if (!isDevelopment && error) {
        window.dispatchEvent(new CustomEvent('global-error-dialog', {
          detail: {
            title: t('globalErrors.loadingError', 'Loading Error'),
            message: t('globalErrors.loadingErrorData', 'Unable to load data. Please try again later.')
          }
        }))
      }
    }, [error, t])

    // In production, don't show inline error state
    if (!isDevelopment) {
      return null
    }

    // Development: show detailed inline error
    return (
      <div>
         <Card className="border-destructive">
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-2 text-destructive">
                      <AlertCircle className="h-6 w-6" />
                      <div>
                        <h3 className="font-semibold">{t('members.errors.loadingError', 'Error Loading Members')}</h3>
                        <p className="text-sm">{error}</p>
                      </div>
                    </div>
                    <Button 
                      className="mt-4" 
                      onClick={() => dispatch(fetchMembersRequest())}
                    >
                      {t('common.retry', 'Try Again')}
                    </Button>
                  </CardContent>
                </Card>
      </div>
    )
}

export default ErrorState
