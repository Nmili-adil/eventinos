import { FETCH_ROLE_BY_ID_FAILURE, FETCH_ROLE_BY_ID_REQUEST, FETCH_ROLE_BY_ID_SUCCESS, FETCH_ROLES_FAILURE, FETCH_ROLES_REQUEST, FETCH_ROLES_SUCCESS, type RolesState } from "./roles.types";

const initialState : RolesState = {
  roles: [] as string[],
  role: null,
  loading: false,
  error: null as string | null,
};


export const rolesReducer = (state = initialState, action:any) : RolesState => {
  switch (action.type) {
    case FETCH_ROLES_REQUEST:
        return {
            ...state,
            loading: true,
            error: null,
        }
    case FETCH_ROLES_SUCCESS:
        return {
            ...state,
            loading: false,
            roles: action.payload,
        }
    case FETCH_ROLES_FAILURE:
        return {
            ...state,
            loading: false,
            error: action.payload,
        }
    case FETCH_ROLE_BY_ID_REQUEST:
        return {
            ...state,
            loading: true,
            error: null,
        }
    case FETCH_ROLE_BY_ID_SUCCESS:
        return {
            ...state,
            loading: false,
            role: action.payload,
        }
    case FETCH_ROLE_BY_ID_FAILURE:
        return {
            ...state,
            loading: false,
            error: action.payload,
        }
    default:
      return state;
  }
}

export default rolesReducer;