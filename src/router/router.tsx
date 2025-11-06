import Layout from '@/app/_layout'
import { DASHBOARD_OVERVIEW, EVENT_EDIT_PAGE, EVENT_LISTE_PAGE, FORGOTPASSWORD_PAGE,LOGIN_PAGE, MEMBER_PAGE  } from '@/constants/routerConstants'
import EventEditPage from '@/pages/eventEdit-page'
import EventsPageList from '@/pages/eventsPage-list'
import ForgotPasswordPage from '@/pages/forgetPasswordPage'
import LoginPage from '@/pages/loginPage'
import MemberPage from '@/pages/memberPage'
import Overviewpage from '@/pages/overviewpage'
import ProtectedRoute from '@/services/protectedRoute'
import { createBrowserRouter } from 'react-router-dom'


export const Router = createBrowserRouter([
    {
        path: LOGIN_PAGE,
        element: <LoginPage />
    },
    {
        path:FORGOTPASSWORD_PAGE,
        element: <ForgotPasswordPage />
    },
    {
        element:
        (
            <ProtectedRoute>
                <Layout />
            </ProtectedRoute>
         ),
        children: [
            {
                path:DASHBOARD_OVERVIEW,
                element: <Overviewpage />
            },
            {
                path:EVENT_LISTE_PAGE,
                element: <EventsPageList />
            },
            {
                path: EVENT_EDIT_PAGE(':eventId'),
                element: <EventEditPage />  
            },
            {
                path:MEMBER_PAGE,
                element: <MemberPage />
            }
        ]
    }
])