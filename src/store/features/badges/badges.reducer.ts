import { CREATE_BADGE_FAILURE, CREATE_BADGE_REQUEST, CREATE_BADGE_SUCCESS, DELETE_BADGE_FAILURE, DELETE_BADGE_REQUEST, DELETE_BADGE_SUCCESS, FETCH_BADGE_BY_ID_FAILURE, FETCH_BADGE_BY_ID_REQUEST, FETCH_BADGE_BY_ID_SUCCESS, FETCH_BADGES_FAILURE, FETCH_BADGES_REQUEST, FETCH_BADGES_SUCCESS, UPDATE_BADGE_FAILURE, UPDATE_BADGE_REQUEST, UPDATE_BADGE_SUCCESS, type BadgeActionTypes, type BadgeState } from "./badges.type";

const initialState : BadgeState = {
    badges: [],
    badge: null,
    count: 0,
    isLoading: false,
    isUpdating: false,
    isCreating: false,
    isDeleted: false,
    error: null
}

export const badgesReducer = (state = initialState, action: BadgeActionTypes) => {
    switch (action.type) {
        case FETCH_BADGES_REQUEST:
            return {
                ...state,
                isLoading: true,
            }
        case FETCH_BADGES_SUCCESS:
            return {
                ...state,
                isLoading: false,
                badges: action.payload,
            }
        case FETCH_BADGES_FAILURE:
            return {
                ...state,
                isLoading: false,
                error: action.payload,
            }

        case FETCH_BADGE_BY_ID_REQUEST:
            return {
                ...state,
                isLoading: true,
            }
        case FETCH_BADGE_BY_ID_SUCCESS:
            return {
                ...state,
                isLoading: false,
                badge: action.payload,
            }
        case FETCH_BADGE_BY_ID_FAILURE:
            return {
                ...state,
                isLoading: false,
                error: action.payload,
            }

        case UPDATE_BADGE_REQUEST:
            return {
                ...state,
                isUpdating: true,
            }
        case UPDATE_BADGE_SUCCESS:
            return {
                ...state,
                isUpdating: false,
                badge: action.payload,
            }
        case UPDATE_BADGE_FAILURE:
            return {
                ...state,
                isUpdating: false,
                error: action.payload,
            }
        case DELETE_BADGE_REQUEST:
            return {
                ...state,
                isDeleting: true,
            }
        case DELETE_BADGE_SUCCESS:
            return {
                ...state,
                isDeleting: false,
                badge: action.payload,
            }
        case DELETE_BADGE_FAILURE:
            return {
                ...state,
                isDeleting: false,
                error: action.payload,
            }
        case CREATE_BADGE_REQUEST:
            return {
                ...state,
                isCreating: true,
            }
        case CREATE_BADGE_SUCCESS:
            return {
                ...state,
                isCreating: false,
                badge: action.payload,
            }
        case CREATE_BADGE_FAILURE:
            return {
                ...state,
                isCreating: false,
                error: action.payload,
            }
        default:
            return state
    }
}