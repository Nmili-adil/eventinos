export const LOGIN_PAGE = '/'
export const FORGOTPASSWORD_PAGE = '/forgot-password'
export const  DASHBOARD_OVERVIEW = '/dashboard'
export const MEMBER_PAGE = '/dashboard/member-page'
export const EVENT_LISTE_PAGE = '/dashboard/event-page'
export const EVENT_EDIT_PAGE = (eventId: string) => `/dashboard/event-page/edit/${eventId}`
export const EVENT_DETAILS_PAGE= (eventId: string) =>  `/dashboard/event-page/${eventId}`