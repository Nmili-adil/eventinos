import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import ForgotPasswordEmailStep from '@/components/partials/authComponents/forgotPasswordEmailStep'
import ForgotPasswordOtpStep from '@/components/partials/authComponents/forgotPasswordOtpStep'
import NewPasswordStep from '@/components/partials/authComponents/newPasswordStep'
import ForgotPasswordCompleteStep from '@/components/partials/authComponents/forgotPasswordCompleteStep'



export default function ForgotPasswordPage() {
  const { forgotPasswordStep, setForgotPasswordStep } = useAuthStore()

  // Reset to first step when component mounts
  useEffect(() => {
    setForgotPasswordStep('email')
  }, [setForgotPasswordStep])

  const steps = [
    { key: 'email', title: 'Email', component: ForgotPasswordEmailStep },
    { key: 'otp', title: 'Vérification', component: ForgotPasswordOtpStep },
    { key: 'new-password', title: 'Nouveau mot de passe', component: NewPasswordStep },
    { key: 'complete', title: 'Terminé', component: ForgotPasswordCompleteStep },
  ]

  const currentStepIndex = steps.findIndex(step => step.key === forgotPasswordStep)
  const CurrentStepComponent = steps[currentStepIndex]?.component

  return (
    <div className="min-h-screen flex flex-col">
      {/* main content  */}
      <main className="flex-1 flex">
        {/* Background Shapes */}
        <div className="flex-1 bg-[url(/login-cover.png)] shadow-xl bg-center bg-no-repeat bg-cover relative">
          <div className='absolute flex items-center justify-center top-0 left-0 w-full h-full bg-black/40'>
            <img src="/logo-bg.svg" alt="UrEvent Logo" className='w-1/2 h-1/2' />
          </div>
        </div>
        <div className='w-4/12 flex items-center justify-center p-8'>
          <div className="w-full max-w-md">
            {/* Progress Bar */}
            {forgotPasswordStep !== 'complete' && (
              <div className="mb-8">
                <div className="flex justify-between mb-2">
                  {steps.slice(0, -1).map((step, index) => (
                    <div
                      key={step.key}
                      className={`text-xs font-medium ${
                        index <= currentStepIndex ? 'text-blue-600' : 'text-gray-400'
                      }`}
                    >
                      {step.title}
                    </div>
                  ))}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${((currentStepIndex + 1) / (steps.length - 1)) * 100}%`
                    }}
                  />
                </div>
              </div>
            )}

            {/* Current Step */}
            {CurrentStepComponent && (
              <CurrentStepComponent />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}