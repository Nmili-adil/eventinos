import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, RegisterRequest } from '@/schemas/auth-schema'

// Interfaces for different data types
interface BasicInfoData {
  firstName: string
  lastName: string
  phoneNumber: string
  password: string
}

interface ProfileData {
  picture?: File
  country: string
  city: string
  gender: 'male' | 'female' | 'other'
  birthday: string
}

interface AuthState {
  // Core auth states
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Registration specific states
  registrationEmail: string | null
  registrationStep: 'email' | 'otp' | 'basic-info' | 'profile' | 'complete'
  
  // Forgot password states
  forgotPasswordEmail: string | null
  forgotPasswordStep: 'email' | 'otp' | 'new-password' | 'complete'
  resetToken: string | null

  // Auth methods
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  clearError: () => void
  
  // Registration methods
  startRegistration: (email: string) => Promise<void>
  verifyOtp: (email: string, otp: string) => Promise<void>
  completeBasicInfo: (data: BasicInfoData) => Promise<void>
  completeProfile: (data: ProfileData) => Promise<void>
  setRegistrationStep: (step: AuthState['registrationStep']) => void

  // Forgot password methods
  requestPasswordReset: (email: string) => Promise<void>
  verifyResetOtp: (email: string, otp: string) => Promise<void>
  resetPassword: (newPassword: string, confirmPassword: string) => Promise<void>
  setForgotPasswordStep: (step: AuthState['forgotPasswordStep']) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial states
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      // Registration states
      registrationEmail: null,
      registrationStep: 'email',
      
      // Forgot password states
      forgotPasswordEmail: null,
      forgotPasswordStep: 'email',
      resetToken: null,

      // ============ AUTH METHODS ============

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          // Mock login - replace with actual API call
          const response = {
            user: {
              id: '1',
              email: email,
              name: 'Adil User',
              role: 'user' as const,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            token: "mock-jwt-token"
          }
          
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
        } catch (error) {
          set({ 
            error: 'Échec de la connexion', 
            isLoading: false 
          })
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          registrationEmail: null,
          registrationStep: 'email',
          forgotPasswordEmail: null,
          forgotPasswordStep: 'email',
          resetToken: null,
          error: null
        })
      },

      clearError: () => {
        set({ error: null })
      },

      // ============ REGISTRATION METHODS ============

      startRegistration: async (email: string) => {
        set({ isLoading: true, error: null })
        try {
          // Mock API call to send OTP
          await new Promise((resolve) => setTimeout(resolve, 1000))
          
          set({
            registrationEmail: email,
            registrationStep: 'otp',
            isLoading: false,
            error: null
          })
        } catch (error) {
          set({ 
            error: 'Erreur lors de l\'envoi du code OTP', 
            isLoading: false 
          })
          throw error
        }
      },

      verifyOtp: async (email: string, otp: string) => {
        set({ isLoading: true, error: null })
        try {
          // Mock OTP verification
          if (otp !== '1234') { // Mock valid OTP
            throw new Error('Code OTP invalide')
          }
          
          await new Promise((resolve) => setTimeout(resolve, 1000))
          
          set({
            registrationStep: 'basic-info',
            isLoading: false,
            error: null
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Code OTP invalide', 
            isLoading: false 
          })
          throw error
        }
      },

      completeBasicInfo: async (data: BasicInfoData) => {
        set({ isLoading: true, error: null })
        try {
          // Mock API call
          await new Promise((resolve) => setTimeout(resolve, 1000))
          
          set({
            registrationStep: 'profile',
            isLoading: false,
            error: null
          })
        } catch (error) {
          set({ 
            error: 'Erreur lors de la sauvegarde des informations', 
            isLoading: false 
          })
          throw error
        }
      },

      completeProfile: async (data: ProfileData) => {
        set({ isLoading: true, error: null })
        try {
          const { registrationEmail } = get()
          
          // Mock final registration
          const response = await new Promise<{ user: User; token: string }>((resolve) => 
            setTimeout(() => resolve({
              user: { 
                id: '1', 
                email: registrationEmail!, 
                name: `${data.firstName} ${data.lastName}`, 
                role: 'user' as const,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              token: 'mock-jwt-token'
            }), 1000)
          )
          
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            registrationStep: 'complete',
            isLoading: false,
            error: null
          })
        } catch (error) {
          set({ 
            error: 'Erreur lors de la création du compte', 
            isLoading: false 
          })
          throw error
        }
      },

      setRegistrationStep: (step) => {
        set({ registrationStep: step })
      },

      // ============ FORGOT PASSWORD METHODS ============

      requestPasswordReset: async (email: string) => {
        set({ isLoading: true, error: null })
        try {
          // Mock API call to send reset OTP
          await new Promise((resolve) => setTimeout(resolve, 1000))
          
          set({
            forgotPasswordEmail: email,
            forgotPasswordStep: 'otp',
            isLoading: false,
            error: null
          })
        } catch (error) {
          set({ 
            error: 'Erreur lors de l\'envoi du code de réinitialisation', 
            isLoading: false 
          })
          throw error
        }
      },

      verifyResetOtp: async (email: string, otp: string) => {
        set({ isLoading: true, error: null })
        try {
          // Mock OTP verification
          if (otp !== '1234') { // Mock valid OTP
            throw new Error('Code de réinitialisation invalide')
          }
          
          await new Promise((resolve) => setTimeout(resolve, 1000))
          
          set({
            forgotPasswordStep: 'new-password',
            resetToken: 'mock-reset-token',
            isLoading: false,
            error: null
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Code de réinitialisation invalide', 
            isLoading: false 
          })
          throw error
        }
      },

      resetPassword: async (newPassword: string, confirmPassword: string) => {
        set({ isLoading: true, error: null })
        try {
          if (newPassword !== confirmPassword) {
            throw new Error('Les mots de passe ne correspondent pas')
          }

          // Mock API call to reset password
          await new Promise((resolve) => setTimeout(resolve, 1000))
          
          set({
            forgotPasswordStep: 'complete',
            isLoading: false,
            error: null
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors de la réinitialisation du mot de passe', 
            isLoading: false 
          })
          throw error
        }
      },

      setForgotPasswordStep: (step) => {
        set({ forgotPasswordStep: step })
      },
    }),
    {
      name: 'auth-storage',
      // Optional: Only persist certain states
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)