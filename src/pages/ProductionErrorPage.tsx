// pages/ProductionErrorPage.tsx
// A minimal error page for production - shows NO technical details
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProductionErrorPageProps {
  onRetry?: () => void
  onGoHome?: () => void
}

export default function ProductionErrorPage({
  onRetry,
  onGoHome,
}: ProductionErrorPageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4">
      <div className="flex flex-col items-center justify-center gap-8 rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-xl max-w-lg">
        {/* Icon */}
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="h-12 w-12 text-red-500" />
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-gray-900">
            Oops !
          </h1>
          <p className="text-lg text-gray-600">
            Une erreur inattendue s'est produite.
          </p>
          <p className="text-sm text-gray-500">
            Nous nous excusons pour la gêne occasionnée.<br />
            Veuillez réessayer ou revenir à l'accueil.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          {onRetry && (
            <Button 
              onClick={onRetry} 
              size="lg"
              className="gap-2 px-8"
            >
              <RefreshCw className="h-5 w-5" />
              Réessayer
            </Button>
          )}
          {onGoHome && (
            <Button 
              onClick={onGoHome} 
              variant="outline" 
              size="lg"
              className="gap-2 px-8"
            >
              <Home className="h-5 w-5" />
              Retour à l'accueil
            </Button>
          )}
          {!onRetry && !onGoHome && (
            <Button 
              onClick={() => window.location.href = '/'} 
              size="lg"
              className="gap-2 px-8"
            >
              <Home className="h-5 w-5" />
              Retour à l'accueil
            </Button>
          )}
        </div>

        {/* Support hint */}
        <p className="text-xs text-gray-400 mt-2">
          Si le problème persiste, contactez le support technique.
        </p>
      </div>
    </div>
  )
}
