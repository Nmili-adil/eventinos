// store/reducers/authReducer.ts

import { AUTH_CLEAR_ERROR, AUTH_LOGIN_FAILURE, AUTH_LOGIN_REQUEST, AUTH_LOGIN_SUCCESS, AUTH_LOGOUT, AUTH_SET_CREDENTIALS, type AuthActionTypes } from "./auth.type"


export interface AuthState {
  user: null | object
  token: string | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  message: string | null
}

const initialState: AuthState = {
  user: null ,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,
  isAuthenticated: false,
  message: null
}

const authReducer = (state = initialState, action: AuthActionTypes): AuthState => {
  switch (action.type) {
    case AUTH_LOGIN_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
        message: null
      }

    case AUTH_LOGIN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        error: null,
        message: action.payload.message
      }

    case AUTH_LOGIN_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        isAuthenticated: false,
        user: null,
        token: null
      }

    case AUTH_LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        error: null
      }

    case AUTH_CLEAR_ERROR:
      return {
        ...state,
        error: null,
      }

    case AUTH_SET_CREDENTIALS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true
      }

    default:
      return state
  }
}

export default authReducer