import { fetchEventByIdApi, fetchEvents, updateEventApi } from "@/api/eventsApi";
import { FETCH_EVENT_BY_ID_REQUEST, FETCH_EVENT_BY_ID_FAILURE, FETCH_EVENT_BY_ID_SUCCESS, FETCH_EVENTS_FAILURE, FETCH_EVENTS_REQUEST, FETCH_EVENTS_SUCCESS, type FetchEventByIdFailureAction, type FetchEventByIdSuccessAction, type FetchEventsFailureAction, type FetchEventsRequestAction, type FetchEventsSuccessAction, UPDATE_EVENT_REQUEST, type UpdateEventSuccessAction, type UpdateEventFailureAction, UPDATE_EVENT_SUCCESS, UPDATE_EVENT_FAILURE } from "./events.type"

export const fetchEventsRequest = (): FetchEventsRequestAction => {
    return async (dispatch: any) => {
      dispatch({ type: FETCH_EVENTS_REQUEST })
      try {
        const response = await fetchEvents()
        if(response.status ===200) {
          dispatch(fetchEventsSuccess(response.data.data, response.data.count))
        } else {
          dispatch(fetchEventsFailure(response.data.message))
        }
      } catch (error: any) {
        dispatch(fetchEventsFailure(error.response?.data?.message || error.message || 'Fetch events failed'))
      }
    };
    
}
export const fetchEventsSuccess = (events: any[], count: number): FetchEventsSuccessAction => ({
  type: FETCH_EVENTS_SUCCESS,
  count: count,
  payload: events,
})

export const fetchEventsFailure = (error: string): FetchEventsFailureAction => ({
  type: FETCH_EVENTS_FAILURE,
  payload: error,
})


export const fetchEventByIdRequest = (eventId: string) => {
  return async (dispatch: any) => {
    dispatch({ type: FETCH_EVENT_BY_ID_REQUEST, payload: eventId })
    try {
      const response = await fetchEventByIdApi(eventId)
      // if(response.status ===200) {
        dispatch(fetchEventByIdSuccess(response))
      // } else {
      //   dispatch(fetchEventByIdFailure(response.message))
      // }
    } catch (error: any) {

      dispatch(fetchEventByIdFailure(error.response?.data?.message || error.message || 'Fetch event failed'))
    }
  };
}

export const fetchEventByIdSuccess = (event: any): FetchEventByIdSuccessAction => ({
  type: FETCH_EVENT_BY_ID_SUCCESS,
  payload: event,
})

export const fetchEventByIdFailure = (error: string): FetchEventByIdFailureAction => ({
  type: FETCH_EVENT_BY_ID_FAILURE,
  payload: error,
})

export const updateEventRequest = (event: any) => {
  return async (dispatch: any) => {
    dispatch({ type: UPDATE_EVENT_REQUEST, payload: event })
    try {
      const response = await updateEventApi(event)
      if(response.status ===200) {
        dispatch(updateEventSuccess(response.data))
      } else {
        dispatch(updateEventFailure(response.message))
      }
    } catch (error: any) {
      dispatch(updateEventFailure(error.response?.data?.message || error.message || 'Update event failed'))
    }
  };
}

export const updateEventSuccess = (event: any): UpdateEventSuccessAction => ({
  type: UPDATE_EVENT_SUCCESS,
  payload: event,
})

export const updateEventFailure = (error: string): UpdateEventFailureAction => ({
  type: UPDATE_EVENT_FAILURE,
  payload: error,
})