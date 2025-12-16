import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { AppDispatch } from "@/store/app/store"
import { fetchMembersRequest } from "@/store/features/members/members.actions"
import { AlertCircle } from "lucide-react"
import { useDispatch } from "react-redux"

const ErrorState = ({error}: {error: string | null}) => {
    const dispatch = useDispatch<AppDispatch>()
  return (
    <div>
       <Card className="border-destructive">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2 text-destructive">
                    <AlertCircle className="h-6 w-6" />
                    <div>
                      <h3 className="font-semibold">Error Loading Members</h3>
                      <p className="text-sm">{error}</p>
                    </div>
                  </div>
                  <Button 
                    className="mt-4" 
                    onClick={() => dispatch(fetchMembersRequest())}
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
    </div>
  )
}

export default ErrorState
