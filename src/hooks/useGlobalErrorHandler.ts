import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

// Check environment - use VITE_APP_ENV from .env file, fallback to MODE
const isDevelopment = (import.meta.env.VITE_APP_ENV || import.meta.env.MODE) === 'development'

interface UseGlobalErrorHandlerOptions {
  onServerError?: (error: Error) => void
  showToast?: boolean
  redirectTo?: string
}

/**
 * Custom hook to handle global errors, especially 500 server errors
 * 
 * @example
 * ```tsx
 * // In your component
 * useGlobalErrorHandler({
 *   showToast: true,
 *   redirectTo: '/error'
 * })
 * ```
 */
export const useGlobalErrorHandler = (options: UseGlobalErrorHandlerOptions = {}) => {
  const navigate = useNavigate()
  const { onServerError, showToast = true, redirectTo } = options

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const error = event.error

      // Check if it's a server error
      if (error && (error as any).isServerError) {
        event.preventDefault()

        if (showToast) {
          toast.error('Server Error', {
            description: error.message || 'An internal server error occurred. Please try again later.',
            duration: 5000,
          })
        }

        if (onServerError) {
          onServerError(error)
        }

        if (redirectTo) {
          navigate(redirectTo)
        }
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason

      // Check if it's a server error
      if (error && (error as any).isServerError) {
        event.preventDefault()

        if (showToast) {
          toast.error('Server Error', {
            description: error.message || 'An internal server error occurred. Please try again later.',
            duration: 5000,
          })
        }

        if (onServerError) {
          onServerError(error)
        }

        if (redirectTo) {
          navigate(redirectTo)
        }
      }
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [navigate, onServerError, showToast, redirectTo])
}

/**
 * Utility function to check if an error is a server error (500+)
 */
export const isServerError = (error: any): boolean => {
  return (
    error &&
    (error.isServerError === true ||
      error.status >= 500 ||
      (error.response && error.response.status >= 500))
  )
}

/**
 * Utility function to handle errors in async operations
 * Automatically shows toast for server errors
 * Note: 500 errors are also handled globally by the App component
 */
export const handleAsyncError = (error: any, customMessage?: string) => {
  // Only log in development
  if (isDevelopment) {
    console.error('Async operation error:', error)
  }

  // In production, show generic messages without technical details
  if (isServerError(error)) {
    // 500 errors are handled globally, but we can still show a toast
    toast.error('Erreur serveur', {
      description: isDevelopment 
        ? (customMessage || error.response?.data?.message || error.message || 'An internal server error occurred. Please try again later.')
        : 'Une erreur est survenue. Veuillez réessayer plus tard.',
      duration: 5000,
    })
  } else if (error.response?.status === 401) {
    toast.error('Session expirée', {
      description: 'Votre session a expiré. Veuillez vous reconnecter.',
      duration: 3000,
    })
  } else if (error.response?.status === 403) {
    toast.error('Accès refusé', {
      description: 'Vous n\'avez pas la permission d\'effectuer cette action.',
      duration: 3000,
    })
  } else if (error.response?.status === 404) {
    toast.error('Non trouvé', {
      description: customMessage || 'La ressource demandée n\'a pas été trouvée.',
      duration: 3000,
    })
  } else {
    toast.error('Erreur', {
      description: isDevelopment
        ? (customMessage || error.response?.data?.message || error.message || 'An unexpected error occurred.')
        : 'Une erreur inattendue est survenue.',
      duration: 3000,
    })
  }
}
