import { Router } from "@/router/router"
import { RouterProvider } from "react-router-dom"
import { Toaster } from 'sonner'
import {  Provider } from 'react-redux'
import store from "@/store/app/store"
import { LoadingProvider } from "@/contexts/LoadingContext"
import { ErrorBoundary } from "@/components/shared/ErrorBoundary"
import { useEffect, useState } from 'react'
import ServerErrorPage from '@/pages/ServerErrorPage'
import ProductionErrorPage from '@/pages/ProductionErrorPage'
import ErrorDialog from '@/components/shared/ErrorDialog'
import { authInitialize } from "@/store/features/auth/auth.actions"

// Check environment - use VITE_APP_ENV from .env file, fallback to MODE
const isDevelopment = (import.meta.env.VITE_APP_ENV || import.meta.env.MODE) === 'development'


// Global error dialog state for production
const AppContent = () => {
  const [serverError, setServerError] = useState<{ status: number; message: string; error: any } | null>(null)
  const [errorDialog, setErrorDialog] = useState<{ open: boolean; title: string; message: string } | null>(null)

  useEffect(() => {
    store.dispatch(authInitialize());

    // Listen for server errors (500+)
    const handleServerError = (event: Event) => {
      const customEvent = event as CustomEvent
      if (isDevelopment) {
        console.log('Caught server error event:', customEvent.detail)
      }
      setServerError(customEvent.detail)
    }

    // Listen for global error dialog events (all error codes)
    const handleGlobalErrorDialog = (event: Event) => {
      const customEvent = event as CustomEvent
      if (!isDevelopment) {
        setErrorDialog({
          open: true,
          title: customEvent.detail.title || 'Erreur',
          message: customEvent.detail.message || 'Une erreur est survenue. Veuillez réessayer plus tard.'
        })
      }
    }

    window.addEventListener('server-error', handleServerError)
    window.addEventListener('global-error-dialog', handleGlobalErrorDialog)
    return () => {
      window.removeEventListener('server-error', handleServerError)
      window.removeEventListener('global-error-dialog', handleGlobalErrorDialog)
    }
  }, [])

  // Show error page if we caught a 500 error
  if (serverError) {
    if (!isDevelopment) {
      return (
        <ProductionErrorPage 
          onGoHome={() => (window.location.href = '/')}
          onRetry={() => setServerError(null)}
        />
      )
    }
    return (
      <ServerErrorPage 
        error={new Error(serverError.message || 'Internal Server Error')}
        onGoHome={() => (window.location.href = '/')}
        onGoBack={() => window.history.back()}
        onRetry={() => setServerError(null)}
      />
    )
  }

  return (
    <LoadingProvider>
      <RouterProvider router={Router} />
      {/* Global error dialog for production */}
      {errorDialog && (
        <ErrorDialog
          open={errorDialog.open}
          title={errorDialog.title}
          message={errorDialog.message}
          onClose={() => setErrorDialog(null)}
        />
      )}
    </LoadingProvider>
  )
}

const App = () => {
  return (
    <Provider store={store}>
        <Toaster position="bottom-right" />
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
    </Provider>
  )
}

export default App