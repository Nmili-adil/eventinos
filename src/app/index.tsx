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

// Check environment - use VITE_APP_ENV from .env file, fallback to MODE
const isDevelopment = (import.meta.env.VITE_APP_ENV || import.meta.env.MODE) === 'development'

const AppContent = () => {
  const [serverError, setServerError] = useState<{ status: number; message: string; error: any } | null>(null)

  useEffect(() => {
    // Listen for server errors from API interceptor
    const handleServerError = (event: Event) => {
      const customEvent = event as CustomEvent
      // Only log in development
      if (isDevelopment) {
        console.log('Caught server error event:', customEvent.detail)
      }
      setServerError(customEvent.detail)
    }

    window.addEventListener('server-error', handleServerError)
    
    return () => {
      window.removeEventListener('server-error', handleServerError)
    }
  }, [])

  // Show error page if we caught a 500 error
  if (serverError) {
    // In production, show simple error page with no details
    if (!isDevelopment) {
      return (
        <ProductionErrorPage 
          onGoHome={() => (window.location.href = '/')}
          onRetry={() => setServerError(null)}
        />
      )
    }

    // In development, show detailed error page
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