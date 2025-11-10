import { fetchBadgeByIdApi, fetchBadgesApi } from "@/api/badgesApi"
import { FETCH_BADGE_BY_ID_REQUEST, FETCH_BADGES_FAILURE, FETCH_BADGES_REQUEST, FETCH_BADGES_SUCCESS, type FetchBadgeByIdRequestAction, type FetchBadgesFailureAction, type FetchBadgesFailureAction, type FetchBadgesRequestAction, type FetchBadgesSuccessAction } from "./badges.type"

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
