// store/reducers/authReducer.ts

import { getAuthToken, getUserData, getRole } from "@/services/localStorage"
import { AUTH_CLEAR_ERROR, AUTH_LOGIN_FAILURE, AUTH_LOGIN_REQUEST, AUTH_LOGIN_SUCCESS, AUTH_LOGOUT, AUTH_SET_CREDENTIALS, type AuthActionTypes, type AuthState } from "./auth.type"




const initialState: AuthState = {
  user: getUserData() ,
  token: getAuthToken(),
  role: getRole(),
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
        role: action.payload.role,
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
        token: null,
        role: null
      }

    case AUTH_LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        role: null,
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
        role: action.payload.role,
        isAuthenticated: true
      }

    default:
      return state
  }
}

export default authReducer