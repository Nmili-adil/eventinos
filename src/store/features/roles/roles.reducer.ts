import { FETCH_ROLE_BY_ID_FAILURE, FETCH_ROLE_BY_ID_REQUEST, FETCH_ROLE_BY_ID_SUCCESS, FETCH_ROLES_FAILURE, FETCH_ROLES_REQUEST, FETCH_ROLES_SUCCESS, type RolesState } from "./roles.types";

const initialState : RolesState = {
  roles: [],
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
    case 'CREATE_ROLE_REQUEST':
    case 'UPDATE_ROLE_REQUEST':
    case 'DELETE_ROLE_REQUEST':
        return {
            ...state,
            loading: true,
            error: null,
        }
    case 'CREATE_ROLE_SUCCESS':
    case 'UPDATE_ROLE_SUCCESS':
        return {
            ...state,
            loading: false,
            error: null,
        }
    case 'DELETE_ROLE_SUCCESS':
        return {
            ...state,
            loading: false,
            error: null,
            roles: state.roles.filter(role => role._id !== action.payload),
        }
    case 'CREATE_ROLE_FAILURE':
    case 'UPDATE_ROLE_FAILURE':
    case 'DELETE_ROLE_FAILURE':
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