import { deleteMemberApi, fetchMembersApi } from "@/api/membersApi";
import { FETCH_MEMBERS_FAILURE, FETCH_MEMBERS_REQUEST, FETCH_MEMBERS_SUCCESS, type FetchMembersRequest } from "./members.types";

export const fetchMembersRequest = (): FetchMembersRequest => {

    return  async(dispatch: any) => {
        dispatch({ type: FETCH_MEMBERS_REQUEST });
        try {
            const response = await fetchMembersApi();
            if(response?.status === 200){
                const data = response.data;
            dispatch({
                type: FETCH_MEMBERS_SUCCESS,
                payload:data
            });

        }
        } catch (error) {
            dispatch({
                type: FETCH_MEMBERS_FAILURE,
                payload: (error as Error).message,
            });
        }
    }

};

export const deleteMemberRequest = (memberId: string) => {
    return async (dispatch: any) => {
        dispatch({ type: 'DELETE_MEMBER_REQUEST' });
        try {
            // Assume deleteMemberApi is defined elsewhere
            const response = await deleteMemberApi(memberId);
            if (response?.status === 200) {
                dispatch({
                    type: 'DELETE_MEMBER_SUCCESS',
                    payload: memberId,
                });
            }
        } catch (error) {
            dispatch({
                type: 'DELETE_MEMBER_FAILURE',
                payload: (error as Error).message,
            });
        }
    };
}