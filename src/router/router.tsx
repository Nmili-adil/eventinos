import Layout from '@/app/_layout'
import { DASHBOARD_OVERVIEW, EVENT_ADD_PAGE, EVENT_DETAILS_PAGE, EVENT_EDIT_PAGE, EVENT_LISTE_PAGE, FORGOTPASSWORD_PAGE,LOGIN_PAGE, MEMBERS_PAGE, PROFILE_PAGE, SETTINGS_PAGE, CONTACTS_PAGE, COMPTES_PAGE  } from '@/constants/routerConstants'
import EventAddPage from '@/pages/eventAdd-page'
import EventDetailsPage from '@/pages/eventDetailsPage'
import EventEditPage from '@/pages/eventEdit-page'
import EventsPageList from '@/pages/eventsPage-list'
import ForgotPasswordPage from '@/pages/forgetPasswordPage'
import LoginPage from '@/pages/loginPage'
import  { MembersPage } from '@/pages/memberPage'
import Overviewpage from '@/pages/overviewpage'
import NotFoundPage from '@/pages/NotFoundPage'
import ProtectedRoute from '@/services/protectedRoute'
import { createBrowserRouter } from 'react-router-dom'
import SettingsPage from '@/pages/settingsPage'
import ProfilePage from '@/pages/profilePage'
import ContactsPage from '@/pages/contactsPage'
import ComptesPage from '@/pages/comptesPage'


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
                path: EVENT_ADD_PAGE,
                element: <EventAddPage />
            },
            {
                path: EVENT_EDIT_PAGE(':eventId'),
                element: <EventEditPage />  
            },
            {
                path: EVENT_DETAILS_PAGE(':eventId'),
                element: <EventDetailsPage />  
            },
            {
                path:MEMBERS_PAGE,
                element: <MembersPage />
            },
            {
                path: SETTINGS_PAGE,
                element: <SettingsPage />
            },
            {
                path: PROFILE_PAGE(':userId'),
                element: <ProfilePage />
            },
            {
                path: CONTACTS_PAGE,
                element: <ContactsPage />
            },
            {
                path: COMPTES_PAGE,
                element: <ComptesPage />
            },
            {
                path: '*',
                element: <NotFoundPage />
            }
        ]
    },
    {
        path: '*',
        element: <NotFoundPage />
    }
])