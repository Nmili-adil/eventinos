import type { User } from "@/types/usersType"

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface UserState {
  users: User[]
  user: User | null
  usersCount: number
  isLoading: boolean
  error: string | null
  pagination: PaginationInfo | null
}

export const FETCH_USERS_REQUEST = 'FETCH_USERS_REQUEST'
export const FETCH_USERS_SUCCESS = 'FETCH_USERS_SUCCESS'
export const FETCH_USERS_FAILURE = 'FETCH_USERS_FAILURE'

export interface FetchUsersRequestAction {
  type: typeof FETCH_USERS_REQUEST
}

export interface FetchUsersSuccessAction {
  type: typeof FETCH_USERS_SUCCESS
  count: number
  payload: User[]
  pagination: PaginationInfo | null
}

export const FETCH_USER_BY_ID_REQUEST = 'FETCH_USER_BY_ID_REQUEST'
export const FETCH_USER_BY_ID_SUCCESS = 'FETCH_USER_BY_ID_SUCCESS'
export const FETCH_USER_BY_ID_FAILURE = 'FETCH_USER_BY_ID_FAILURE'

export interface FetchUserByIdRequestAction {
  type: typeof FETCH_USER_BY_ID_REQUEST
}

export interface FetchUserByIdSuccessAction {
  type: typeof FETCH_USER_BY_ID_SUCCESS
  payload: User
}

export interface FetchUserByIdFailureAction {
  type: typeof FETCH_USER_BY_ID_FAILURE
  payload: string
}

export interface FetchUsersFailureAction {
  type: typeof FETCH_USERS_FAILURE
  payload: string
}

export type UserActionTypes =
  | FetchUsersRequestAction
  | FetchUsersSuccessAction
  | FetchUsersFailureAction
  | FetchUserByIdRequestAction
  | FetchUserByIdSuccessAction
  | FetchUserByIdFailureAction