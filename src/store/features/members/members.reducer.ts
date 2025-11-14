import type { MembersState } from "./members.types";

const initialState  : MembersState= {
  members: [],
  loading: false,
  error: null,
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
        members: action.payload,        
        
      };
    case 'FETCH_MEMBERS_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
}

