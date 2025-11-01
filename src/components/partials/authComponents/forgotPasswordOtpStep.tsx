import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Shield, ArrowLeft } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store/authStore'
import { forgotPasswordOtpSchema, type ForgotPasswordOtpData } from '@/schema/authSchemas/forget-password-schema'

export default function ForgotPasswordOtpStep() {
  const { isLoading, error, forgotPasswordEmail, verifyResetOtp, setForgotPasswordStep, clearError } = useAuthStore()
  const [otp, setOtp] = useState(['', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const {
    handleSubmit,
    setValue,
  } = useForm<ForgotPasswordOtpData>({
    resolver: zodResolver(forgotPasswordOtpSchema),
  })

  // Update form value when OTP changes
  useEffect(() => {
    const otpString = otp.join('')
    setValue('otp', otpString)
  }, [otp, setValue])

  const onSubmit = async (data: ForgotPasswordOtpData) => {
    console.log('OTP submitted:', data.otp)
    clearError()
    try {
      await verifyResetOtp(forgotPasswordEmail!, data.otp)
    } catch (error) {
      console.log('Error verifying OTP:', error)
    }
  }

  const handleBack = () => {
    setForgotPasswordStep('email')
    clearError()
  }

  const handleOtpChange = (value: string, index: number) => {
    if (value && !/^\d+$/.test(value)) {
      return
    }

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const paste = e.clipboardData.getData('text').trim()
    
    if (paste.match(/^\d{4}$/)) {
      const pasteArray = paste.split('')
      setOtp(pasteArray)
      inputRefs.current[3]?.focus()
    }
  }

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
            Retour
          </Button>
          <div className="bg-linear-to-r from-purple-600 to-blue-600 rounded-xl p-3">
            <Shield className="h-8 w-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">
          Vérification
        </CardTitle>
        <CardDescription>
          Entrez le code à 4 chiffres envoyé à {forgotPasswordEmail}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* OTP Input */}
          <div className="space-y-2">
            <Label>Code de réinitialisation</Label>
            <div className="flex space-x-2 justify-center">
              {[0, 1, 2, 3].map((index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={otp[index]}
                  className="w-12 h-12 text-center text-lg font-semibold"
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  autoFocus={index === 0}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 text-center">
              Code de démonstration: <strong>1234</strong>
            </p>
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
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Vérification...
              </>
            ) : (
              'Vérifier le code'
            )}
          </Button>

          {/* Resend Code */}
          <div className="text-center">
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-500"
              onClick={() => console.log('Resend code clicked')}
            >
              Renvoyer le code
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}