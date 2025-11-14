import { fetchBadgeByIdApi, fetchBadgesApi, updateBadgeApi, createBadgeApi, deleteBadgeApi } from "@/api/badgesApi"
import { 
  FETCH_BADGE_BY_ID_REQUEST, 
  FETCH_BADGES_FAILURE, 
  FETCH_BADGES_REQUEST, 
  FETCH_BADGES_SUCCESS, 
  UPDATE_BADGE_FAILURE, 
  UPDATE_BADGE_REQUEST, 
  UPDATE_BADGE_SUCCESS,
  CREATE_BADGE_REQUEST,
  CREATE_BADGE_SUCCESS,
  CREATE_BADGE_FAILURE,
  DELETE_BADGE_REQUEST,
  DELETE_BADGE_SUCCESS,
  DELETE_BADGE_FAILURE,
  type FetchBadgeByIdRequestAction, 
  type FetchBadgesFailureAction, 
  type FetchBadgesRequestAction, 
  type FetchBadgesSuccessAction, 
  type UpdateBadgeFailureAction, 
  type UpdateBadgeRequestAction, 
  type UpdateBadgeSuccessAction,
  type CreateBadgeRequestAction,
  type CreateBadgeSuccessAction,
  type CreateBadgeFailureAction,
  type DeleteBadgeRequestAction,
  type DeleteBadgeSuccessAction,
  type DeleteBadgeFailureAction
} from "./badges.type"

export const fetchBadgesRequest = () => {
    return async (dispatch: any) => {
        dispatch({ type: FETCH_BADGES_REQUEST })
        try {
            const response = await fetchBadgesApi()
            console.log(response)
            if (response.status === 200) {
                dispatch(fetchBadgesSuccess(response.data.data))
            } else {
                dispatch(fetchBadgesFailure(response.data.message))
            }
        } catch (error: any) {
            dispatch(fetchBadgesFailure(error.response?.data?.message || error.message || 'Fetch badges failed'))
        }
       
    }   
}

 const fetchBadgesSuccess = (payload: any) : FetchBadgesSuccessAction => ({
    type: FETCH_BADGES_SUCCESS,
    payload
})

 const fetchBadgesFailure = (payload: string) : FetchBadgesFailureAction => ({
    type: FETCH_BADGES_FAILURE,
    payload
})


export const updateBadgeRequest = (badgeId: string, payload: any) => {
    return async (dispatch: any) => {
        dispatch({ type: UPDATE_BADGE_REQUEST, payload, badgeId })
        try {
            const response = await updateBadgeApi(badgeId, payload);
            if(response?.status === 200) {
                dispatch(updateBadgeSuccess(response?.data.data || response?.data))
                dispatch(fetchBadgesRequest())
            } else {
                dispatch(updateBadgeFailure(response?.data.message || 'Update badge failed'))
            }
        } catch (error: any) {
            dispatch(updateBadgeFailure(error.response?.data?.message || error.message || 'Updating badge failure.'))
            throw error
        }
    }
}

const updateBadgeSuccess = ( payload: any) : UpdateBadgeSuccessAction => {
    return {
        type: UPDATE_BADGE_SUCCESS,
        payload
    }
}

const updateBadgeFailure = (payload: any) : UpdateBadgeFailureAction => {
    return {
        type: UPDATE_BADGE_FAILURE,
        payload
    }
}

export const createBadgeRequest = (data: any) => {
    return async (dispatch: any) => {
        dispatch({ type: CREATE_BADGE_REQUEST, payload: data })
        try {
            const response = await createBadgeApi(data)
            if (response?.status === 200 || response?.status === 201) {
                dispatch({ type: CREATE_BADGE_SUCCESS, payload: response.data })
                dispatch(fetchBadgesRequest())
            } else {
                dispatch({ type: CREATE_BADGE_FAILURE, payload: response?.data?.message || 'Create badge failed' })
            }
        } catch (error: any) {
            dispatch({ type: CREATE_BADGE_FAILURE, payload: error.response?.data?.message || error.message || 'Create badge failed' })
            throw error
        }
    }
}

export const deleteBadgeRequest = (badgeId: string) => {
    return async (dispatch: any) => {
        dispatch({ type: DELETE_BADGE_REQUEST, payload: badgeId })
        try {
            const response = await deleteBadgeApi(badgeId)
            if (response?.status === 200) {
                dispatch({ type: DELETE_BADGE_SUCCESS, payload: response.data })
                dispatch(fetchBadgesRequest())
            } else {
                dispatch({ type: DELETE_BADGE_FAILURE, payload: response?.data?.message || 'Delete badge failed' })
            }
        } catch (error: any) {
            dispatch({ type: DELETE_BADGE_FAILURE, payload: error.response?.data?.message || error.message || 'Delete badge failed' })
            throw error
        }
    }
}