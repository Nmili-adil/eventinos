export const storageKeys = {
  TOKEN: 'auth-token',
  USER: 'auth-user',
  ROLE: 'auth-role'
}
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
  localStorage.setItem(storageKeys.TOKEN, token)
}

export const getAuthToken = (): string | null => {
  return localStorage.getItem(storageKeys.TOKEN)
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