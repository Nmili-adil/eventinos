// store/actions/authActions.ts
export const AUTH_LOGIN_REQUEST = 'AUTH_LOGIN_REQUEST'
export const AUTH_LOGIN_SUCCESS = 'AUTH_LOGIN_SUCCESS'
export const AUTH_LOGIN_FAILURE = 'AUTH_LOGIN_FAILURE'
export const AUTH_LOGOUT = 'AUTH_LOGOUT'
export const AUTH_CLEAR_ERROR = 'AUTH_CLEAR_ERROR'
export const AUTH_SET_CREDENTIALS = 'AUTH_SET_CREDENTIALS'

export interface LoginRequestAction {
  type: typeof AUTH_LOGIN_REQUEST
}

export interface LoginPayload {
  email: string,
  password: string
}


export interface LoginSuccessAction {
  type: typeof AUTH_LOGIN_SUCCESS
  payload: {
    user: object
    token: string
    message: string
  }
}

export interface LoginFailureAction {
  type: typeof AUTH_LOGIN_FAILURE
  payload: string
}

export interface LogoutAction {
  type: typeof AUTH_LOGOUT
}

export interface ClearErrorAction {
  type: typeof AUTH_CLEAR_ERROR
}

export interface SetCredentialsAction {
  type: typeof AUTH_SET_CREDENTIALS
  payload: {
    user: object
    token: string
  }
}

export interface AuthState {
  user: null | object
  token: string | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  message: string | null
}

export type AuthActionTypes =
  | LoginRequestAction
  | LoginSuccessAction
  | LoginFailureAction
  | LogoutAction
  | ClearErrorAction
  | SetCredentialsAction