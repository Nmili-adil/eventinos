export interface CategoryState {
  categories: any[]
  category: any | null
  count: number
  isLoading: boolean
  isUpdating: boolean
  isCreating: boolean
  isDeleted: boolean
  error: string | null
}

export const FETCH_CATEGORIES_REQUEST = 'FETCH_CATEGORIES_REQUEST'
export const FETCH_CATEGORIES_SUCCESS = 'FETCH_CATEGORIES_SUCCESS'
export const FETCH_CATEGORIES_FAILURE = 'FETCH_CATEGORIES_FAILURE'

export const FETCH_CATEGORY_BY_ID_REQUEST = 'FETCH_CATEGORY_BY_ID_REQUEST'
export const FETCH_CATEGORY_BY_ID_SUCCESS = 'FETCH_CATEGORY_BY_ID_SUCCESS'
export const FETCH_CATEGORY_BY_ID_FAILURE = 'FETCH_CATEGORY_BY_ID_FAILURE'

export const UPDATE_CATEGORY_REQUEST = 'UPDATE_CATEGORY_REQUEST'
export const UPDATE_CATEGORY_SUCCESS = 'UPDATE_CATEGORY_SUCCESS'
export const UPDATE_CATEGORY_FAILURE = 'UPDATE_CATEGORY_FAILURE'

export const CREATE_CATEGORY_REQUEST = 'CREATE_CATEGORY_REQUEST'
export const CREATE_CATEGORY_SUCCESS = 'CREATE_CATEGORY_SUCCESS'
export const CREATE_CATEGORY_FAILURE = 'CREATE_CATEGORY_FAILURE'

export const DELETE_CATEGORY_REQUEST = 'DELETE_CATEGORY_REQUEST'
export const DELETE_CATEGORY_SUCCESS = 'DELETE_CATEGORY_SUCCESS'
export const DELETE_CATEGORY_FAILURE = 'DELETE_CATEGORY_FAILURE'

export interface FetchCategoriesRequestAction {
  type: typeof FETCH_CATEGORIES_REQUEST
  payload: any
} 

export interface FetchCategoriesSuccessAction {
  type: typeof FETCH_CATEGORIES_SUCCESS
  payload: any
} 

export interface FetchCategoriesFailureAction {
  type: typeof FETCH_CATEGORIES_FAILURE
  payload: string
} 

export interface FetchCategoryByIdRequestAction {
  type: typeof FETCH_CATEGORY_BY_ID_REQUEST
  payload: string
} 

export interface FetchCategoryByIdSuccessAction {
  type: typeof FETCH_CATEGORY_BY_ID_SUCCESS
  payload: any
} 

export interface FetchCategoryByIdFailureAction {
  type: typeof FETCH_CATEGORY_BY_ID_FAILURE
  payload: string
} 


export interface UpdateCategoryRequestAction {
  type: typeof UPDATE_CATEGORY_REQUEST
  payload: any
}

export interface UpdateCategorySuccessAction {
  type: typeof UPDATE_CATEGORY_SUCCESS
  payload: any
}

export interface UpdateCategoryFailureAction {
  type: typeof UPDATE_CATEGORY_FAILURE
  payload: string
}

export interface CreateCategoryRequestAction {
  type: typeof CREATE_CATEGORY_REQUEST
  payload: any
}

export interface CreateCategorySuccessAction {
  type: typeof CREATE_CATEGORY_SUCCESS
  payload: any
}

export interface CreateCategoryFailureAction {
  type: typeof CREATE_CATEGORY_FAILURE
  payload: string
}

export interface DeleteCategoryRequestAction {
  type: typeof DELETE_CATEGORY_REQUEST
  payload: string
}

export interface DeleteCategorySuccessAction {
  type: typeof DELETE_CATEGORY_SUCCESS
}

export interface DeleteCategoryFailureAction {
  type: typeof DELETE_CATEGORY_FAILURE
  payload: string
}


export type CategoryActionTypes =
  | FetchCategoriesRequestAction
  | FetchCategoriesSuccessAction
  | FetchCategoriesFailureAction
  | FetchCategoryByIdRequestAction
  | FetchCategoryByIdSuccessAction
  | FetchCategoryByIdFailureAction
  | UpdateCategoryRequestAction
  | UpdateCategorySuccessAction
  | UpdateCategoryFailureAction
  | CreateCategoryRequestAction
  | CreateCategorySuccessAction
  | CreateCategoryFailureAction
  | DeleteCategoryRequestAction
  | DeleteCategorySuccessAction
  | DeleteCategoryFailureAction
