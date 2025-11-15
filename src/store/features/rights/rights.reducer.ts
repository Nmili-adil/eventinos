import { FETCH_RIGHTS_FAILURE, FETCH_RIGHTS_REQUEST, FETCH_RIGHTS_SUCCESS, type RightsState } from "./rights.types";

const initialState: RightsState = {
  rights: [],
  loading: false,
  error: null,
};

export const rightsReducer = (state = initialState, action: any): RightsState => {
  switch (action.type) {
    case FETCH_RIGHTS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_RIGHTS_SUCCESS:
      return {
        ...state,
        loading: false,
        rights: action.payload,
      };
    case FETCH_RIGHTS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

export default rightsReducer;

