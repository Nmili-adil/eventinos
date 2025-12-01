import { loginApi } from "@/api/authApi";
import {
  AUTH_CLEAR_ERROR,
  AUTH_LOGIN_FAILURE,
  AUTH_LOGIN_REQUEST,
  AUTH_LOGIN_SUCCESS,
  AUTH_LOGOUT,
  AUTH_SET_CREDENTIALS,
  type ClearErrorAction,
  type LoginFailureAction,
  type LoginPayload,
  type LoginSuccessAction,
  type LogoutAction,
  type SetCredentialsAction,
} from "./auth.type";
import { clearAuthData, setAuthToken, setRole, setUserData } from "@/services/localStorage";
import type { User } from "@/types/usersType";

export const authLoginRequest = (payload: LoginPayload) => {
  return async (dispatch: any) => {
    dispatch({ type: AUTH_LOGIN_REQUEST });
    try {
      const response = await loginApi(payload)
      console.log(response)
      if(response.status ===200) {
        setAuthToken(response.data.token)
        setUserData(response.data.user)
        setRole(response.data.user.role.name)
        dispatch(authLoginSuccess(response.data.user, response.data.token, response.data.message, response.data.role))
      } else {
        dispatch(authLoginFailure(response.data.message))
      }
    } catch (error: any) {
      dispatch(authLoginFailure(error.response?.data?.message || error.message || 'Login failed'))
    }
  };
};

export const authLoginSuccess = (
  user: User,
  token: string,
  message: string,
  role: string
): LoginSuccessAction => ({
  type: AUTH_LOGIN_SUCCESS,
  payload: { user, token, message, role },
});

export const authLoginFailure = (error: string): LoginFailureAction => ({
  type: AUTH_LOGIN_FAILURE,
  payload: error,
});

export const authLogout = (): LogoutAction => {
  clearAuthData()
  return {
    type: AUTH_LOGOUT,
  };
};

export const authClearError = (): ClearErrorAction => ({
  type: AUTH_CLEAR_ERROR,
});

export const authSetCredentials = (
  user: User,
  token: string,
  role: string
): SetCredentialsAction => ({
  type: AUTH_SET_CREDENTIALS,
  payload: { user, token, role },
});


