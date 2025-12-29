import { Component, type ErrorInfo, type ReactNode } from 'react'
import { useMemo } from 'react'
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom'
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ServerErrorPage from '@/pages/ServerErrorPage'

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
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
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
      {details && (
        <p className="mt-3 rounded-md bg-muted/60 p-3 text-xs font-mono text-muted-foreground">
          {details}
        </p>
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
    console.error('UI ErrorBoundary caught an error', error, errorInfo)
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

      // Use ServerErrorPage for better UX
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

  const { title, message, detail, is500Error } = useMemo(() => {
    if (isRouteErrorResponse(error)) {
      // Check if it's a 500 error
      const is500 = error.status >= 500 && error.status < 600
      
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
      
      return {
        title: 'Something went wrong',
        message: 'We ran into a problem while loading this page.',
        detail: error.message,
        is500Error: is500,
      }
    }

    return {
      title: 'Unexpected error',
      message: 'We could not determine what happened, but the page failed to load.',
      detail: undefined,
      is500Error: false,
    }
  }, [error])

  // Use ServerErrorPage for 500 errors
  if (is500Error) {
    return (
      <ServerErrorPage
    error={error}
    onRetry={this.handleReset}
    onGoHome={() => window.location.href = '/'}
    onGoBack={() => window.history.back()}
  />
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <ErrorStateCard
        title={title}
        message={message}
        details={detail}
        primaryAction={
          <Button onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go back
          </Button>
        }
        secondaryAction={
          <Button variant="outline" onClick={() => navigate('/')} className="gap-2">
            <Home className="h-4 w-4" />
            Go home
          </Button>
        }
      />
    </div>
  )
}

