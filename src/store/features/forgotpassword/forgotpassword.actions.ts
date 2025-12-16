import type { Dispatch } from "redux"
import { forgotPassword, verifyResetOtp as verifyResetOtpApi, resetPasswordApi } from "@/api/authApi"
import type { ForgotPasswordRequest, verifiedOtpRequest } from "@/types/auth"
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
  type ForgotPasswordSuccessAction,
  type ForgotPasswordFailureAction,
  type VerifyOtpSuccessAction,
  type VerifyOtpFailureAction,
  type ResetPasswordSuccessAction,
  type ResetPasswordFailureAction,
  type SetForgotPasswordStepAction,
  type ClearForgotPasswordErrorAction,
  type ResetForgotPasswordStateAction,
  type ForgotPasswordState,
} from "./forgotpassword.type"

// Request Password Reset (Send OTP)
export const requestPasswordReset = (email: string) => {
  return async (dispatch: Dispatch) => {
    dispatch({ type: FORGOT_PASSWORD_REQUEST })
    try {
      const payload: ForgotPasswordRequest = { email }
      const response = await forgotPassword(payload)

      if (response.status === 200) {
        dispatch(forgotPasswordSuccess(email, response.data.message || 'OTP envoyé à votre email'))
        // Automatically move to OTP step
        dispatch(setForgotPasswordStep('otp'))
      } else {
        dispatch(forgotPasswordFailure(response.data.message || 'Échec de l\'envoi de l\'OTP'))
      }
    } catch (error: any) {
      dispatch(forgotPasswordFailure(error.response?.data?.message || error.message || 'Échec de l\'envoi de l\'OTP'))
    }
  }
}

export const forgotPasswordSuccess = (
  email: string,
  message: string
): ForgotPasswordSuccessAction => ({
  type: FORGOT_PASSWORD_SUCCESS,
  payload: { email, message },
})

export const forgotPasswordFailure = (error: string): ForgotPasswordFailureAction => ({
  type: FORGOT_PASSWORD_FAILURE,
  payload: error,
})

// Verify OTP
export const verifyOtp = (email: string, otp: string) => {
  return async (dispatch: Dispatch) => {
    dispatch({ type: VERIFY_OTP_REQUEST })
    try {
      const payload: verifiedOtpRequest = { email, verificationCode: otp }
      console.log('Verifying OTP with payload:', payload)
      const response = await verifyResetOtpApi(payload)
      console.log('OTP verification response:', response)

      if (response.status === 200) {
        dispatch(verifyOtpSuccess(response.data.message || 'OTP vérifié avec succès', otp))
        // Automatically move to new password step
        dispatch(setForgotPasswordStep('new-password'))
      } else {
        dispatch(verifyOtpFailure(response.data.message || 'OTP invalide'))
      }
    } catch (error: any) {
      console.error('OTP verification error:', error.response?.data || error)
      dispatch(verifyOtpFailure(error.response?.data?.message || error.message || 'OTP invalide'))
    }
  }
}

export const verifyOtpSuccess = (message: string, verificationCode: string): VerifyOtpSuccessAction => ({
  type: VERIFY_OTP_SUCCESS,
  payload: { message, verificationCode },
})

export const verifyOtpFailure = (error: string): VerifyOtpFailureAction => ({
  type: VERIFY_OTP_FAILURE,
  payload: error,
})

// Reset Password
export const resetPassword = (
  email: string,
  verificationCode: string | null,
  newPassword: string,
  confirmPassword: string
) => {
  return async (dispatch: Dispatch) => {
    dispatch({ type: RESET_PASSWORD_REQUEST })
    try {
      // Validation
      if (!verificationCode) {
        dispatch(resetPasswordFailure('Le code de vérification est requis'))
        return
      }

      if (!newPassword || !confirmPassword) {
        dispatch(resetPasswordFailure('Le mot de passe est requis'))
        return
      }
      
      if (newPassword.length < 8) {
        dispatch(resetPasswordFailure('Le mot de passe doit contenir au moins 8 caractères'))
        return
      }
      
      if (newPassword !== confirmPassword) {
        dispatch(resetPasswordFailure('Les mots de passe ne correspondent pas'))
        return
      }

      // Call the actual API
      const response = await resetPasswordApi(email, verificationCode, newPassword)

      if (response.status === 200) {
        dispatch(resetPasswordSuccess(response.data.message || 'Mot de passe réinitialisé avec succès'))
        // Automatically move to complete step
        dispatch(setForgotPasswordStep('complete'))
      } else {
        dispatch(resetPasswordFailure(response.data.message || 'Échec de la réinitialisation du mot de passe'))
      }
    } catch (error: any) {
      dispatch(resetPasswordFailure(error.response?.data?.message || error.message || 'Échec de la réinitialisation du mot de passe'))
    }
  }
}

export const resetPasswordSuccess = (message: string): ResetPasswordSuccessAction => ({
  type: RESET_PASSWORD_SUCCESS,
  payload: { message },
})

export const resetPasswordFailure = (error: string): ResetPasswordFailureAction => ({
  type: RESET_PASSWORD_FAILURE,
  payload: error,
})

// Set Step
export const setForgotPasswordStep = (step: ForgotPasswordState['step']): SetForgotPasswordStepAction => ({
  type: SET_FORGOT_PASSWORD_STEP,
  payload: step,
})

// Clear Error
export const clearForgotPasswordError = (): ClearForgotPasswordErrorAction => ({
  type: CLEAR_FORGOT_PASSWORD_ERROR,
})

// Reset State
export const resetForgotPasswordState = (): ResetForgotPasswordStateAction => ({
  type: RESET_FORGOT_PASSWORD_STATE,
})
