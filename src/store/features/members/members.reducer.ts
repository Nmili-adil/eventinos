import type { MembersState } from "./members.types";

const initialState  : MembersState= {
  members: [],
  loading: false,
  error: null,
  total: 0,
  pagination: null,
};


export const membersReducer = (state = initialState, action: any): MembersState => {
  switch (action.type) {
    case 'FETCH_MEMBERS_REQUEST':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'FETCH_MEMBERS_SUCCESS':
      return {
        ...state,
        loading: false,
        members: action.payload.members || [],
        total: action.payload.total || 0,
        pagination: action.payload.pagination || null,
        error: null,
      };
    case 'FETCH_MEMBERS_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'DELETE_MEMBER_REQUEST':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'DELETE_MEMBER_SUCCESS':
      return {
        ...state,
        loading: false,
        members: state.members.filter((member: any) => member._id.$oid !== action.payload),
        total: state.total - 1,
        error: null,
      };
    case 'DELETE_MEMBER_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'UPDATE_MEMBER_REQUEST':
    case 'UPDATE_MEMBER_STATUS_REQUEST':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'UPDATE_MEMBER_SUCCESS':
    case 'UPDATE_MEMBER_STATUS_SUCCESS':
      return {
        ...state,
        loading: false,
        members: state.members.map((member: any) =>
          member._id.$oid === action.payload._id?.$oid || member._id.$oid === action.payload._id
            ? { ...member, ...action.payload }
            : member
        ),
        error: null,
      };
    case 'UPDATE_MEMBER_FAILURE':
    case 'UPDATE_MEMBER_STATUS_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
}

