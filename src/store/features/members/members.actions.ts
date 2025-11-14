import { deleteMemberApi, fetchMembersApi, updateMemberApi, updateMemberStatusApi, createMemberApi } from "@/api/membersApi";
import { FETCH_MEMBERS_FAILURE, FETCH_MEMBERS_REQUEST, FETCH_MEMBERS_SUCCESS } from "./members.types";

export const fetchMembersRequest = (page: number = 1, pageSize: number = 10) => {
    return async(dispatch: any) => {
        dispatch({ type: FETCH_MEMBERS_REQUEST });
        try {
            const response = await fetchMembersApi(page, pageSize);
            if(response?.status === 200){
                const data = response.data.data;
                const total = response.data.count;
                const pagination = response.data.pagination;
                
                dispatch({
                    type: FETCH_MEMBERS_SUCCESS,
                    payload: {
                        members: data,
                        total: total,
                        pagination: pagination,
                    }
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

export const createMemberRequest = (data: any) => {
    return async (dispatch: any) => {
        dispatch({ type: 'CREATE_MEMBER_REQUEST' });
        try {
            const response = await createMemberApi(data);
            if (response?.status === 200 || response?.status === 201) {
                dispatch({
                    type: 'CREATE_MEMBER_SUCCESS',
                    payload: response.data,
                });
                // Refresh members list with current pagination
                const currentPage = 1; // Reset to first page after creating
                dispatch(fetchMembersRequest(currentPage, 10));
            }
        } catch (error) {
            dispatch({
                type: 'CREATE_MEMBER_FAILURE',
                payload: (error as Error).message,
            });
            throw error;
        }
    };
};

export const deleteMemberRequest = (memberId: string) => {
    return async (dispatch: any) => {
        dispatch({ type: 'DELETE_MEMBER_REQUEST' });
        try {
            const response = await deleteMemberApi(memberId);
            if (response?.status === 200) {
                dispatch({
                    type: 'DELETE_MEMBER_SUCCESS',
                    payload: memberId,
                });
                // Refresh members list with current pagination
                dispatch(fetchMembersRequest(1, 10));
            }
        } catch (error) {
            dispatch({
                type: 'DELETE_MEMBER_FAILURE',
                payload: (error as Error).message,
            });
            throw error;
        }
    };
}

export const updateMemberRequest = (memberId: string, data: any) => {
    return async (dispatch: any) => {
        dispatch({ type: 'UPDATE_MEMBER_REQUEST' });
        try {
            const response = await updateMemberApi(memberId, data);
            if (response?.status === 200) {
                dispatch({
                    type: 'UPDATE_MEMBER_SUCCESS',
                    payload: response.data,
                });
                // Refresh members list with current pagination
                dispatch(fetchMembersRequest(1, 10));
            }
        } catch (error) {
            dispatch({
                type: 'UPDATE_MEMBER_FAILURE',
                payload: (error as Error).message,
            });
            throw error;
        }
    };
}

export const updateMemberStatusRequest = (memberId: string, isActive: boolean) => {
    return async (dispatch: any) => {
        dispatch({ type: 'UPDATE_MEMBER_STATUS_REQUEST' });
        try {
            const response = await updateMemberStatusApi(memberId, isActive);
            if (response?.status === 200) {
                dispatch({
                    type: 'UPDATE_MEMBER_STATUS_SUCCESS',
                    payload: response.data,
                });
                // Refresh members list with current pagination
                dispatch(fetchMembersRequest(1, 10));
            }
        } catch (error) {
            dispatch({
                type: 'UPDATE_MEMBER_STATUS_FAILURE',
                payload: (error as Error).message,
            });
            throw error;
        }
    };
}