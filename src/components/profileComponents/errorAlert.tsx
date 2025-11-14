import { AlertCircle } from "lucide-react"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/store/app/store"
import { fetchUserByIdRequest } from "@/store/features/users/users.actions"

const ErrorAlert = ({error, userId}) => {
    const dispatch = useDispatch<AppDispatch>()

  return (
    <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-6 w-6" />
              <div>
                <h3 className="font-semibold">Error Loading Profile</h3>
                <p className="text-sm">{error}</p>
              </div>
            </div>
            <Button 
              className="mt-4" 
              onClick={() => userId && dispatch(fetchUserByIdRequest(userId))}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
  )
}

export default ErrorAlert