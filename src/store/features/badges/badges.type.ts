export interface BadgeState {
  badges: any[]
  badge: any | null
  count: number
  isLoading: boolean
  isUpdating: boolean
  isCreating: boolean
  isDeleted: boolean
  error: string | null
}


export const FETCH_BADGES_REQUEST = 'FETCH_BADGES_REQUEST'
export const FETCH_BADGES_SUCCESS = 'FETCH_BADGES_SUCCESS'
export const FETCH_BADGES_FAILURE = 'FETCH_BADGES_FAILURE'

export const FETCH_BADGE_BY_ID_REQUEST = 'FETCH_BADGE_BY_ID_REQUEST'
export const FETCH_BADGE_BY_ID_SUCCESS = 'FETCH_BADGE_BY_ID_SUCCESS'
export const FETCH_BADGE_BY_ID_FAILURE = 'FETCH_BADGE_BY_ID_FAILURE'

export const UPDATE_BADGE_REQUEST = 'UPDATE_BADGE_REQUEST'
export const UPDATE_BADGE_SUCCESS = 'UPDATE_BADGE_SUCCESS'
export const UPDATE_BADGE_FAILURE = 'UPDATE_BADGE_FAILURE'

export const CREATE_BADGE_REQUEST = 'CREATE_BADGE_REQUEST'
export const CREATE_BADGE_SUCCESS = 'CREATE_BADGE_SUCCESS'
export const CREATE_BADGE_FAILURE = 'CREATE_BADGE_FAILURE'

export const DELETE_BADGE_REQUEST = 'DELETE_BADGE_REQUEST'
export const DELETE_BADGE_SUCCESS = 'DELETE_BADGE_SUCCESS'
export const DELETE_BADGE_FAILURE = 'DELETE_BADGE_FAILURE'


export interface FetchBadgesRequestAction {
  type: typeof FETCH_BADGES_REQUEST
  payload: any
} 

export interface FetchBadgesSuccessAction {
    type: typeof FETCH_BADGES_SUCCESS
    payload: any
}

export interface FetchBadgesFailureAction {
    type: typeof FETCH_BADGES_FAILURE
    payload: string
}

export interface FetchBadgeByIdRequestAction {
    type: typeof FETCH_BADGE_BY_ID_REQUEST
    payload: string
}

export interface FetchBadgeByIdSuccessAction {
    type: typeof FETCH_BADGE_BY_ID_SUCCESS
    payload: any
}

export interface FetchBadgeByIdFailureAction {
    type: typeof FETCH_BADGE_BY_ID_FAILURE
    payload: string
}

export interface UpdateBadgeRequestAction {
    type: typeof UPDATE_BADGE_REQUEST
    payload: any
}

export interface UpdateBadgeSuccessAction {
    type: typeof UPDATE_BADGE_SUCCESS
    payload: any
}

export interface UpdateBadgeFailureAction {
    type: typeof UPDATE_BADGE_FAILURE
    payload: string
}

export interface CreateBadgeRequestAction {
    type: typeof CREATE_BADGE_REQUEST
    payload: any
}

export interface CreateBadgeSuccessAction {
    type: typeof CREATE_BADGE_SUCCESS
    payload: any
}

export interface CreateBadgeFailureAction {
    type: typeof CREATE_BADGE_FAILURE
    payload: string
}

export interface DeleteBadgeRequestAction {
    type: typeof DELETE_BADGE_REQUEST
    payload: string
}

export interface DeleteBadgeSuccessAction {
    type: typeof DELETE_BADGE_SUCCESS
    payload: any
}

export interface DeleteBadgeFailureAction {
    type: typeof DELETE_BADGE_FAILURE
    payload: string
}


export type BadgeActionTypes =
    | FetchBadgesRequestAction
    | FetchBadgesSuccessAction
    | FetchBadgesFailureAction
    | FetchBadgeByIdRequestAction
    | FetchBadgeByIdSuccessAction
    | FetchBadgeByIdFailureAction
    | UpdateBadgeRequestAction
    | UpdateBadgeSuccessAction
    | UpdateBadgeFailureAction
    | CreateBadgeRequestAction
    | CreateBadgeSuccessAction
    | CreateBadgeFailureAction
    | DeleteBadgeRequestAction
    | DeleteBadgeSuccessAction
    | DeleteBadgeFailureAction