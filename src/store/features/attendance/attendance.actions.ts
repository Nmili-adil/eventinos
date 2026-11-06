import {
  fetchEventAttendanceApi,
  fetchEventAttendanceStatsApi,
  fetchGuestScansApi,
  type AttendanceQuery,
} from "@/api/attendanceApi"
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
  type AttendancePagination,
} from "./attendance.types"

// The store outlives the tab: clear it so another event's numbers never show.
export const resetAttendance = () => ({ type: RESET_ATTENDANCE })

const toAttendanceError = (error: any) => ({
  message: error?.response?.data?.message || error?.message || "Attendance request failed",
  status: error?.response?.status,
})

const readPagination = (response: any, query: AttendanceQuery, count: number): AttendancePagination => {
  if (response?.pagination) return response.pagination
  const pageSize = query.limit ?? count
  const totalItems = response?.total ?? count
  const currentPage = query.page ?? 1
  const totalPages = pageSize > 0 ? Math.ceil(totalItems / pageSize) : 1
  return {
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  }
}

// A slower response must not replace a newer one: the filters may have changed
// while a background refresh was still on its way.
let latestRecordsRequest = 0

// `silent` is for background refreshes: no loader, and a failure keeps what is shown.
export const fetchAttendanceRequest = (eventId: string, query: AttendanceQuery, silent = false) => {
  return async (dispatch: any) => {
    const requestId = ++latestRecordsRequest
    dispatch({ type: FETCH_ATTENDANCE_REQUEST, silent })
    try {
      const response = await fetchEventAttendanceApi(eventId, query)
      if (requestId !== latestRecordsRequest) return
      const data = response?.data ?? response
      const records = Array.isArray(data) ? data : []
      dispatch({
        type: FETCH_ATTENDANCE_SUCCESS,
        payload: { records, pagination: readPagination(response, query, records.length) },
      })
    } catch (error: any) {
      if (requestId !== latestRecordsRequest) return
      dispatch({ type: FETCH_ATTENDANCE_FAILURE, payload: toAttendanceError(error), silent })
    }
  }
}

let latestStatsRequest = 0

export const fetchAttendanceStatsRequest = (eventId: string, silent = false) => {
  return async (dispatch: any) => {
    const requestId = ++latestStatsRequest
    dispatch({ type: FETCH_ATTENDANCE_STATS_REQUEST, silent })
    try {
      const stats = await fetchEventAttendanceStatsApi(eventId)
      if (requestId !== latestStatsRequest) return
      dispatch({ type: FETCH_ATTENDANCE_STATS_SUCCESS, payload: stats })
    } catch (error: any) {
      if (requestId !== latestStatsRequest) return
      dispatch({ type: FETCH_ATTENDANCE_STATS_FAILURE, payload: toAttendanceError(error), silent })
    }
  }
}

export const fetchGuestScansRequest = (eventId: string, guestId: string) => {
  return async (dispatch: any) => {
    dispatch({ type: FETCH_GUEST_SCANS_REQUEST })
    try {
      const scans = await fetchGuestScansApi(eventId, guestId)
      dispatch({ type: FETCH_GUEST_SCANS_SUCCESS, payload: scans })
    } catch (error: any) {
      dispatch({ type: FETCH_GUEST_SCANS_FAILURE, payload: toAttendanceError(error).message })
    }
  }
}
