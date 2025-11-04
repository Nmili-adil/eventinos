export interface EventState {
  events: any[]
  count: number
  isLoading: boolean
  error: string | null
}

export const FETCH_EVENTS_REQUEST = 'FETCH_EVENTS_REQUEST'
export const FETCH_EVENTS_SUCCESS = 'FETCH_EVENTS_SUCCESS'
export const FETCH_EVENTS_FAILURE = 'FETCH_EVENTS_FAILURE'

export interface FetchEventsRequestAction {
  type: typeof FETCH_EVENTS_REQUEST
}

export interface FetchEventsSuccessAction {
  type: typeof FETCH_EVENTS_SUCCESS
  count: number
  payload: any[]
}

export interface FetchEventsFailureAction {
  type: typeof FETCH_EVENTS_FAILURE
  payload: string
}

export type EventActionTypes =
  | FetchEventsRequestAction
  | FetchEventsSuccessAction
  | FetchEventsFailureAction