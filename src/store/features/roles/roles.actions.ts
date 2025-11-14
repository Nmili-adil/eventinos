import { roleApi, rolesApi } from "@/api/roleApi";
import { FETCH_ROLE_BY_ID_FAILURE, FETCH_ROLE_BY_ID_SUCCESS, FETCH_ROLES_FAILURE, FETCH_ROLES_SUCCESS, type FetchRoleByIdRequestAction, type FetchRolesRequestAction } from "./roles.types";

// export const fetchRolesRequest = () : FetchRolesRequestAction => {
//     return async (dispatch:any) => {
//       dispatch({ type: 'FETCH_ROLES_REQUEST' })
//         try {
//             const response = await rolesApi()
//             if(response && response.status ===200) {
//                 dispatch({
//                     type: FETCH_ROLES_SUCCESS,
//                     payload: response.data,
//                 })
//             } else {
//                 dispatch({
//                     type: FETCH_ROLES_FAILURE,
//                     payload: response ? response.data.message : 'Failed to fetch roles',
//                 })
//             }
//         } catch (error:any) {
//             dispatch({
//                 type: FETCH_ROLES_FAILURE,
//                 payload: error.message || 'Failed to fetch roles',
//             })
//         }
//     }
// }

export const fetchRoleByIdRequest = (roleId:string) : FetchRoleByIdRequestAction => {
    return async (dispatch:any) => {
      dispatch({ type: 'FETCH_ROLE_BY_ID_REQUEST' })
        try {
            const response = await roleApi(roleId)
            if(response && response.status ===200) {
                dispatch({
                    type: FETCH_ROLE_BY_ID_SUCCESS,
                    payload: response.data,
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