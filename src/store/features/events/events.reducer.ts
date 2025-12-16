import {
  FETCH_EVENT_BY_ID_REQUEST,
  FETCH_EVENT_BY_ID_FAILURE,
  FETCH_EVENT_BY_ID_SUCCESS,
  FETCH_EVENTS_FAILURE,
  FETCH_EVENTS_REQUEST,
  FETCH_EVENTS_SUCCESS,
  type EventActionTypes,
  type EventState,
  UPDATE_EVENT_SUCCESS,
  UPDATE_EVENT_FAILURE,
  UPDATE_EVENT_REQUEST,
  CREATE_EVENT_REQUEST,
  CREATE_EVENT_SUCCESS,
  CREATE_EVENT_FAILURE,
  DELETE_EVENT_REQUEST,
  DELETE_EVENT_SUCCESS,
  DELETE_EVENT_FAILURE,
  UPDATE_EVENT_STATUS_REQUEST,
  UPDATE_EVENT_STATUS_SUCCESS,
  UPDATE_EVENT_STATUS_FAILURE,
} from "./events.type";

const initialState: EventState = {
  events: [],
  event: null,
  count: 0,
  isLoading: false,
  isUpdating: false,
  isCreating: false,
  isDeleted: false,
  error: null,
  pagination: null,
};

const eventReducrer = (
  state = initialState,
  action: EventActionTypes
): EventState => {
  switch (action.type) {
    // Events fetching cases
    case FETCH_EVENTS_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case FETCH_EVENTS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        count: action.count,
        events: action.payload,
        pagination: action.pagination,
      };
    case FETCH_EVENTS_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    // Event by ID fetching cases
    case FETCH_EVENT_BY_ID_SUCCESS:
      return {
        ...state,
        isLoading: false,
        event: action.payload,
      };
    case FETCH_EVENT_BY_ID_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case FETCH_EVENT_BY_ID_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    // Event updating cases
    case UPDATE_EVENT_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isUpdating: false,
        event: action.payload,
      };
    case UPDATE_EVENT_FAILURE:
      return {
        ...state,
        isLoading: false,
        isUpdating: false,
        error: action.payload,
      };
    case UPDATE_EVENT_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    // Event creating cases
    case CREATE_EVENT_REQUEST:
      return {
        ...state,
        isCreating: true,
        error: null,
      };
    case CREATE_EVENT_SUCCESS:
      return {
        ...state,
        isCreating: false,
        event: action.payload,
      };
    case CREATE_EVENT_FAILURE:
      return {  
        ...state,
        isCreating: false,
        error: action.payload,
      };
    case DELETE_EVENT_REQUEST:
      return {
        ...state,
        isDeleted: false,
        error: null,
        };

    case DELETE_EVENT_SUCCESS:
        return {
            ...state,
            isLoading: false,
            isDeleted: true,
        };
    case DELETE_EVENT_FAILURE:
        return {
            ...state,
            isLoading: false,
            isDeleted: false,
            error: action.payload,
        };
    // Event status update cases
    case UPDATE_EVENT_STATUS_REQUEST:
      return {
        ...state,
        isUpdating: true,
        error: null,
      };
    case UPDATE_EVENT_STATUS_SUCCESS:
      return {
        ...state,
        isUpdating: false,
        event: action.payload,
        // Update the event in the events array if it exists
        events: state.events.map((e) =>
          e._id === action.payload._id ? action.payload : e
        ),
      };
    case UPDATE_EVENT_STATUS_FAILURE:
      return {
        ...state,
        isUpdating: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

export default eventReducrer;
