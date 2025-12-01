import { fetchCategories, createCategory, updateCategory, deleteCategory } from "@/api/categoriesApi"
import { 
  FETCH_CATEGORIES_FAILURE, 
  FETCH_CATEGORIES_REQUEST, 
  FETCH_CATEGORIES_SUCCESS, 
  FETCH_CATEGORY_BY_ID_FAILURE, 
  FETCH_CATEGORY_BY_ID_REQUEST, 
  FETCH_CATEGORY_BY_ID_SUCCESS,
  UPDATE_CATEGORY_REQUEST,
  UPDATE_CATEGORY_SUCCESS,
  UPDATE_CATEGORY_FAILURE,
  CREATE_CATEGORY_REQUEST,
  CREATE_CATEGORY_SUCCESS,
  CREATE_CATEGORY_FAILURE,
  DELETE_CATEGORY_REQUEST,
  DELETE_CATEGORY_SUCCESS,
  DELETE_CATEGORY_FAILURE,
  type FetchCategoriesFailureAction, 
  type FetchCategoriesRequestAction, 
  type FetchCategoriesSuccessAction, 
  type FetchCategoryByIdFailureAction, 
  type FetchCategoryByIdRequestAction, 
  type FetchCategoryByIdSuccessAction,
  type UpdateCategoryRequestAction,
  type UpdateCategorySuccessAction,
  type UpdateCategoryFailureAction,
  type CreateCategoryRequestAction,
  type CreateCategorySuccessAction,
  type CreateCategoryFailureAction,
  type DeleteCategoryRequestAction,
  type DeleteCategorySuccessAction,
  type DeleteCategoryFailureAction
} from "./categories.types"

export const fetchCategoriesRequest = () => {
  return async (dispatch: any) => {
    dispatch({ type: FETCH_CATEGORIES_REQUEST })
    try {
      const response = await fetchCategories()
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

export const updateCategoryRequest = (categoryId: string, data: any) => {
  return async (dispatch: any) => {
    dispatch({ type: UPDATE_CATEGORY_REQUEST, payload: data })
    try {
      const response = await updateCategory(categoryId, data)
      if (response) {
        dispatch({ type: UPDATE_CATEGORY_SUCCESS, payload: response })
        dispatch(fetchCategoriesRequest())
      }
    } catch (error: any) {
      dispatch({ type: UPDATE_CATEGORY_FAILURE, payload: error.response?.data?.message || error.message || 'Update category failed' })
      throw error
    }
  }
}

export const createCategoryRequest = (data: any) => {
  return async (dispatch: any) => {
    dispatch({ type: CREATE_CATEGORY_REQUEST, payload: data })
    try {
      const response = await createCategory(data)
      if (response) {
        dispatch({ type: CREATE_CATEGORY_SUCCESS, payload: response })
        dispatch(fetchCategoriesRequest())
      }
    } catch (error: any) {
      dispatch({ type: CREATE_CATEGORY_FAILURE, payload: error.response?.data?.message || error.message || 'Create category failed' })
      throw error
    }
  }
}

export const deleteCategoryRequest = (categoryId: string) => {
  return async (dispatch: any) => {
    dispatch({ type: DELETE_CATEGORY_REQUEST, payload: categoryId })
    try {
      const response = await deleteCategory(categoryId)
      if (response) {
        dispatch({ type: DELETE_CATEGORY_SUCCESS })
        dispatch(fetchCategoriesRequest())
      }
    } catch (error: any) {
      dispatch({ type: DELETE_CATEGORY_FAILURE, payload: error.response?.data?.message || error.message || 'Delete category failed' })
      throw error
    }
  }
}
