import { Router } from "@/router/router"
import { RouterProvider } from "react-router-dom"
import { Toaster } from 'sonner'
import {  Provider } from 'react-redux'
import store from "@/store/app/store"


const App = () => {
  return (
    <Provider store={store}>
    <Toaster position="bottom-right" />
    <RouterProvider router={Router} />
    </Provider>
  )
}

export default App