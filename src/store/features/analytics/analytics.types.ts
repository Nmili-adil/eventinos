export interface CityData {
  name: string;
  users: number;
  percentage: number;
  color: string;
}

export interface AnalyticsStatistics {
  byCity: CityData[] | null;
  byGender: any | null;
  byDates: any | null;
}

export interface AnalyticsType {
  statistics: AnalyticsStatistics;
  isLoading: boolean;
  error: string | null;
}

// Action types
export const FETCH_ANALYTICS_REQUEST = 'FETCH_ANALYTICS_REQUEST';
export const FETCH_ANALYTICS_SUCCESS = 'FETCH_ANALYTICS_SUCCESS';
export const FETCH_ANALYTICS_FAILURE = 'FETCH_ANALYTICS_FAILURE';

export interface FetchAnalyticsRequestAction {
  type: typeof FETCH_ANALYTICS_REQUEST;
}

export interface FetchAnalyticsSuccessAction {
  type: typeof FETCH_ANALYTICS_SUCCESS;
  payload: {
    byCity?: any;
    byGender?: any;
    byDates?: any;
  };
}

export interface FetchAnalyticsFailureAction {
  type: typeof FETCH_ANALYTICS_FAILURE;
  payload: string;
}

export type AnalyticsActionTypes = 
  | FetchAnalyticsRequestAction 
  | FetchAnalyticsSuccessAction 
  | FetchAnalyticsFailureAction;