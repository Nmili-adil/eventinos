import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, ArrowLeft, Key } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resetPasswordSchema, type ResetPasswordData } from '@/schema/authSchemas/forget-password-schema'
import type { RootState } from '@/store/app/rootReducer'
import { resetPassword, setForgotPasswordStep, clearForgotPasswordError } from '@/store/features/forgotpassword/forgotpassword.actions'

export default function NewPasswordStep() {
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const dispatch = useDispatch()
  const { isLoading, error, email, verificationCode } = useSelector((state: RootState) => state.forgotPassword)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
  })  

  const onSubmit = async (data: ResetPasswordData) => {
    dispatch(clearForgotPasswordError())
  
    // Ensure we have a verification code from the previous OTP step
    if (!verificationCode) {
      console.error('No verification code found')
      return
    }
  
    dispatch(resetPassword(email, verificationCode, data.newPassword, data.confirmPassword) as any)
  }

  const handleBack = () => {
    dispatch(setForgotPasswordStep('otp'))
    dispatch(clearForgotPasswordError())
  }

  const newPassword = watch('newPassword')

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div className="bg-linear-to-r from-green-600 to-emerald-600 rounded-xl p-3">
            <Key className="h-8 w-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">
          New Password
        </CardTitle>
        <CardDescription>
          Create a new secure password
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* DEBUG INFO - Remove after fixing */}
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs font-mono">
          <div className="font-bold mb-1">🔍 Debug Info:</div>
          <div>Email: {email || 'NOT SET'}</div>
          <div>Verification Code: {verificationCode || 'NOT SET'}</div>
          <div>Loading: {isLoading ? 'YES' : 'NO'}</div>
          <div>Error: {error || 'NONE'}</div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* New Password Field */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Enter your new password"
                {...register('newPassword')}
                className={errors.newPassword ? 'border-red-500 pr-10' : 'pr-10'}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-red-600">{errors.newPassword.message}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your new password"
                {...register('confirmPassword')}
                className={errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Password Strength */}
          {newPassword && newPassword.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Password Strength:</span>
                <span className={
                  newPassword.length < 8 ? 'text-red-600' :
                  !newPassword.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/) ? 'text-yellow-600' : 'text-green-600'
                }>
                  {newPassword.length < 8 ? 'Weak' :
                   !newPassword.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/) ? 'Medium' : 'Strong'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    newPassword.length < 8 ? 'bg-red-600 w-1/3' :
                    !newPassword.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/) ? 'bg-yellow-600 w-2/3' : 'bg-green-600 w-full'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full h-12 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Resetting...
              </>
            ) : (
              'Reset Password'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}