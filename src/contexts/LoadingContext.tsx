import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import PageLoader from '@/components/ui/PageLoader'

interface LoadingContextType {
  isLoading: boolean
  setLoading: (loading: boolean, text?: string) => void
  loadingText: string
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('Chargement...')

  const setLoading = useCallback((loading: boolean, text?: string) => {
    setIsLoading(loading)
    if (text) {
      setLoadingText(text)
    }
  }, [])

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading, loadingText }}>
      {isLoading && <PageLoader text={loadingText} />}
      <div style={{ display: isLoading ? 'none' : 'block' }}>
        {children}
      </div>
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}
