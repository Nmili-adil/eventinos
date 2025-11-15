import { fetchRightsApi } from "@/api/rightsApi";
import { FETCH_RIGHTS_FAILURE, FETCH_RIGHTS_SUCCESS, type FetchRightsRequestAction } from "./rights.types";

export const fetchRightsRequest = (): FetchRightsRequestAction => {
  return async (dispatch: any) => {
    dispatch({ type: 'FETCH_RIGHTS_REQUEST' });
    try {
      const response = await fetchRightsApi();
      console.log(response);
      if (response && response.status === 200) {
        dispatch({
          type: FETCH_RIGHTS_SUCCESS,
          payload: response.data.data,
        });
      } else {
        dispatch({
          type: FETCH_RIGHTS_FAILURE,
          payload: response ? response.data.message : 'Failed to fetch rights',
        });
      }
    } catch (error: any) {
      dispatch({
        type: FETCH_RIGHTS_FAILURE,
        payload: error.message || 'Failed to fetch rights',
      });
    }
  };
};

