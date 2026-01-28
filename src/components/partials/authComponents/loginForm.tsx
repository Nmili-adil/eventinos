// Updated LoginForm component with Redux
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { DELETE_ACCOUNT_PAGE, PRIVACY_PAGE } from '@/constants/routerConstants'
import { loginSchema, type LoginFormData } from '@/schema/authSchemas/login-schema'
import type { RootState } from '@/store/app/rootReducer'
import type { AppDispatch } from '@/store/app/store'
import { authLoginRequest } from '@/store/features/auth/auth.actions'
import { zodResolver } from '@hookform/resolvers/zod'
import { Label } from '@radix-ui/react-label'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

// Check if we're in development mode
const isDevelopment = (import.meta.env.VITE_APP_ENV || import.meta.env.MODE) === 'development'

const LoginForm = () => {
    const [showPassword, setShowPassword] = useState(false)
    const { isLoading, error } = useSelector((state: RootState) => state.auth)
    const dispatch = useDispatch<AppDispatch>()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema) as any,
        defaultValues:{
            email: '',
            password: '',
            
        }
    })

    const onSubmit = async (data: LoginFormData) => {
        const submitData= {
            ...data,
            is_backoffice: true,
        }
        dispatch(authLoginRequest(submitData))
    }


    return (
        <div className="container mx-auto px-4 relative">
            <div className="max-w-md mx-auto">
                {/* Login Card */}
                <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                    <CardHeader className="text-center pb-4">
                        <div className="flex justify-center mb-4">
                             <div className="inline-flex items-center justify-center w-20 h-20 2xl:w-24 2xl:h-24 rounded-xl bg-white mb-3  2xl:mb-6">
              <img src="/Eventinas Logo.jpeg" alt="Eventinas Logo" className="w-full h-full  object-cover" />
            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                            Bienvenue
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                            Connectez-vous à votre compte pour continuer
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {/* Error Alert - only show in development mode */}
                        {isDevelopment && error && !isLoading && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertDescription className="text-sm capitalize font-medium">
                                    {typeof error === 'string' 
                                      ? error.replace("_", " ") 
                                      : (
                                          <>
                                            {(error as any)?.message?.replace("_", " ") || 'Une erreur est survenue'}
                                            {(error as any)?.details && (
                                              <span className="block mt-1 text-xs normal-case">
                                                {(error as any).details}
                                              </span>
                                            )}
                                          </>
                                        )
                                    }
                                </AlertDescription>
                            </Alert>
                        )}
                        
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                           
                            {/* Email Field */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="email"
                                    className="text-sm font-medium text-gray-900 dark:text-gray-100"
                                >
                                    Adresse email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Entrez votre email"
                                    {...register('email')}
                                    className={`h-12 px-4 text-base ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
                                        } bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label
                                        htmlFor="password"
                                        className="text-sm font-medium text-gray-900 dark:text-gray-100"
                                    >
                                        Mot de passe
                                    </Label>
                                    <Link
                                        to="/forgot-password"
                                        className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                        Mot de passe oublié ?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Entrez votre mot de passe"
                                        {...register('password')}
                                        className={`h-12 px-4 pr-12 text-base ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
                                            } bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </Button>
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full h-12 text-base font-medium bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Connexion en cours...
                                    </>
                                ) : (
                                    'Se connecter'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
              {/* Footer Links */}
      <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2  w-full flex -items-center justify-center p-4">
        <div className="flex items-center gap-6 text-sm text-slate-400">
          <Link
            to={PRIVACY_PAGE}
            className="hover:text-slate-200 transition-colors"
          >
            Politique de confidentialité
          </Link>
         <Link to={DELETE_ACCOUNT_PAGE}>Supprimer le compte</Link>
        </div>
      </div>
        </div>
    )
}

export default LoginForm