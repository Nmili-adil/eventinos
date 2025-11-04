import { FETCH_USERS_FAILURE, FETCH_USERS_REQUEST, FETCH_USERS_SUCCESS, type UserActionTypes, type UserState } from "./users.type";

const initialState: UserState = {
  users: [],
  usersCount: 0,
  isLoading: false,
  error: null,
}

const usersReducer = (state = initialState, action: UserActionTypes): UserState => {
  switch (action.type) {
    case FETCH_USERS_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    case FETCH_USERS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        usersCount: action.count,
        users: action.payload,
      }
    case FETCH_USERS_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      }
    default:
      return state
  }
}

export default usersReducer