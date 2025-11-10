export interface EventState {
  events: any[]
  event: any | null
  count: number
  isLoading: boolean
  isUpdating: boolean
  isCreating: boolean
  isDeleted: boolean
  error: string | null
}

export const FETCH_EVENTS_REQUEST = 'FETCH_EVENTS_REQUEST'
export const FETCH_EVENTS_SUCCESS = 'FETCH_EVENTS_SUCCESS'
export const FETCH_EVENTS_FAILURE = 'FETCH_EVENTS_FAILURE'

export const FETCH_EVENT_BY_ID_REQUEST = 'FETCH_EVENT_BY_ID_REQUEST'
export const FETCH_EVENT_BY_ID_SUCCESS = 'FETCH_EVENT_BY_ID_SUCCESS'
export const FETCH_EVENT_BY_ID_FAILURE = 'FETCH_EVENT_BY_ID_FAILURE'

export const UPDATE_EVENT_REQUEST = 'UPDATE_EVENT_REQUEST'
export const UPDATE_EVENT_SUCCESS = 'UPDATE_EVENT_SUCCESS'
export const UPDATE_EVENT_FAILURE = 'UPDATE_EVENT_FAILURE'

export const CREATE_EVENT_REQUEST = 'CREATE_EVENT_REQUEST'
export const CREATE_EVENT_SUCCESS = 'CREATE_EVENT_SUCCESS'
export const CREATE_EVENT_FAILURE = 'CREATE_EVENT_FAILURE'

export const DELETE_EVENT_REQUEST = 'DELETE_EVENT_REQUEST'
export const DELETE_EVENT_SUCCESS = 'DELETE_EVENT_SUCCESS'
export const DELETE_EVENT_FAILURE = 'DELETE_EVENT_FAILURE'


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

export interface FetchEventByIdAction {
  type: typeof FETCH_EVENT_BY_ID_REQUEST
  payload: string
}

export interface FetchEventByIdSuccessAction {
  type: typeof FETCH_EVENT_BY_ID_SUCCESS
  payload: any
}

export interface FetchEventByIdFailureAction {
  type: typeof FETCH_EVENT_BY_ID_FAILURE
  payload: string
}

export interface UpdateEventRequestAction {
  type: typeof UPDATE_EVENT_REQUEST
  payload: any
  eventId: string
}

export interface UpdateEventSuccessAction {
  type: typeof UPDATE_EVENT_SUCCESS
  payload: any
}

export interface UpdateEventFailureAction {
  type: typeof UPDATE_EVENT_FAILURE
  payload: string
}

export interface CreateEventRequestAction {
  type: typeof CREATE_EVENT_REQUEST
  payload: any
}

export interface CreateEventSuccessAction {
  type: typeof CREATE_EVENT_SUCCESS
  payload: any
}

export interface CreateEventFailureAction {
  type: typeof CREATE_EVENT_FAILURE
  payload: string
}

export interface DeleteEventRequestAction {
  type: typeof DELETE_EVENT_REQUEST
  payload: string
}

export interface DeleteEventSuccessAction {
  type: typeof DELETE_EVENT_SUCCESS
}

export interface DeleteEventFailureAction {
  type: typeof DELETE_EVENT_FAILURE
  payload: string
}

export type EventActionTypes =
  | FetchEventsRequestAction
  | FetchEventsSuccessAction
  | FetchEventsFailureAction
  | FetchEventByIdAction
  | FetchEventByIdSuccessAction
  | FetchEventByIdFailureAction
  | UpdateEventRequestAction
  | UpdateEventSuccessAction
  | UpdateEventFailureAction
  | CreateEventRequestAction
  | CreateEventSuccessAction
  | CreateEventFailureAction
  | DeleteEventRequestAction
  | DeleteEventSuccessAction
  | DeleteEventFailureAction