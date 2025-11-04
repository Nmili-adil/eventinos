import { FETCH_EVENTS_FAILURE, FETCH_EVENTS_REQUEST, FETCH_EVENTS_SUCCESS, type EventActionTypes, type EventState } from "./events.type"

const initialState: EventState = {
  events: [],
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
        default:
            return state
    }
}

export default eventReducrer
