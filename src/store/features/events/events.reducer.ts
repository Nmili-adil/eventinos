import { FETCH_EVENT_BY_ID_REQUEST, FETCH_EVENT_BY_ID_FAILURE, FETCH_EVENT_BY_ID_SUCCESS, FETCH_EVENTS_FAILURE, FETCH_EVENTS_REQUEST, FETCH_EVENTS_SUCCESS, type EventActionTypes, type EventState, UPDATE_EVENT_SUCCESS, UPDATE_EVENT_FAILURE, UPDATE_EVENT_REQUEST } from "./events.type"

const initialState: EventState = {
  events: [],
  event: null,
  count: 0,
  isLoading: false,
  error: null,
}



const eventReducrer = (state = initialState, action: EventActionTypes): EventState => {
    switch (action.type) {
        case FETCH_EVENTS_REQUEST:
            return {
                ...state,
                isLoading: true,
                error: null,
            }
        case FETCH_EVENTS_SUCCESS:
            return {
                ...state,
                isLoading: false,
                count: action.count,
                events: action.payload,
            }
        case FETCH_EVENTS_FAILURE:
            return {
                ...state,
                isLoading: false,
                error: action.payload,
            }
            case FETCH_EVENT_BY_ID_SUCCESS:
            return {
                ...state,
                isLoading: false,
                event: action.payload,
            }
            case FETCH_EVENT_BY_ID_FAILURE:
            return {
                ...state,
                isLoading: false,
                error: action.payload,
            }
            case FETCH_EVENT_BY_ID_REQUEST:
            return {
                ...state,
                isLoading: true,
                error: null,
            }
            case UPDATE_EVENT_SUCCESS:
            return {
                ...state,
                isLoading: false,
                event: action.payload,
            }
            case UPDATE_EVENT_FAILURE:
            return {
                ...state,
                isLoading: false,
                error: action.payload,
            }
            case UPDATE_EVENT_REQUEST:
            return {
                ...state,
                isLoading: true,
                error: null,
            }
        default:
            return state
    }
}

export default eventReducrer
