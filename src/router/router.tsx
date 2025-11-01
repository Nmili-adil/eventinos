import Layout from '@/app/_layout'
import { DASHBOARD_OVERVIEW, FORGOTPASSWORD_PAGE,LOGIN_PAGE  } from '@/constants/routerConstants'
import ForgotPasswordPage from '@/pages/forgetPasswordPage'
import LoginPage from '@/pages/loginPage'
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
            }
        ]
    }
])