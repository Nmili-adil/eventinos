import { useSelector } from 'react-redux'
import type { RootState } from '@/store/app/rootReducer'
import ForgotPasswordEmailStep from '@/components/partials/authComponents/forgotPasswordEmailStep'
import ForgotPasswordOtpStep from '@/components/partials/authComponents/forgotPasswordOtpStep'
import NewPasswordStep from '@/components/partials/authComponents/newPasswordStep'
import ForgotPasswordCompleteStep from '@/components/partials/authComponents/forgotPasswordCompleteStep'
import { Calendar } from 'lucide-react'
import { t } from 'i18next'

export default function ForgotPasswordPage() {
  const forgotPasswordStep = useSelector((state: RootState) => state.forgotPassword.step)

  // Note: We don't reset the step here because it would clear the state
  // when the component re-renders during the password reset flow
  // The step is managed by Redux actions throughout the flow

  const steps = [
    { key: 'email', title: 'Email', component: ForgotPasswordEmailStep },
    { key: 'otp', title: 'Vérification', component: ForgotPasswordOtpStep },
    { key: 'new-password', title: 'Nouveau mot de passe', component: NewPasswordStep },
    { key: 'complete', title: 'Terminé', component: ForgotPasswordCompleteStep },
  ]

  const currentStepIndex = steps.findIndex(step => step.key === forgotPasswordStep)
  const CurrentStepComponent = steps[currentStepIndex]?.component

  return (
    <div className="min-h-screen bg-background flex">
      {/* main content  */}
        {/* Background Image - full screen on mobile, right half on desktop */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 w-full h-full flex items-center justify-center p-12">
          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            <img
              src="/event1.jpg"
              alt="Event 1"
              className="w-full h-40 object-cover rounded-lg shadow-lg"
            />
            <img
              src="/event2.jpg"
              alt="Event 2"
              className="w-full h-40 object-cover rounded-lg shadow-lg"
            />
            <img
              src="/event3.jpg"
              alt="Event 3"
              className="w-full h-40 object-cover rounded-lg shadow-lg"
            />
            <img
              src="/event4.jpg"
              alt="Event 4"
              className="w-full h-40 object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>

        <div className="absolute bottom-8 left-12 text-white z-20">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-6 h-6" />
            <h2 className="text-2xl font-bold">Eventinas</h2>
          </div>
          <p className="text-sm text-slate-300">
            Manage your events professionally
          </p>
        </div>
      </div>

        {/* Form Section - absolutely positioned on mobile, left half on desktop */}
        
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-0 sm:p-12">
        <div className="w-full max-w-lg">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-full md:w-24 md:h-24 rounded-xl bg-white mb-6">
              <img src="/Eventinas Logo.jpeg" alt="Eventinas Logo" className="w-24 h-24 object-cover" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-1 text-center md:text-start">
            {t('auth.welcome')}
            </h1>
            <p className="text-muted-foreground text-lg text-center md:text-start">
            {t('auth.accessAccount')} 
            </p>
          </div>

          <div className=" ">
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
        </div>
      </div>
    
  )
}