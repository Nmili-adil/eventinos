import { Router } from "@/router/router"
import { RouterProvider } from "react-router-dom"
import { Toaster } from 'sonner'
import {  Provider } from 'react-redux'
import store from "@/store/app/store"
import { LoadingProvider } from "@/contexts/LoadingContext"
import { ErrorBoundary } from "@/components/shared/ErrorBoundary"
import { useEffect, useState } from 'react'
import ServerErrorPage from '@/pages/ServerErrorPage'


const AppContent = () => {
  const [serverError, setServerError] = useState<{ status: number; message: string; error: any } | null>(null)

  useEffect(() => {
    // Listen for server errors from API interceptor
    const handleServerError = (event: Event) => {
      const customEvent = event as CustomEvent
      console.log('🎯 Caught server error event:', customEvent.detail)
      setServerError(customEvent.detail)
    }

    window.addEventListener('server-error', handleServerError)
    
    return () => {
      window.removeEventListener('server-error', handleServerError)
    }
  }, [])

  // Show server error page if we caught a 500 error
  if (serverError) {
    return (
      <ServerErrorPage 
        error={new Error(serverError.message)}
        resetError={() => setServerError(null)}
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