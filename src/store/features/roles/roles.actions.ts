import { roleApi, rolesApi, createRoleApi, updateRoleApi, deleteRoleApi } from "@/api/roleApi";
import { FETCH_ROLE_BY_ID_FAILURE, FETCH_ROLE_BY_ID_SUCCESS, FETCH_ROLES_FAILURE, FETCH_ROLES_SUCCESS, type FetchRoleByIdRequestAction, type FetchRolesRequestAction } from "./roles.types";

export const fetchRolesRequest = () : FetchRolesRequestAction => {
    return async (dispatch:any) => {
      dispatch({ type: 'FETCH_ROLES_REQUEST' })
        try {
            const response = await rolesApi()
            if(response && response.status ===200) {
                dispatch({
                    type: FETCH_ROLES_SUCCESS,
                    payload: response.data.data || response.data,
                })
            } else {
                dispatch({
                    type: FETCH_ROLES_FAILURE,
                    payload: response ? response.data.message : 'Failed to fetch roles',
                })
            }
        } catch (error:any) {
            dispatch({
                type: FETCH_ROLES_FAILURE,
                payload: error.message || 'Failed to fetch roles',
            })
        }
    }
}

export const fetchRoleByIdRequest = (roleId:string) : FetchRoleByIdRequestAction => {
    return async (dispatch:any) => {
      dispatch({ type: 'FETCH_ROLE_BY_ID_REQUEST' })
        try {
            const response = await roleApi(roleId)
            if(response && response.status ===200) {
                dispatch({
                    type: FETCH_ROLE_BY_ID_SUCCESS,
                    payload: response.data.data || response.data,
                })
            } else {
                dispatch({
                    type: FETCH_ROLE_BY_ID_FAILURE,
                    payload: response ? response.data.message : 'Failed to fetch role',
                })
            }
        } catch (error:any) {
            dispatch({
                type: FETCH_ROLE_BY_ID_FAILURE,
                payload: error.message || 'Failed to fetch role',
            })
        }
    }
}

export const createRoleRequest = (data: any) => {
    return async (dispatch: any) => {
        dispatch({ type: 'CREATE_ROLE_REQUEST' })
        try {
            const response = await createRoleApi(data)
            if (response?.status === 200 || response?.status === 201) {
                dispatch({
                    type: 'CREATE_ROLE_SUCCESS',
                    payload: response.data.data || response.data,
                })
                dispatch(fetchRolesRequest())
            } else {
                dispatch({
                    type: 'CREATE_ROLE_FAILURE',
                    payload: response?.data?.message || 'Failed to create role',
                })
            }
        } catch (error: any) {
            dispatch({
                type: 'CREATE_ROLE_FAILURE',
                payload: error.response?.data?.message || error.message || 'Failed to create role',
            })
            throw error
        }
    }
}

export const updateRoleRequest = (roleId: string, data: any) => {
    return async (dispatch: any) => {
        dispatch({ type: 'UPDATE_ROLE_REQUEST' })
        try {
            const response = await updateRoleApi(roleId, data)
            if (response?.status === 200 || response?.status === 201) {
                dispatch({
                    type: 'UPDATE_ROLE_SUCCESS',
                    payload: response.data.data || response.data,
                })
                dispatch(fetchRolesRequest())
            } else {
                dispatch({
                    type: 'UPDATE_ROLE_FAILURE',
                    payload: response?.data?.message || 'Failed to update role',
                })
            }
        } catch (error: any) {
            dispatch({
                type: 'UPDATE_ROLE_FAILURE',
                payload: error.response?.data?.message || error.message || 'Failed to update role',
            })
            throw error
        }
    }
}

export const deleteRoleRequest = (roleId: string) => {
    return async (dispatch: any) => {
        dispatch({ type: 'DELETE_ROLE_REQUEST' })
        try {
            const response = await deleteRoleApi(roleId)
            if (response?.status === 200 || response?.status === 204) {
                dispatch({
                    type: 'DELETE_ROLE_SUCCESS',
                    payload: roleId,
                })
                dispatch(fetchRolesRequest())
            } else {
                dispatch({
                    type: 'DELETE_ROLE_FAILURE',
                    payload: response?.data?.message || 'Failed to delete role',
                })
            }
        } catch (error: any) {
            dispatch({
                type: 'DELETE_ROLE_FAILURE',
                payload: error.response?.data?.message || error.message || 'Failed to delete role',
            })
            throw error
        }
    }
}