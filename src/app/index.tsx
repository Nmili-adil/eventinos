import { Router } from "@/router/router"
import { RouterProvider } from "react-router-dom"
import { Toaster } from 'sonner'
import {  Provider } from 'react-redux'
import store from "@/store/app/store"
import { LoadingProvider } from "@/contexts/LoadingContext"


const App = () => {
  return (
    <Provider store={store}>
        <Toaster position="bottom-right" />
        <LoadingProvider>
        <RouterProvider router={Router} />
        </LoadingProvider>
    </Provider>
  )
}

export default App