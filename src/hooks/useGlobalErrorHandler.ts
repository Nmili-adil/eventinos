import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import i18n from '@/i18n/config'

// Check environment - use VITE_APP_ENV from .env file, fallback to MODE
const isDevelopment = (import.meta.env.VITE_APP_ENV || import.meta.env.MODE) === 'development'

// Helper to get translation
const t = (key: string, fallback: string) => i18n.t(key, fallback)

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

  // Extract error data - handle both direct error objects and axios response errors
  const errorData = error?.response?.data || error?.data || error
  const errorMessage = errorData?.message || error?.message
  const errorDetails = errorData?.details
  
  // Check if we have a response from the server (error has response data)
  const hasResponse = !!(error?.response?.data || error?.data || (error && typeof error === 'object' && error.message && error.details))

  // Get the display message - prioritize details from API response
  const displayMessage = errorDetails || errorMessage || customMessage

  // In production mode
  if (!isDevelopment) {
    // If NO response from server (network error, server unreachable), show error dialog
    if (!hasResponse) {
      const title = t('globalErrors.connectionError', 'Erreur de connexion');
      const message = t('globalErrors.connectionErrorMessage', 'Impossible de contacter le serveur. Veuillez vérifier votre connexion internet et réessayer.');
      
      window.dispatchEvent(new CustomEvent('global-error-dialog', {
        detail: { title, message }
      }));
      return;
    }
    
    // If we have a response, show toast with the error details
    let title = t('globalErrors.error', 'Erreur');
    
    // Handle specific error messages from backend
    if (errorMessage === 'account_inactive') {
      title = t('globalErrors.accountInactive', 'Compte désactivé');
    } else if (isServerError(error)) {
      title = t('globalErrors.serverError', 'Erreur serveur');
    } else if (error.response?.status === 401) {
      title = t('globalErrors.sessionExpired', 'Session expirée');
    } else if (error.response?.status === 403) {
      title = t('globalErrors.accessDenied', 'Accès refusé');
    } else if (error.response?.status === 404) {
      title = t('globalErrors.notFound', 'Non trouvé');
    } else if (error.response?.status === 400) {
      title = t('globalErrors.invalidRequest', 'Requête invalide');
    }
    
    // Show toast with the error details for better UX
    toast.error(title, {
      description: displayMessage || t('globalErrors.genericError', 'Une erreur inattendue s\'est produite.'),
      duration: 5000,
    })
    return;
  }

  // In development, show toasts for all errors
  // Handle specific error messages from backend
  if (errorMessage === 'account_inactive') {
    toast.error(t('globalErrors.accountInactive', 'Compte désactivé'), {
      description: displayMessage || t('globalErrors.accountInactiveMessage', 'Votre compte a été désactivé. Veuillez contacter le support.'),
      duration: 5000,
    })
  } else if (isServerError(error)) {
    toast.error(t('globalErrors.serverError', 'Erreur serveur'), {
      description: displayMessage || t('globalErrors.serverErrorMessage', 'Une erreur est survenue. Veuillez réessayer plus tard.'),
      duration: 5000,
    })
  } else if (error.response?.status === 401) {
    toast.error(t('globalErrors.sessionExpired', 'Session expirée'), {
      description: t('globalErrors.sessionExpiredMessage', 'Votre session a expiré. Veuillez vous reconnecter.'),
      duration: 3000,
    })
  } else if (error.response?.status === 403) {
    toast.error(t('globalErrors.accessDenied', 'Accès refusé'), {
      description: t('globalErrors.accessDeniedMessage', 'Vous n\'avez pas la permission d\'effectuer cette action.'),
      duration: 3000,
    })
  } else if (error.response?.status === 404) {
    toast.error(t('globalErrors.notFound', 'Non trouvé'), {
      description: customMessage || t('globalErrors.notFoundMessage', 'La ressource demandée n\'a pas été trouvée.'),
      duration: 3000,
    })
  } else {
    toast.error(t('globalErrors.error', 'Erreur'), {
      description: displayMessage || t('globalErrors.genericError', 'Une erreur inattendue s\'est produite.'),
      duration: 3000,
    })
  }
}
