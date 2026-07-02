import Layout from '@/app/_layout'
import { DASHBOARD_OVERVIEW, EVENT_ADD_PAGE, EVENT_DETAILS_PAGE, EVENT_EDIT_PAGE, EVENT_LISTE_PAGE, FORGOTPASSWORD_PAGE, LANDING_PAGE, LOGIN_PAGE, MEMBERS_PAGE, PROFILE_PAGE, SETTINGS_PAGE, CONTACTS_PAGE, COMPTES_PAGE, PRIVACY_PAGE, DELETE_ACCOUNT_PAGE, SPONSOR_CATEGORIES_PAGE  } from '@/constants/routerConstants'
import LandingPage from '@/pages/landingPage'
import EventAddPage from '@/pages/eventAdd-page'
import EventDetailsPage from '@/pages/eventDetailsPage'
import EventEditPage from '@/pages/eventEdit-page'
import EventsPageList from '@/pages/eventsPage-list'
import ForgotPasswordPage from '@/pages/forgetPasswordPage'
import LoginPage from '@/pages/loginPage'
import PrivacyPage from '@/pages/privacyPage'
import  { MembersPage } from '@/pages/memberPage'
import SponsorCategoriesPage from '@/pages/sponsorCategoriesPage'
import Overviewpage from '@/pages/overviewpage'
import NotFoundPage from '@/pages/NotFoundPage'
import ProtectedRoute from '@/services/protectedRoute'
import RoleProtectedRoute from '@/services/roleProtectedRoute'
import { createBrowserRouter } from 'react-router-dom'
import SettingsPage from '@/pages/settingsPage'
import ProfilePage from '@/pages/profilePage'
import ContactsPage from '@/pages/contactsPage'
import ComptesPage from '@/pages/comptesPage'
import { RouteErrorElement } from '@/components/shared/ErrorBoundary'
import DeleteAccount from '@/pages/deleteAccount'


export const Router = createBrowserRouter([
    {
        path: LANDING_PAGE,
        element: <LandingPage />,
        errorElement: <RouteErrorElement />
    },
    {
        path: LOGIN_PAGE,
        element: <LoginPage />,
        errorElement: <RouteErrorElement />
    },
    {
        path:FORGOTPASSWORD_PAGE,
        element: <ForgotPasswordPage />,
        errorElement: <RouteErrorElement />
    },
    {
        path: PRIVACY_PAGE,
        element: <PrivacyPage />,
        errorElement: <RouteErrorElement />
    },
    {
        path: DELETE_ACCOUNT_PAGE,
        element: <DeleteAccount />,
        errorElement: <RouteErrorElement />
    },
    {
        element:
        (
            <ProtectedRoute>
                <Layout />
            </ProtectedRoute>
         ),
        errorElement: <RouteErrorElement />,
         
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
                element: (
                    <RoleProtectedRoute allowedRoles={['admin', 'organizer']}>
                        <MembersPage />
                    </RoleProtectedRoute>
                )
            },
            {
                path: SPONSOR_CATEGORIES_PAGE,
                element: (
                    <RoleProtectedRoute allowedRoles={['admin', 'organizer']}>
                        <SponsorCategoriesPage />
                    </RoleProtectedRoute>
                )
            },
            {
                path: SETTINGS_PAGE,
                element: (
                    <RoleProtectedRoute allowedRoles={['admin']}>
                        <SettingsPage />
                    </RoleProtectedRoute>
                )
            },
            {
                path: PROFILE_PAGE(':userId'),
                element: (
                    <RoleProtectedRoute allowedRoles={['admin', 'organizer']}>
                        <ProfilePage />
                    </RoleProtectedRoute>
                )
            },
            {
                path: CONTACTS_PAGE,
                element: <ContactsPage />
            },
            {
                path: COMPTES_PAGE,
                element: (
                    <RoleProtectedRoute allowedRoles={['admin']}>
                        <ComptesPage />
                    </RoleProtectedRoute>
                )
            },
            {
                path: '*',
                element: <NotFoundPage />
            }
        ]
    },
    {
        path: '*',
        element: <NotFoundPage />,
        errorElement: <RouteErrorElement />
    }
])