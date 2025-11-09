import { Outlet } from "react-router-dom"
import Header from "./layout-components/header"
import Footer from "./layout-components/footer"
// import { useDispatch } from "react-redux"
// import type { AppDispatch } from "@/store/app/store"
// import { fetchEventsRequest } from "@/store/features/events/events.actions"
// import { fetchUsersRequest } from "@/store/features/users/users.actions"
// import { useEffect } from "react"

const Layout = () => {

  // const dispatch = useDispatch<AppDispatch>()
  
  //   useEffect(() => {
  //     const fetchEventsData = async () => {
  //       try {
  //         dispatch(fetchEventsRequest())
  //         dispatch(fetchUsersRequest())
  //       } catch (error) {
  //         console.log(error)
  //       }
  //     }
  
  //     fetchEventsData()
  //   }, [dispatch])


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-6 flex-1">
          <Outlet />
        </main>
        <Footer />
    </div>
  )
}

export default Layout