import { fetchUsers, getUserById } from "@/api/usersApi";
import { FETCH_USERS_FAILURE, FETCH_USERS_REQUEST, FETCH_USERS_SUCCESS, type FetchUserByIdFailureAction, type FetchUserByIdSuccessAction, type FetchUsersFailureAction, type FetchUsersRequestAction, type FetchUsersSuccessAction } from "./users.type"

export const fetchUsersRequest = (): FetchUsersRequestAction => {
    return async (dispatch: any) => {
      dispatch({ type: FETCH_USERS_REQUEST })
      try {
        const response = await fetchUsers()
        if(response.status ===200) {
          dispatch(fetchUsersSuccess(response.data.data, response.data.count))
        } else {
          dispatch(fetchUsersFailure(response.data.message))
        }
      } catch (error: any) {
        dispatch(fetchUsersFailure(error.response?.data?.message || error.message || 'Fetch users failed'))
      }
    };
}

export const fetchUsersSuccess = (users: any[], count: number): FetchUsersSuccessAction => ({
  type: FETCH_USERS_SUCCESS,
  count: count,
  payload: users,
})

export const fetchUsersFailure = (error: string): FetchUsersFailureAction => ({
  type: FETCH_USERS_FAILURE,
  payload: error,
})


export const fetchUserByIdRequest = (userId: string) => {
  return async (dispatch: any) => {
    dispatch({ type: 'FETCH_USER_BY_ID_REQUEST' })
    try {
      const response = await getUserById(userId)
      if(response.status ===200) {
        dispatch(fetchUserByIdSuccess(response.data))
      } else {
        dispatch(fetchUserByIdFailure(response.data.message))
      }
    } catch (error: any) {
      dispatch(fetchUserByIdFailure(error.response?.data?.message || error.message || 'Fetch user by ID failed'))
    }
  }
}

const fetchUserByIdSuccess = (user: any)  : FetchUserByIdSuccessAction=> ({
  type: 'FETCH_USER_BY_ID_SUCCESS',
  payload: user,
})

const fetchUserByIdFailure = (error: string) :FetchUserByIdFailureAction => ({
  type: 'FETCH_USER_BY_ID_FAILURE',
  payload: error,
})