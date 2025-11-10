import { fetchCategories } from "@/api/categoriesApi"
import { FETCH_CATEGORIES_FAILURE, FETCH_CATEGORIES_REQUEST, FETCH_CATEGORIES_SUCCESS, FETCH_CATEGORY_BY_ID_FAILURE, FETCH_CATEGORY_BY_ID_REQUEST, FETCH_CATEGORY_BY_ID_SUCCESS, type FetchCategoriesFailureAction, type FetchCategoriesRequestAction, type FetchCategoriesSuccessAction, type FetchCategoryByIdFailureAction, type FetchCategoryByIdRequestAction, type FetchCategoryByIdSuccessAction } from "./categories.types"
import { UPDATE_EVENT_FAILURE, UPDATE_EVENT_REQUEST, UPDATE_EVENT_SUCCESS, type UpdateEventFailureAction, type UpdateEventRequestAction, type UpdateEventSuccessAction } from "../events/events.type"

export const fetchCategoriesRequest = (): FetchCategoriesRequestAction => {
  return async (dispatch: any) => {
    dispatch({ type: FETCH_CATEGORIES_REQUEST })
    try {
      const response = await fetchCategories()
      console.log(response)
      if (response.status === 200) {
        dispatch(fetchCategoriesSuccess(response.data.data))
      } else {
        dispatch(fetchCategoriesFailure(response.data.message))
      }
    } catch (error: any) {
      dispatch(fetchCategoriesFailure(error.response?.data?.message || error.message || 'Fetch categories failed'))
    }
  }
}

const fetchCategoriesSuccess = (payload: any): FetchCategoriesSuccessAction => {
  return {
    type: FETCH_CATEGORIES_SUCCESS,
    payload,
  }
}

const fetchCategoriesFailure = (payload: string): FetchCategoriesFailureAction => {
  return {
    type: FETCH_CATEGORIES_FAILURE,
    payload,
  }
}

export const fetchCategoryByIdRequest = (payload: string): FetchCategoryByIdRequestAction => {
  return {
    type: FETCH_CATEGORY_BY_ID_REQUEST,
    payload,
  }
}

const fetchCategoryByIdSuccess = (payload: any): FetchCategoryByIdSuccessAction => {
  return {
    type: FETCH_CATEGORY_BY_ID_SUCCESS,
    payload,
  }
}

const fetchCategoryByIdFailure = (payload: string): FetchCategoryByIdFailureAction => {
  return {
    type: FETCH_CATEGORY_BY_ID_FAILURE,
    payload,
  }
}

export const updateCategoryRequest = (payload: any, eventId: string): UpdateEventRequestAction => {
  return {
    type: UPDATE_EVENT_REQUEST,
    payload,
    eventId,
  }
}

const updateCategorySuccess = (payload: any): UpdateEventSuccessAction => {
  return {
    type: UPDATE_EVENT_SUCCESS,
    payload,
  }
}

const updateCategoryFailure = (payload: string): UpdateEventFailureAction => {
  return {
    type: UPDATE_EVENT_FAILURE,
    payload,
  }
}
