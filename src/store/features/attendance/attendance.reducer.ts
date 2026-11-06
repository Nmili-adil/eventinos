import {
  FETCH_ATTENDANCE_FAILURE,
  FETCH_ATTENDANCE_REQUEST,
  FETCH_ATTENDANCE_STATS_FAILURE,
  FETCH_ATTENDANCE_STATS_REQUEST,
  FETCH_ATTENDANCE_STATS_SUCCESS,
  FETCH_ATTENDANCE_SUCCESS,
  FETCH_GUEST_SCANS_FAILURE,
  FETCH_GUEST_SCANS_REQUEST,
  FETCH_GUEST_SCANS_SUCCESS,
  RESET_ATTENDANCE,
  type AttendanceAction,
  type AttendanceState,
} from "./attendance.types"

const initialState: AttendanceState = {
  records: [],
  pagination: null,
  stats: null,
  scans: [],
  isLoadingRecords: false,
  isLoadingStats: false,
  isLoadingScans: false,
  error: null,
  scansError: null,
}

export const attendanceReducer = (
  state = initialState,
  action: AttendanceAction
): AttendanceState => {
  switch (action.type) {
    case FETCH_ATTENDANCE_REQUEST:
      return action.silent ? state : { ...state, isLoadingRecords: true, error: null }
    case FETCH_ATTENDANCE_SUCCESS:
      return {
        ...state,
        isLoadingRecords: false,
        records: action.payload.records,
        pagination: action.payload.pagination,
      }
    case FETCH_ATTENDANCE_FAILURE:
      return action.silent ? state : { ...state, isLoadingRecords: false, error: action.payload }
    case FETCH_ATTENDANCE_STATS_REQUEST:
      return action.silent ? state : { ...state, isLoadingStats: true, error: null }
    case FETCH_ATTENDANCE_STATS_SUCCESS:
      return { ...state, isLoadingStats: false, stats: action.payload }
    case FETCH_ATTENDANCE_STATS_FAILURE:
      return action.silent ? state : { ...state, isLoadingStats: false, error: action.payload }
    case FETCH_GUEST_SCANS_REQUEST:
      return { ...state, isLoadingScans: true, scans: [], scansError: null }
    case FETCH_GUEST_SCANS_SUCCESS:
      return { ...state, isLoadingScans: false, scans: action.payload }
    case FETCH_GUEST_SCANS_FAILURE:
      return { ...state, isLoadingScans: false, scansError: action.payload }
    case RESET_ATTENDANCE:
      return initialState
    default:
      return state
  }
}
