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
import { clearAuthData, setAuthToken, setUserData } from "@/services/localStorage";

export const authLoginRequest = (payload: LoginPayload) => {
  return async (dispatch: any) => {
    dispatch({ type: AUTH_LOGIN_REQUEST });
    try {
      const response = await loginApi(payload)
      if(response.status ===200) {
        setAuthToken(response.data.token)
        setUserData(response.data.user)
        dispatch(authLoginSuccess(response.data.user, response.data.token, response.data.message))
      } else {
        dispatch(authLoginFailure(response.data.message))
      }
    } catch (error: any) {
      dispatch(authLoginFailure(error.response?.data?.message || error.message || 'Login failed'))
    }
  };
};

export const authLoginSuccess = (
  user: object,
  token: string,
  message: string
): LoginSuccessAction => ({
  type: AUTH_LOGIN_SUCCESS,
  payload: { user, token, message },
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
  user: object,
  token: string
): SetCredentialsAction => ({
  type: AUTH_SET_CREDENTIALS,
  payload: { user, token },
});


