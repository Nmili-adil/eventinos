import { Component, type ErrorInfo, type ReactNode } from 'react'
import { useMemo } from 'react'
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom'
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ServerErrorPage from '@/pages/ServerErrorPage'
import ProductionErrorPage from '@/pages/ProductionErrorPage'

// Check environment - use VITE_APP_ENV from .env file, fallback to MODE
const isDevelopment = (import.meta.env.VITE_APP_ENV || import.meta.env.MODE) === 'development'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

const ErrorStateCard = ({
  title = 'Une erreur est survenue',
  message = 'Une erreur inattendue s\'est produite. Veuillez réessayer.',
  details,
  primaryAction,
  secondaryAction,
}: {
  title?: string
  message?: string
  details?: string
  primaryAction?: ReactNode
  secondaryAction?: ReactNode
}) => (
  <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-xl border bg-white/80 p-10 text-center shadow-lg dark:border-gray-800 dark:bg-gray-900/80">
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-500/10">
      <AlertTriangle className="h-8 w-8" />
    </div>
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{title}</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{message}</p>
      {/* Only show technical details in development */}
      {isDevelopment && details && (
        <div className="mt-3">
          <p className="mb-1 text-xs font-semibold text-amber-600">⚠️ Development Only:</p>
          <p className="rounded-md bg-muted/60 p-3 text-xs font-mono text-muted-foreground break-words">
            {details}
          </p>
        </div>
      )}
    </div>
    <div className="flex flex-col gap-2 sm:flex-row">{primaryAction}{secondaryAction}</div>
  </div>
)

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: undefined,
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Only log detailed errors in development
    if (isDevelopment) {
      console.error('UI ErrorBoundary caught an error', error, errorInfo)
    }
    // In production, you could send to an error tracking service like Sentry
    // if (!isDevelopment) {
    //   errorTrackingService.captureException(error, { extra: errorInfo })
    // }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined })
    this.props.onReset?.()
  }

  render() {
    const { hasError, error } = this.state
    const { fallback, children } = this.props

    if (hasError) {
      if (fallback) return fallback

      // In production, show a simple error page with no technical details
      if (!isDevelopment) {
        return (
          <ProductionErrorPage
            onGoHome={() => (window.location.href = '/')}
            onRetry={this.handleReset}
          />
        )
      }

      // In development, show detailed error page
      return (
        <ServerErrorPage
          error={error}
          onGoHome={() => (window.location.href = '/')}
          onGoBack={() => window.history.back()}
          onRetry={this.handleReset}
        />
      )
    }

    return children
  }
}

export const RouteErrorElement = () => {
  const navigate = useNavigate()
  const error = useRouteError()

  // Log errors only in development
  if (isDevelopment) {
    console.error('RouteErrorElement caught:', error)
  }

  const { title, message, detail, is500Error } = useMemo(() => {
    if (isRouteErrorResponse(error)) {
      // Check if it's a 500 error
      const is500 = error.status >= 500 && error.status < 600
      
      // In production, show generic messages
      if (!isDevelopment) {
        return {
          title: 'Oops!',
          message: 'Une erreur est survenue lors du chargement de cette page.',
          detail: undefined,
          is500Error: is500,
        }
      }
      
      return {
        title: `Oops! ${error.status}`,
        message: error.statusText || 'An unexpected routing error occurred.',
        detail: typeof error.data === 'string' ? error.data : undefined,
        is500Error: is500,
      }
    }

    if (error instanceof Error) {
      // Check if the error message indicates a server error
      const is500 = error.message?.toLowerCase().includes('500') || 
                    error.message?.toLowerCase().includes('server error') ||
                    error.message?.toLowerCase().includes('internal error')
      
      // In production, show generic messages without technical details
      if (!isDevelopment) {
        return {
          title: 'Une erreur est survenue',
          message: 'Nous avons rencontré un problème lors du chargement de cette page.',
          detail: undefined,
          is500Error: is500,
        }
      }
      
      return {
        title: 'Something went wrong',
        message: 'We ran into a problem while loading this page.',
        detail: error.message,
        is500Error: is500,
      }
    }

    return {
      title: isDevelopment ? 'Unexpected error' : 'Erreur inattendue',
      message: isDevelopment 
        ? 'We could not determine what happened, but the page failed to load.'
        : 'La page n\'a pas pu se charger. Veuillez réessayer.',
      detail: undefined,
      is500Error: false,
    }
  }, [error])

  // Use appropriate error page based on environment
  if (is500Error || !isDevelopment) {
    // In production, always show simple error page
    if (!isDevelopment) {
      return (
        <ProductionErrorPage
          onRetry={() => window.location.reload()}
          onGoHome={() => window.location.href = '/'}
        />
      )
    }
    
    // In development, show detailed ServerErrorPage
    return (
      <ServerErrorPage
        error={error instanceof Error ? error : undefined}
        onRetry={() => window.location.reload()}
        onGoHome={() => window.location.href = '/'}
        onGoBack={() => window.history.back()}
      />
    )
  }

  return (
    <div className="flex max-w-3-xl h-[calc(90vh-64px)] items-center justify-center bg-background px-4">
      <ErrorStateCard
        title={title}
        message={message}
        details={isDevelopment ? detail : undefined}
        primaryAction={
          <Button onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        }
        secondaryAction={
          <Button variant="outline" onClick={() => navigate('/')} className="gap-2">
            <Home className="h-4 w-4" />
            Accueil
          </Button>
        }
      />
    </div>
  )
}

