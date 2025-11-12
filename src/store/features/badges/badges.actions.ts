import { fetchBadgeByIdApi, fetchBadgesApi, updateBadgeApi } from "@/api/badgesApi"
import { FETCH_BADGE_BY_ID_REQUEST, FETCH_BADGES_FAILURE, FETCH_BADGES_REQUEST, FETCH_BADGES_SUCCESS, UPDATE_BADGE_FAILURE, UPDATE_BADGE_REQUEST, UPDATE_BADGE_SUCCESS, type FetchBadgeByIdRequestAction, type FetchBadgesFailureAction, type FetchBadgesFailureAction, type FetchBadgesRequestAction, type FetchBadgesSuccessAction, type UpdateBadgeFailureAction, type UpdateBadgeRequestAction, type UpdateBadgeSuccessAction } from "./badges.type"

export const fetchBadgesRequest = () : FetchBadgesRequestAction => {
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


export const updateBadgerequest = (payload: any, badgeId:string) :UpdateBadgeRequestAction => {
    return async (dispatch: any) => {
        dispatch({type: UPDATE_BADGE_REQUEST})
        try {
            const response = await updateBadgeApi(badgeId, payload);
            console.log(response)
            if(response?.status === 200) {
                dispatch( updateBadgeSuccess(response?.data.data))
            } else {
                dispatch(updateBadgeFailure(response?.data.message))
            }
        } catch (error: any) {
            dispatch(updateBadgeFailure(error.response?.data?.message || error.message || 'Updating badge failure.'))
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