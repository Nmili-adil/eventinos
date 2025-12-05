import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { forgotPasswordEmailSchema, type ForgotPasswordEmailData } from '@/schema/authSchemas/forget-password-schema'
import { LOGIN_PAGE } from '@/constants/routerConstants'
import type { RootState } from '@/store/app/rootReducer'
import { requestPasswordReset, clearForgotPasswordError } from '@/store/features/forgotpassword/forgotpassword.actions'

export default function ForgotPasswordEmailStep() {
  const dispatch = useDispatch()
  const { isLoading, error } = useSelector((state: RootState) => state.forgotPassword)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordEmailData>({
    resolver: zodResolver(forgotPasswordEmailSchema),
  })

  const onSubmit = async (data: ForgotPasswordEmailData) => {
    console.log('Forgot password email submitted:', data.email)
    dispatch(clearForgotPasswordError())
    dispatch(requestPasswordReset(data.email) as any)
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <div className="bg-linear-to-r from-orange-600 to-red-600 rounded-xl p-3">
            <Mail className="h-8 w-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">
          Forgot Password?
        </CardTitle>
        <CardDescription>
          Enter your email to reset your password
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Sending code...
              </>
            ) : (
              'Send Reset Code'
            )}
          </Button>

          {/* Back to Login Link */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-gray-600">
              <Link
                to={LOGIN_PAGE}
                className="font-medium text-blue-600 hover:text-blue-500 underline-offset-4 hover:underline"
              >
                <ArrowLeft className="h-4 w-4 inline mr-1" />
                Back to Login
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}