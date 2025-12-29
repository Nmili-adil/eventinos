// pages/ServerErrorPage.tsx
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { is } from 'date-fns/locale'

interface ServerErrorPageProps {
  error?: Error
  onRetry?: () => void
  onGoHome?: () => void
  onGoBack?: () => void
}

export default function ServerErrorPage({
  error,
  onRetry,
  onGoHome,
  onGoBack,
}: ServerErrorPageProps) {
  const [isDevelopment, setIsDevelopment] = useState(false)
  useEffect(() => {
    setIsDevelopment(import.meta.env.MODE === 'development' ? true : false)
    console.log(isDevelopment)
  }, [isDevelopment])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center justify-center gap-6 rounded-xl border bg-white/80 p-10 text-center shadow-lg dark:border-gray-800 dark:bg-gray-900/80">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-500/10">
          <AlertTriangle className="h-10 w-10" />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isDevelopment ? 'Server Error' : 'Something went wrong'}
          </h1>
          <p className="mt-3 text-muted-foreground">
            {isDevelopment 
              ? "We're having trouble loading this page. This is likely a temporary server issue."
              : "We're experiencing technical difficulties. Please try again in a few moments."
            }
          </p>

          {/* Only show error details in development mode */}
          {isDevelopment && error && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold">Error Details (Development Only):</p>
              <pre className="max-w-lg overflow-x-auto rounded-md bg-muted p-4 text-left text-xs font-mono text-muted-foreground">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {onGoBack && (
            <Button onClick={onGoBack} variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          )}
          {onRetry && (
            <Button onClick={onRetry} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
          {onGoHome && (
            <Button onClick={onGoHome} variant="default" className="gap-2">
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          )}
          {!onRetry && !onGoBack && !onGoHome && (
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload Page
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}