import { AlertTriangle, RefreshCw, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface ErrorDisplayProps {
  error?: Error | null
  title?: string
  message?: string
  onRetry?: () => void
  onDismiss?: () => void
  variant?: 'card' | 'alert' | 'inline'
  showDetails?: boolean
}

/**
 * Reusable component to display errors with retry functionality
 * 
 * @example
 * ```tsx
 * // In your component
 * const [error, setError] = useState<Error | null>(null)
 * 
 * if (error) {
 *   return (
 *     <ErrorDisplay
 *       error={error}
 *       onRetry={() => {
 *         setError(null)
 *         fetchData()
 *       }}
 *       onDismiss={() => setError(null)}
 *     />
 *   )
 * }
 * ```
 */
export const ErrorDisplay = ({
  error,
  title = 'Something went wrong',
  message = 'An error occurred while processing your request.',
  onRetry,
  onDismiss,
  variant = 'card',
  showDetails = process.env.NODE_ENV === 'development',
}: ErrorDisplayProps) => {
  const errorMessage = error?.message || message

  if (variant === 'alert') {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2 space-y-3">
          <p>{errorMessage}</p>
          {showDetails && error?.stack && (
            <details className="text-xs">
              <summary className="cursor-pointer hover:underline">View Details</summary>
              <pre className="mt-2 overflow-auto text-xs bg-destructive/10 p-2 rounded">
                {error.stack}
              </pre>
            </details>
          )}
          {(onRetry || onDismiss) && (
            <div className="flex gap-2 pt-2">
              {onRetry && (
                <Button size="sm" variant="outline" onClick={onRetry}>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Try Again
                </Button>
              )}
              {onDismiss && (
                <Button size="sm" variant="ghost" onClick={onDismiss}>
                  Dismiss
                </Button>
              )}
            </div>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  if (variant === 'inline') {
    return (
      <div className="flex items-start gap-3 p-4 border border-red-200 bg-red-50 rounded-lg">
        <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <div>
            <p className="font-semibold text-red-900">{title}</p>
            <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
          </div>
          {(onRetry || onDismiss) && (
            <div className="flex gap-2">
              {onRetry && (
                <Button size="sm" variant="outline" onClick={onRetry} className="h-8">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              )}
              {onDismiss && (
                <Button size="sm" variant="ghost" onClick={onDismiss} className="h-8">
                  Dismiss
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Default: card variant
  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-900">
          <AlertTriangle className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription className="text-red-700">{errorMessage}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {showDetails && error?.stack && (
          <details className="text-xs text-red-800">
            <summary className="cursor-pointer hover:underline font-semibold">
              View Error Details
            </summary>
            <pre className="mt-2 overflow-auto text-xs bg-red-100 p-3 rounded border border-red-200 max-h-40">
              {error.stack}
            </pre>
          </details>
        )}
        {(onRetry || onDismiss) && (
          <div className="flex gap-3">
            {onRetry && (
              <Button variant="default" onClick={onRetry} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            )}
            {onDismiss && (
              <Button variant="outline" onClick={onDismiss}>
                Dismiss
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Simple loading error state for data fetching
 */
export const LoadingError = ({ onRetry }: { onRetry?: () => void }) => (
  <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-6">
    <XCircle className="h-12 w-12 text-red-500 mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Data</h3>
    <p className="text-sm text-gray-600 mb-4">
      We couldn't load the data. Please try again.
    </p>
    {onRetry && (
      <Button onClick={onRetry} variant="outline" className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Retry
      </Button>
    )}
  </div>
)
