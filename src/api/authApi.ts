import { api } from "@/lib/apiClient"
import type { ForgotPasswordRequest, LoginRequest, verifiedOtpRequest } from "@/types/auth"


export const loginApi = async (payload: LoginRequest) => {
    return api.post('/auth/sign-in', payload )
}

export const forgotPassword = async (payload: ForgotPasswordRequest) => {
    return api.post('/auth/forgot-password', payload )
}

export const verifyResetOtp = async (payload: verifiedOtpRequest) => {
    return api.post('/auth/verification', payload)
}

export const resetPasswordApi = async (email: string, verificationCode: string, newPassword: string) => {
    return api.post('/auth/reset-password', { email, code: verificationCode, password: newPassword })
}