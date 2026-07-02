import {
  fetchSponsorCategoriesApi,
  fetchAllSponsorCategoriesApi,
  createSponsorCategoryApi,
  updateSponsorCategoryApi,
  deleteSponsorCategoryApi,
} from "@/api/sponsorCategoriesApi"
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
} from "./sponsorCategories.types"

export const fetchSponsorCategoriesRequest = (
  page: number = 1,
  pageSize: number = 10,
  sort?: string,
  search?: string
) => {
  return async (dispatch: any) => {
    dispatch({ type: FETCH_SPONSOR_CATEGORIES_REQUEST })
    try {
      const response = await fetchSponsorCategoriesApi(page, pageSize, sort, search)
      if (response?.status === 200) {
        dispatch({
          type: FETCH_SPONSOR_CATEGORIES_SUCCESS,
          payload: {
            sponsorCategories: response.data.data,
            count: response.data.count,
            pagination: response.data.pagination,
          },
        })
      }
    } catch (error: any) {
      dispatch({
        type: FETCH_SPONSOR_CATEGORIES_FAILURE,
        payload: error.response?.data?.message || error.message || 'Fetch sponsor categories failed',
      })
    }
  }
}

export const fetchAllSponsorCategoriesRequest = () => {
  return async (dispatch: any) => {
    dispatch({ type: FETCH_ALL_SPONSOR_CATEGORIES_REQUEST })
    try {
      const response = await fetchAllSponsorCategoriesApi()
      if (response?.status === 200) {
        dispatch({
          type: FETCH_ALL_SPONSOR_CATEGORIES_SUCCESS,
          payload: response.data.data,
        })
      }
    } catch (error: any) {
      dispatch({
        type: FETCH_ALL_SPONSOR_CATEGORIES_FAILURE,
        payload: error.response?.data?.message || error.message || 'Fetch sponsor categories failed',
      })
    }
  }
}

export const createSponsorCategoryRequest = (data: { name: string }) => {
  return async (dispatch: any) => {
    dispatch({ type: CREATE_SPONSOR_CATEGORY_REQUEST })
    try {
      const response = await createSponsorCategoryApi(data)
      dispatch({ type: CREATE_SPONSOR_CATEGORY_SUCCESS, payload: response.data.data })
      dispatch(fetchSponsorCategoriesRequest())
      return response.data
    } catch (error: any) {
      dispatch({
        type: CREATE_SPONSOR_CATEGORY_FAILURE,
        payload: error.response?.data?.message || error.message || 'Create sponsor category failed',
      })
      throw error
    }
  }
}

export const updateSponsorCategoryRequest = (id: string, data: { name: string }) => {
  return async (dispatch: any) => {
    dispatch({ type: UPDATE_SPONSOR_CATEGORY_REQUEST })
    try {
      const response = await updateSponsorCategoryApi(id, data)
      dispatch({ type: UPDATE_SPONSOR_CATEGORY_SUCCESS, payload: response.data.data })
      dispatch(fetchSponsorCategoriesRequest())
      return response.data
    } catch (error: any) {
      dispatch({
        type: UPDATE_SPONSOR_CATEGORY_FAILURE,
        payload: error.response?.data?.message || error.message || 'Update sponsor category failed',
      })
      throw error
    }
  }
}

export const deleteSponsorCategoryRequest = (id: string) => {
  return async (dispatch: any) => {
    dispatch({ type: DELETE_SPONSOR_CATEGORY_REQUEST })
    try {
      await deleteSponsorCategoryApi(id)
      dispatch({ type: DELETE_SPONSOR_CATEGORY_SUCCESS, payload: id })
      dispatch(fetchSponsorCategoriesRequest())
    } catch (error: any) {
      dispatch({
        type: DELETE_SPONSOR_CATEGORY_FAILURE,
        payload: error.response?.data?.message || error.message || 'Delete sponsor category failed',
      })
      throw error
    }
  }
}
