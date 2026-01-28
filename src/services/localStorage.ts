export const storageKeys = {
  TOKEN: 'auth-token',
  TOKEN_EXPIRY: 'auth-token-expiry',
  USER: 'auth-user',
  ROLE: 'auth-role'
}

// Token expiration time: 24 hours in milliseconds
const TOKEN_EXPIRATION_MS = 24 * 60 * 60 * 1000
export type LayoutType = 'grid' | 'list';
export type EventLayout = 'table' | 'calender' | 'maps';


export interface LayoutPreferences {
  // Global preferences
  globalLayout: LayoutType;
  
  
  // Page-specific preferences
  membersLayout: LayoutType;
  accountsLayout: LayoutType;
  eventsLayout: EventLayout;
  contactsLayout: LayoutType;
  // Additional preferences
  sidebarCollapsed: boolean;
  denseMode: boolean;
}

const DEFAULT_PREFERENCES: LayoutPreferences = {
  globalLayout: 'grid',
  membersLayout: 'grid',  
  accountsLayout: 'grid',
  eventsLayout: 'table',
  contactsLayout: 'grid',
  sidebarCollapsed: false,
  denseMode: false,
};

const STORAGE_KEY = 'layout-preferences';

export const setLayoutPreferences = (preferences: LayoutPreferences | null) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences !== null ? preferences : DEFAULT_PREFERENCES));
};

export const getLayoutPreferences = (): LayoutPreferences => {
  const preferences = localStorage.getItem(STORAGE_KEY);
  return preferences ? JSON.parse(preferences) : DEFAULT_PREFERENCES;
};

export const clearLayoutPreferences = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const setAuthToken = (token: string) => {
  const expiryTime = Date.now() + TOKEN_EXPIRATION_MS
  localStorage.setItem(storageKeys.TOKEN, token)
  localStorage.setItem(storageKeys.TOKEN_EXPIRY, expiryTime.toString())
}

export const getAuthToken = (): string | null => {
  const token = localStorage.getItem(storageKeys.TOKEN)
  const expiry = localStorage.getItem(storageKeys.TOKEN_EXPIRY)
  
  if (!token || !expiry) {
    return null
  }
  
  // Check if token has expired
  if (Date.now() > parseInt(expiry, 10)) {
    // Token expired, clear auth data
    clearAuthData()
    return null
  }
  
  return token
}

export const isTokenExpired = (): boolean => {
  const expiry = localStorage.getItem(storageKeys.TOKEN_EXPIRY)
  if (!expiry) return true
  return Date.now() > parseInt(expiry, 10)
}

export const getTokenExpiryTime = (): Date | null => {
  const expiry = localStorage.getItem(storageKeys.TOKEN_EXPIRY)
  if (!expiry) return null
  return new Date(parseInt(expiry, 10))
}

export const setUserData = (user: object) => {
  localStorage.setItem(storageKeys.USER, JSON.stringify(user))
}

export const getUserData = () => {
  const user = localStorage.getItem(storageKeys.USER)
  return user ? JSON.parse(user) : null
}

export const clearAuthData = () => {
  localStorage.removeItem(storageKeys.TOKEN)
  localStorage.removeItem(storageKeys.TOKEN_EXPIRY)
  localStorage.removeItem(storageKeys.USER)
  localStorage.removeItem(storageKeys.ROLE)
}

export const setRole = (role: string) => {
  localStorage.setItem(storageKeys.ROLE, role)
}

export const getRole = (): string | null => {
  return localStorage.getItem(storageKeys.ROLE)
}

export const clearRole = () => {
  localStorage.removeItem(storageKeys.ROLE)
}

export const setLayout = ({layout, theme}: {layout: string, theme: string}) => {  
  localStorage.setItem('layout', JSON.stringify({layout}))
}

export const getLayout = (): {layout: string, theme: string} => {
  const layoutData = localStorage.getItem('layout')
  return {
    layout: layoutData ? JSON.parse(layoutData).layout : 'vertical',
    theme: layoutData ? JSON.parse(layoutData).theme : 'light'
  }
}