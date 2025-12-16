import { User } from "lucide-react"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { useDispatch } from "react-redux"
import { AppDispatch } from "@/store/app/store"
import { fetchUserByIdRequest } from "@/store/features/users/users.actions"
import { useTranslation } from 'react-i18next'

const ProfileNotFound = ({userId}) => {
    const dispatch = useDispatch<AppDispatch>()
    const { t } = useTranslation()
  return (
    <div className="container mx-auto p-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold">{t('profile.notFound.title')}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('profile.notFound.message')}
                </p>
                <Button 
                  onClick={() => userId && dispatch(fetchUserByIdRequest(userId))}
                >
                  {t('profile.notFound.reload')}
                </Button>
              </CardContent>
            </Card>
          </div>
  )
}

export default ProfileNotFound