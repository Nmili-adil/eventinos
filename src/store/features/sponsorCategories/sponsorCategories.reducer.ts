import {
  FETCH_SPONSOR_CATEGORIES_REQUEST,
  FETCH_SPONSOR_CATEGORIES_SUCCESS,
  FETCH_SPONSOR_CATEGORIES_FAILURE,
  FETCH_ALL_SPONSOR_CATEGORIES_REQUEST,
  FETCH_ALL_SPONSOR_CATEGORIES_SUCCESS,
  FETCH_ALL_SPONSOR_CATEGORIES_FAILURE,
  CREATE_SPONSOR_CATEGORY_REQUEST,
  CREATE_SPONSOR_CATEGORY_SUCCESS,
  CREATE_SPONSOR_CATEGORY_FAILURE,
  UPDATE_SPONSOR_CATEGORY_REQUEST,
  UPDATE_SPONSOR_CATEGORY_SUCCESS,
  UPDATE_SPONSOR_CATEGORY_FAILURE,
  DELETE_SPONSOR_CATEGORY_REQUEST,
  DELETE_SPONSOR_CATEGORY_SUCCESS,
  DELETE_SPONSOR_CATEGORY_FAILURE,
  type SponsorCategoriesState,
} from "./sponsorCategories.types"

const initialState: SponsorCategoriesState = {
  sponsorCategories: [],
  all: [],
  sponsorCategory: null,
  count: 0,
  pagination: null,
  isLoading: false,
  isLoadingAll: false,
  isCreating: false,
  isUpdating: false,
  isDeleted: false,
  error: null,
}

export const sponsorCategoriesReducer = (state = initialState, action: any): SponsorCategoriesState => {
  switch (action.type) {
    case FETCH_SPONSOR_CATEGORIES_REQUEST:
      return { ...state, isLoading: true, error: null }
    case FETCH_SPONSOR_CATEGORIES_SUCCESS:
      return {
        ...state,
        isLoading: false,
        sponsorCategories: action.payload.sponsorCategories || [],
        count: action.payload.count || 0,
        pagination: action.payload.pagination || null,
      }
    case FETCH_SPONSOR_CATEGORIES_FAILURE:
      return { ...state, isLoading: false, error: action.payload }

    case FETCH_ALL_SPONSOR_CATEGORIES_REQUEST:
      return { ...state, isLoadingAll: true, error: null }
    case FETCH_ALL_SPONSOR_CATEGORIES_SUCCESS:
      return { ...state, isLoadingAll: false, all: action.payload || [] }
    case FETCH_ALL_SPONSOR_CATEGORIES_FAILURE:
      return { ...state, isLoadingAll: false, error: action.payload }

    case CREATE_SPONSOR_CATEGORY_REQUEST:
      return { ...state, isCreating: true, error: null }
    case CREATE_SPONSOR_CATEGORY_SUCCESS:
      return { ...state, isCreating: false, sponsorCategory: action.payload }
    case CREATE_SPONSOR_CATEGORY_FAILURE:
      return { ...state, isCreating: false, error: action.payload }

    case UPDATE_SPONSOR_CATEGORY_REQUEST:
      return { ...state, isUpdating: true, error: null }
    case UPDATE_SPONSOR_CATEGORY_SUCCESS:
      return { ...state, isUpdating: false, sponsorCategory: action.payload }
    case UPDATE_SPONSOR_CATEGORY_FAILURE:
      return { ...state, isUpdating: false, error: action.payload }

    case DELETE_SPONSOR_CATEGORY_REQUEST:
      return { ...state, isDeleted: false, error: null }
    case DELETE_SPONSOR_CATEGORY_SUCCESS:
      return { ...state, isDeleted: true }
    case DELETE_SPONSOR_CATEGORY_FAILURE:
      return { ...state, isDeleted: false, error: action.payload }

    default:
      return state
  }
}
