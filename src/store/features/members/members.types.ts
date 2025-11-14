export const FETCH_MEMBERS_REQUEST = 'FETCH_MEMBERS_REQUEST';
export const FETCH_MEMBERS_SUCCESS = 'FETCH_MEMBERS_SUCCESS';
export const FETCH_MEMBERS_FAILURE = 'FETCH_MEMBERS_FAILURE';


export const UPDATE_MEMBER_STATUS_REQUEST = 'UPDATE_MEMBER_STATUS_REQUEST';
export const UPDATE_MEMBER_STATUS_SUCCESS = 'UPDATE_MEMBER_STATUS_SUCCESS';
export const UPDATE_MEMBER_STATUS_FAILURE = 'UPDATE_MEMBER_STATUS_FAILURE';

export const DELETE_MEMBER_REQUEST = 'DELETE_MEMBER_REQUEST';
export const DELETE_MEMBER_SUCCESS = 'DELETE_MEMBER_SUCCESS';
export const DELETE_MEMBER_FAILURE = 'DELETE_MEMBER_FAILURE';

export const FETCH_MEMBER_BY_ID_REQUEST = 'FETCH_MEMBER_BY_ID_REQUEST';
export const FETCH_MEMBER_BY_ID_SUCCESS = 'FETCH_MEMBER_BY_ID_SUCCESS';
export const FETCH_MEMBER_BY_ID_FAILURE = 'FETCH_MEMBER_BY_ID_FAILURE';

export const UPDATE_MEMBER_REQUEST = 'UPDATE_MEMBER_REQUEST';
export const UPDATE_MEMBER_SUCCESS = 'UPDATE_MEMBER_SUCCESS';   
export const UPDATE_MEMBER_FAILURE = 'UPDATE_MEMBER_FAILURE';

export interface MembersState {
  members: any[];
  loading: boolean;
  error: string | null;
  
}

export interface FetchMembersRequest {
    type: typeof FETCH_MEMBERS_REQUEST;
}
export interface FetchMembersSuccess {
    type: typeof FETCH_MEMBERS_SUCCESS;
    payload: {
        members: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
export interface FetchMembersFailure {
    type: typeof FETCH_MEMBERS_FAILURE;
    payload: string;
}

export interface UpdateMemberStatusRequest {
    type: typeof UPDATE_MEMBER_STATUS_REQUEST;
}
export interface UpdateMemberStatusSuccess {
    type: typeof UPDATE_MEMBER_STATUS_SUCCESS;
    payload: any;
}
export interface UpdateMemberStatusFailure {
    type: typeof UPDATE_MEMBER_STATUS_FAILURE;
    payload: string;
}

export interface DeleteMemberRequest {
    type: typeof DELETE_MEMBER_REQUEST;
}
export interface DeleteMemberSuccess {
    type: typeof DELETE_MEMBER_SUCCESS;
    payload: string;
}
export interface DeleteMemberFailure {
    type: typeof DELETE_MEMBER_FAILURE;
    payload: string;
}

export interface FetchMemberByIdRequest {
    type: typeof FETCH_MEMBER_BY_ID_REQUEST;
}
export interface FetchMemberByIdSuccess {
    type: typeof FETCH_MEMBER_BY_ID_SUCCESS;
    payload: any;
}
export interface FetchMemberByIdFailure {
    type: typeof FETCH_MEMBER_BY_ID_FAILURE;
    payload: string;
}

export interface UpdateMemberRequest {
    type: typeof UPDATE_MEMBER_REQUEST;
}
export interface UpdateMemberSuccess {
    type: typeof UPDATE_MEMBER_SUCCESS;
    payload: any;
}
export interface UpdateMemberFailure {
    type: typeof UPDATE_MEMBER_FAILURE;
    payload: string;
}

export type MembersActionTypes =
    | FetchMembersRequest
    | FetchMembersSuccess
    | FetchMembersFailure
    | UpdateMemberStatusRequest
    | UpdateMemberStatusSuccess
    | UpdateMemberStatusFailure
    | DeleteMemberRequest
    | DeleteMemberSuccess
    | DeleteMemberFailure
    | FetchMemberByIdRequest
    | FetchMemberByIdSuccess
    | FetchMemberByIdFailure
    | UpdateMemberRequest
    | UpdateMemberSuccess
    | UpdateMemberFailure;