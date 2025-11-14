export const FETCH_ROLES_REQUEST = 'FETCH_ROLES_REQUEST';
export const FETCH_ROLES_SUCCESS = 'FETCH_ROLES_SUCCESS';
export const FETCH_ROLES_FAILURE = 'FETCH_ROLES_FAILURE';

export const FETCH_ROLE_BY_ID_REQUEST = 'FETCH_ROLE_BY_ID_REQUEST'; 
export const FETCH_ROLE_BY_ID_SUCCESS = 'FETCH_ROLE_BY_ID_SUCCESS';
export const FETCH_ROLE_BY_ID_FAILURE = 'FETCH_ROLE_BY_ID_FAILURE';


export interface RolesState {
  roles: string[];
  role: any;
  loading: boolean;
  error: string | null;
}



export interface FetchRolesRequestAction {
  type: typeof FETCH_ROLES_REQUEST;
}

export interface FetchRolesSuccessAction {
  type: typeof FETCH_ROLES_SUCCESS;
  payload: string[];
}

export interface FetchRolesFailureAction {
  type: typeof FETCH_ROLES_FAILURE;
  payload: string;
}

export interface FetchRoleByIdRequestAction {
    type: typeof FETCH_ROLE_BY_ID_REQUEST;
    payload: string;
}   
export interface FetchRoleByIdSuccessAction {
    type: typeof FETCH_ROLE_BY_ID_SUCCESS;
    payload: string;
    }   
export interface FetchRoleByIdFailureAction {
    type: typeof FETCH_ROLE_BY_ID_FAILURE;
    payload: string;
    }


export type RolesActionTypes =
  | FetchRolesRequestAction
  | FetchRolesSuccessAction
  | FetchRolesFailureAction
    | FetchRoleByIdRequestAction
    | FetchRoleByIdSuccessAction
    | FetchRoleByIdFailureAction;