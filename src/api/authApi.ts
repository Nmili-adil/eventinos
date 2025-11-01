import { api } from "@/lib/apiClient"
import type { LoginRequest } from "@/types/auth"


export const loginApi = async (payload: LoginRequest) => {
    return api.post('/auth/sign-in', payload )
}