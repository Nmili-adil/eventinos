import { Router } from "@/router/router"
import { RouterProvider } from "react-router-dom"
import { Toaster } from 'sonner'
import {  Provider } from 'react-redux'
import store from "@/store/app/store"
import { LoadingProvider } from "@/contexts/LoadingContext"
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'


const AppContent = () => {
  const { i18n } = useTranslation()

  useEffect(() => {
    // Update HTML lang and dir attributes when language changes
    document.documentElement.lang = i18n.language
    if (i18n.language === 'ar') {
      document.documentElement.dir = 'rtl'
    } else {
      document.documentElement.dir = 'ltr'
    }
  }, [i18n.language])

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
        <AppContent />
    </Provider>
  )
}

export default App