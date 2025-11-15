export const FETCH_RIGHTS_REQUEST = 'FETCH_RIGHTS_REQUEST';
export const FETCH_RIGHTS_SUCCESS = 'FETCH_RIGHTS_SUCCESS';
export const FETCH_RIGHTS_FAILURE = 'FETCH_RIGHTS_FAILURE';

export interface Right {
  _id: string;
  name: string;
  group: string;
  createdAt: string;
  updatedAt: string;
}

export interface RightsState {
  rights: Right[];
  loading: boolean;
  error: string | null;
}

export interface FetchRightsRequestAction {
  type: typeof FETCH_RIGHTS_REQUEST;
}

export interface FetchRightsSuccessAction {
  type: typeof FETCH_RIGHTS_SUCCESS;
  payload: Right[];
}

export interface FetchRightsFailureAction {
  type: typeof FETCH_RIGHTS_FAILURE;
  payload: string;
}

export type RightsActionTypes =
  | FetchRightsRequestAction
  | FetchRightsSuccessAction
  | FetchRightsFailureAction;

