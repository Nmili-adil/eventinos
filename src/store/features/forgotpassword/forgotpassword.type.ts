// Action Types
export const FORGOT_PASSWORD_REQUEST = 'FORGOT_PASSWORD_REQUEST'
export const FORGOT_PASSWORD_SUCCESS = 'FORGOT_PASSWORD_SUCCESS'
export const FORGOT_PASSWORD_FAILURE = 'FORGOT_PASSWORD_FAILURE'

export const VERIFY_OTP_REQUEST = 'VERIFY_OTP_REQUEST'
export const VERIFY_OTP_SUCCESS = 'VERIFY_OTP_SUCCESS'
export const VERIFY_OTP_FAILURE = 'VERIFY_OTP_FAILURE'

export const RESET_PASSWORD_REQUEST = 'RESET_PASSWORD_REQUEST'
export const RESET_PASSWORD_SUCCESS = 'RESET_PASSWORD_SUCCESS'
export const RESET_PASSWORD_FAILURE = 'RESET_PASSWORD_FAILURE'

export const SET_FORGOT_PASSWORD_STEP = 'SET_FORGOT_PASSWORD_STEP'
export const CLEAR_FORGOT_PASSWORD_ERROR = 'CLEAR_FORGOT_PASSWORD_ERROR'
export const RESET_FORGOT_PASSWORD_STATE = 'RESET_FORGOT_PASSWORD_STATE'

// State Interface
export interface ForgotPasswordState {
  step: 'email' | 'otp' | 'new-password' | 'complete'
  email: string
  verificationCode: string | null
  isLoading: boolean
  error: string | null
  message: string | null
}

// Action Interfaces
export interface ForgotPasswordRequestAction {
  type: typeof FORGOT_PASSWORD_REQUEST
}

export interface ForgotPasswordSuccessAction {
  type: typeof FORGOT_PASSWORD_SUCCESS
  payload: {
    email: string
    message: string
  }
}

export interface ForgotPasswordFailureAction {
  type: typeof FORGOT_PASSWORD_FAILURE
  payload: string
}

export interface VerifyOtpRequestAction {
  type: typeof VERIFY_OTP_REQUEST
}

export interface VerifyOtpSuccessAction {
  type: typeof VERIFY_OTP_SUCCESS
  payload: {
    message: string
    verificationCode: string
  }
}

export interface VerifyOtpFailureAction {
  type: typeof VERIFY_OTP_FAILURE
  payload: string
}

export interface ResetPasswordRequestAction {
  type: typeof RESET_PASSWORD_REQUEST
}

export interface ResetPasswordSuccessAction {
  type: typeof RESET_PASSWORD_SUCCESS
  payload: {
    message: string
  }
}

export interface ResetPasswordFailureAction {
  type: typeof RESET_PASSWORD_FAILURE
  payload: string
}

export interface SetForgotPasswordStepAction {
  type: typeof SET_FORGOT_PASSWORD_STEP
  payload: ForgotPasswordState['step']
}

export interface ClearForgotPasswordErrorAction {
  type: typeof CLEAR_FORGOT_PASSWORD_ERROR
}

export interface ResetForgotPasswordStateAction {
  type: typeof RESET_FORGOT_PASSWORD_STATE
}

// Union Action Type
export type ForgotPasswordActionTypes =
  | ForgotPasswordRequestAction
  | ForgotPasswordSuccessAction
  | ForgotPasswordFailureAction
  | VerifyOtpRequestAction
  | VerifyOtpSuccessAction
  | VerifyOtpFailureAction
  | ResetPasswordRequestAction
  | ResetPasswordSuccessAction
  | ResetPasswordFailureAction
  | SetForgotPasswordStepAction
  | ClearForgotPasswordErrorAction
  | ResetForgotPasswordStateAction
