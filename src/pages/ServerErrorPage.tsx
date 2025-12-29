// pages/ServerErrorPage.tsx
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

interface ServerErrorPageProps {
  error?: Error
  onRetry?: () => void
  onGoHome?: () => void
  onGoBack?: () => void
}

// Check environment - use VITE_APP_ENV from .env file, fallback to MODE
const isDevelopment = (import.meta.env.VITE_APP_ENV || import.meta.env.MODE) === 'development'

export default function ServerErrorPage({
  error,
  onRetry,
  onGoHome,
  onGoBack,
}: ServerErrorPageProps) {
  const { t } = useTranslation()

  // Only log errors in development
  if (isDevelopment && error) {
    console.error('ServerErrorPage - Error details:', error)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center justify-center gap-6 rounded-xl border bg-white/80 p-10 text-center shadow-lg dark:border-gray-800 dark:bg-gray-900/80 max-w-md">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-500/10">
          <AlertTriangle className="h-10 w-10" />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('error.serverError.title', 'Oops! Une erreur est survenue')}
          </h1>
          <p className="mt-3 text-muted-foreground">
            {t('error.serverError.message', "Nous rencontrons des difficultés techniques. Veuillez réessayer dans quelques instants.")}
          </p>

          {/* Only show error details in development mode - NEVER in production */}
          {isDevelopment && error && (
            <div className="mt-6 text-left">
              <p className="mb-2 text-sm font-semibold text-amber-600">⚠️ Development Only - Error Details:</p>
              <pre className="max-w-lg overflow-x-auto rounded-md bg-muted p-4 text-xs font-mono text-muted-foreground whitespace-pre-wrap break-words">
                {error.message}
                {error.stack && `\n\nStack Trace:\n${error.stack}`}
              </pre>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {onGoBack && (
            <Button onClick={onGoBack} variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t('error.actions.goBack', 'Retour')}
            </Button>
          )}
          {onRetry && (
            <Button onClick={onRetry} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              {t('error.actions.retry', 'Réessayer')}
            </Button>
          )}
          {onGoHome && (
            <Button onClick={onGoHome} variant="default" className="gap-2">
              <Home className="h-4 w-4" />
              {t('error.actions.home', 'Accueil')}
            </Button>
          )}
          {!onRetry && !onGoBack && !onGoHome && (
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('error.actions.reload', 'Recharger la page')}
            </Button>
          )}
        </div>

        {/* Contact support hint - shown in production */}
        {!isDevelopment && (
          <p className="text-xs text-muted-foreground mt-4">
            {t('error.serverError.contactSupport', "Si le problème persiste, veuillez contacter le support.")}
          </p>
        )}
      </div>
    </div>
  )
}