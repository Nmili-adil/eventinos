import { CREATE_CATEGORY_FAILURE, CREATE_CATEGORY_REQUEST, CREATE_CATEGORY_SUCCESS, DELETE_CATEGORY_FAILURE, DELETE_CATEGORY_REQUEST, DELETE_CATEGORY_SUCCESS, FETCH_CATEGORIES_FAILURE, FETCH_CATEGORIES_REQUEST, FETCH_CATEGORIES_SUCCESS, FETCH_CATEGORY_BY_ID_FAILURE, FETCH_CATEGORY_BY_ID_REQUEST, FETCH_CATEGORY_BY_ID_SUCCESS, UPDATE_CATEGORY_FAILURE, UPDATE_CATEGORY_REQUEST, UPDATE_CATEGORY_SUCCESS, type CategoryActionTypes, type CategoryState } from "./categories.types";

const initialState: CategoryState = {
  categories: [],
  category: null,
  count: 0,
  isLoading: false,
  isUpdating: false,
  isCreating: false,
  isDeleted: false,
  error: null,
};

export const categoryReducer = (state = initialState, action: CategoryActionTypes) => {
  switch (action.type) {
    case FETCH_CATEGORIES_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case FETCH_CATEGORIES_SUCCESS:
      return {
        ...state,
        isLoading: false,
        categories: action.payload,
      };
    case FETCH_CATEGORIES_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case FETCH_CATEGORY_BY_ID_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case FETCH_CATEGORY_BY_ID_SUCCESS:
      return {
        ...state,
        isLoading: false,
        category: action.payload,
      };
    case FETCH_CATEGORY_BY_ID_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case UPDATE_CATEGORY_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case UPDATE_CATEGORY_SUCCESS:
      return {
        ...state,
        isLoading: false,
        category: action.payload,
      };
    case UPDATE_CATEGORY_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case CREATE_CATEGORY_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case CREATE_CATEGORY_SUCCESS:
      return {
        ...state,
        isLoading: false,
        category: action.payload,
      };
    case CREATE_CATEGORY_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case DELETE_CATEGORY_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case DELETE_CATEGORY_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isDeleted: true,
      };
    case DELETE_CATEGORY_FAILURE:
      return {
        ...state,
        isLoading: false,
        isDeleted: false,
        error: action.payload,
      };
    default:
      return state;
  }
};