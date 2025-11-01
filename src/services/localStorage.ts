export const storageKeys = {
  TOKEN: 'token',
  USER: 'user'
}

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
}