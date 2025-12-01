import { createEventApi, deleteEventApi, fetchEventByIdApi, fetchEvents, updateEventApi, updateEventStatusApi } from "@/api/eventsApi";
import { FETCH_EVENT_BY_ID_REQUEST, FETCH_EVENT_BY_ID_FAILURE, FETCH_EVENT_BY_ID_SUCCESS, FETCH_EVENTS_FAILURE, FETCH_EVENTS_REQUEST, FETCH_EVENTS_SUCCESS, type FetchEventByIdFailureAction, type FetchEventByIdSuccessAction, type FetchEventsFailureAction, type FetchEventsRequestAction, type FetchEventsSuccessAction, UPDATE_EVENT_REQUEST, type UpdateEventSuccessAction, type UpdateEventFailureAction, UPDATE_EVENT_SUCCESS, UPDATE_EVENT_FAILURE, type UpdateEventRequestAction, CREATE_EVENT_REQUEST, CREATE_EVENT_SUCCESS, CREATE_EVENT_FAILURE, type CreateEventRequestAction, type CreateEventSuccessAction, type CreateEventFailureAction, DELETE_EVENT_REQUEST, DELETE_EVENT_FAILURE, DELETE_EVENT_SUCCESS, type DeleteEventSuccessAction, type DeleteEventFailureAction, UPDATE_EVENT_STATUS_REQUEST, UPDATE_EVENT_STATUS_SUCCESS, UPDATE_EVENT_STATUS_FAILURE, type UpdateEventStatusRequestAction, type UpdateEventStatusSuccessAction, type UpdateEventStatusFailureAction } from "./events.type"

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

export const updateEventRequest = (eventId: string | undefined,event: any) : UpdateEventRequestAction => {
  return async (dispatch: any) => {
    dispatch({ type: UPDATE_EVENT_REQUEST, payload: { eventId, event} })
    try {
      const response = await updateEventApi(eventId,event)
      // updateEventApi returns response.data directly, not full response
      dispatch(updateEventSuccess(response))
      return response;
    } catch (error: any) {
      console.error('Update event error:', error);
      dispatch(updateEventFailure(error.response?.data?.message || error.message || 'Update event failed'))
      throw error;
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

export const createEventRequest = (event: any): CreateEventRequestAction => {
  return async (dispatch: any) => {
    dispatch({ type: CREATE_EVENT_REQUEST, payload: event })
    try {
      const response = await createEventApi(event)
      // createEventApi returns response.data directly, not full response
      dispatch(createEventSuccess(response))
    } catch (error: any) {
      console.error('Create event error:', error);
      dispatch(createEventFailure(error.response?.data?.message || error.message || 'Create event failed'))
    }
  };
}

export const createEventSuccess = (event: any): CreateEventSuccessAction => ({
  type: CREATE_EVENT_SUCCESS,
  payload: event,
})

export const createEventFailure = (error: string): CreateEventFailureAction => ({
  type: CREATE_EVENT_FAILURE,
  payload: error,
})

export const deleteEventRequest = (eventId: string) => {
  return async (dispatch: any) => {
    dispatch({ type: DELETE_EVENT_REQUEST, payload: eventId })
    try {
      await deleteEventApi(eventId)
      // deleteEventApi returns response.data directly, not full response
      dispatch({ type: DELETE_EVENT_SUCCESS })
    } catch (error: any) {
      console.error('Delete event error:', error);
      dispatch({ type: DELETE_EVENT_FAILURE, payload: error.response?.data?.message || error.message || 'Delete event failed' })
    }
  }
}
export const deleteEventSuccess = () : DeleteEventSuccessAction => ({
  type: DELETE_EVENT_SUCCESS,
})

export const deleteEventFailure = (error: string) : DeleteEventFailureAction => ({
  type: DELETE_EVENT_FAILURE,
  payload: error,
})

export const updateEventStatusRequest = (eventId: string, status: string) => {
  return async (dispatch: any) => {
    dispatch({ type: UPDATE_EVENT_STATUS_REQUEST, payload: { eventId, status } })
    try {
      const response = await updateEventStatusApi(eventId, status)
      dispatch(updateEventStatusSuccess(response))
      // Refresh events list
      dispatch(fetchEventsRequest())
    } catch (error: any) {
      console.error('Update event status error:', error);
      dispatch(updateEventStatusFailure(error.response?.data?.message || error.message || 'Update event status failed'))
    }
  };
}

export const updateEventStatusSuccess = (event: any): UpdateEventStatusSuccessAction => ({
  type: UPDATE_EVENT_STATUS_SUCCESS,
  payload: event,
})

export const updateEventStatusFailure = (error: string): UpdateEventStatusFailureAction => ({
  type: UPDATE_EVENT_STATUS_FAILURE,
  payload: error,
})