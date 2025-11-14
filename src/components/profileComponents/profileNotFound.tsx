import { User } from "lucide-react"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { useDispatch } from "react-redux"
import { AppDispatch } from "@/store/app/store"
import { fetchUserByIdRequest } from "@/store/features/users/users.actions"

const ProfileNotFound = ({userId}) => {
    const dispatch = useDispatch<AppDispatch>()
  return (
    <div className="container mx-auto p-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold">No User Data</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Unable to load user profile. Please try again.
                </p>
                <Button 
                  onClick={() => userId && dispatch(fetchUserByIdRequest(userId))}
                >
                  Reload
                </Button>
              </CardContent>
            </Card>
          </div>
  )
}

export default ProfileNotFound