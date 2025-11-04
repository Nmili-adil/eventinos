import {
  FORGOT_PASSWORD_REQUEST,
  FORGOT_PASSWORD_SUCCESS,
  FORGOT_PASSWORD_FAILURE,
  VERIFY_OTP_REQUEST,
  VERIFY_OTP_SUCCESS,
  VERIFY_OTP_FAILURE,
  RESET_PASSWORD_REQUEST,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_FAILURE,
  SET_FORGOT_PASSWORD_STEP,
  CLEAR_FORGOT_PASSWORD_ERROR,
  RESET_FORGOT_PASSWORD_STATE,
  type ForgotPasswordState,
  type ForgotPasswordActionTypes,
} from "./forgotpassword.type"

const initialState: ForgotPasswordState = {
  step: "email",
  email: "",
  isLoading: false,
  error: null,
  message: null,
}

const forgotPasswordReducer = (
  state = initialState,
  action: ForgotPasswordActionTypes
): ForgotPasswordState => {
  switch (action.type) {
    case FORGOT_PASSWORD_REQUEST:
    case VERIFY_OTP_REQUEST:
    case RESET_PASSWORD_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
        message: null,
      }

    case FORGOT_PASSWORD_SUCCESS:
      return {
        ...state,
        isLoading: false,
        email: action.payload.email,
        message: action.payload.message,
        step: "otp",
      }

    case VERIFY_OTP_SUCCESS:
      return {
        ...state,
        isLoading: false,
        message: action.payload.message,
        step: "new-password",
      }

    case RESET_PASSWORD_SUCCESS:
      return {
        ...state,
        isLoading: false,
        message: action.payload.message,
        step: "complete",
      }

    case FORGOT_PASSWORD_FAILURE:
    case VERIFY_OTP_FAILURE:
    case RESET_PASSWORD_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      }

    case SET_FORGOT_PASSWORD_STEP:
      return {
        ...state,
        step: action.payload,
      }

    case CLEAR_FORGOT_PASSWORD_ERROR:
      return {
        ...state,
        error: null,
      }

    case RESET_FORGOT_PASSWORD_STATE:
      return initialState

    default:
      return state
  }
}

export default forgotPasswordReducer
