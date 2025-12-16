import { AlertCircle } from "lucide-react"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/store/app/store"
import { fetchUserByIdRequest } from "@/store/features/users/users.actions"
import { useTranslation } from 'react-i18next'

const ErrorAlert = ({error, userId}: {error: any, userId: any}) => {
    const dispatch = useDispatch<AppDispatch>()
    const { t } = useTranslation()

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