export const FETCH_ATTENDANCE_REQUEST = 'FETCH_ATTENDANCE_REQUEST'
export const FETCH_ATTENDANCE_SUCCESS = 'FETCH_ATTENDANCE_SUCCESS'
export const FETCH_ATTENDANCE_FAILURE = 'FETCH_ATTENDANCE_FAILURE'

export const FETCH_ATTENDANCE_STATS_REQUEST = 'FETCH_ATTENDANCE_STATS_REQUEST'
export const FETCH_ATTENDANCE_STATS_SUCCESS = 'FETCH_ATTENDANCE_STATS_SUCCESS'
export const FETCH_ATTENDANCE_STATS_FAILURE = 'FETCH_ATTENDANCE_STATS_FAILURE'

export const FETCH_GUEST_SCANS_REQUEST = 'FETCH_GUEST_SCANS_REQUEST'
export const FETCH_GUEST_SCANS_SUCCESS = 'FETCH_GUEST_SCANS_SUCCESS'
export const FETCH_GUEST_SCANS_FAILURE = 'FETCH_GUEST_SCANS_FAILURE'

export const RESET_ATTENDANCE = 'RESET_ATTENDANCE'

export interface AttendanceRecord {
  _id: string
  guestId?: string
  fullName?: string
  email?: string
  phone?: string
  status?: string
  isPresent?: boolean
  firstCheckInAt?: string | null
  lastCheckInAt?: string | null
  scanCount?: number
}

export interface AttendanceStats {
  registered: number
  accepted: number
  present: number
  absent: number
  totalScans: number
  attendanceRate: number
  checkInsByHour: { hour: string; count: number }[]
}

export interface GuestScan {
  _id?: string
  scannedAt: string
  result: string
  scannedBy?: string | { firstName?: string; lastName?: string; fullName?: string }
}

export interface AttendancePagination {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface AttendanceError {
  message: string
  status?: number
}

export interface AttendanceState {
  records: AttendanceRecord[]
  pagination: AttendancePagination | null
  stats: AttendanceStats | null
  scans: GuestScan[]
  isLoadingRecords: boolean
  isLoadingStats: boolean
  isLoadingScans: boolean
  error: AttendanceError | null
  scansError: string | null
}

export type AttendanceAction =
  | { type: typeof FETCH_ATTENDANCE_REQUEST; silent: boolean }
  | { type: typeof FETCH_ATTENDANCE_SUCCESS; payload: { records: AttendanceRecord[]; pagination: AttendancePagination | null } }
  | { type: typeof FETCH_ATTENDANCE_FAILURE; payload: AttendanceError; silent: boolean }
  | { type: typeof FETCH_ATTENDANCE_STATS_REQUEST; silent: boolean }
  | { type: typeof FETCH_ATTENDANCE_STATS_SUCCESS; payload: AttendanceStats }
  | { type: typeof FETCH_ATTENDANCE_STATS_FAILURE; payload: AttendanceError; silent: boolean }
  | { type: typeof FETCH_GUEST_SCANS_REQUEST }
  | { type: typeof FETCH_GUEST_SCANS_SUCCESS; payload: GuestScan[] }
  | { type: typeof FETCH_GUEST_SCANS_FAILURE; payload: string }
  | { type: typeof RESET_ATTENDANCE }
