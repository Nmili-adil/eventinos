export interface UserState {
  users: any[]
  usersCount: number
  isLoading: boolean
  error: string | null
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
  payload: any[]
}

export interface FetchUsersFailureAction {
  type: typeof FETCH_USERS_FAILURE
  payload: string
}

export type UserActionTypes =
  | FetchUsersRequestAction
  | FetchUsersSuccessAction
  | FetchUsersFailureAction