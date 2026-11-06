import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import { format } from "date-fns"
import { AlertTriangle, Check, Minus, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import CheckInsByHourChart from "@/components/charts/CheckInsByHourChart"
import { MembersPagination } from "@/components/partials/membersComponents/MembersPagination"
import { combineDateTime } from "@/lib/events-utils"
import type { AppDispatch } from "@/store/app/store"
import type { RootState } from "@/store/app/rootReducer"
import {
  fetchAttendanceRequest,
  fetchAttendanceStatsRequest,
  fetchGuestScansRequest,
  resetAttendance,
} from "@/store/features/attendance/attendance.actions"
import type { AttendanceRecord } from "@/store/features/attendance/attendance.types"

const PAGE_SIZE = 20
const REFRESH_INTERVAL_MS = 30_000
const SEARCH_DEBOUNCE_MS = 300

type PresenceFilter = "all" | "present" | "absent"

const formatDateTime = (value?: string | null) => {
  if (!value) return "—"
  const date = new Date(value)
  return isNaN(date.getTime()) ? "—" : format(date, "dd/MM/yyyy HH:mm")
}

const getScannerName = (scannedBy: any): string => {
  if (!scannedBy) return "—"
  if (typeof scannedBy === "string") return scannedBy
  return (
    scannedBy.fullName ||
    [scannedBy.firstName, scannedBy.lastName].filter(Boolean).join(" ") ||
    "—"
  )
}

interface EventAttendanceSectionProps {
  eventId: string
  startDate?: { date?: string; time?: string }
  endDate?: { date?: string; time?: string }
}

export const EventAttendanceSection = ({ eventId, startDate, endDate }: EventAttendanceSectionProps) => {
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const {
    records,
    pagination,
    stats,
    scans,
    isLoadingRecords,
    isLoadingStats,
    isLoadingScans,
    error,
    scansError,
  } = useSelector((state: RootState) => state.attendance)

  const [page, setPage] = useState(1)
  const [presence, setPresence] = useState<PresenceFilter>("all")
  const [search, setSearch] = useState("")
  const [appliedSearch, setAppliedSearch] = useState("")
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null)

  const query = {
    page,
    limit: PAGE_SIZE,
    ...(presence !== "all" && { present: presence === "present" }),
    ...(appliedSearch && { search: appliedSearch }),
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedSearch(search.trim())
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    dispatch(resetAttendance())
    dispatch(fetchAttendanceStatsRequest(eventId))
  }, [eventId, dispatch])

  useEffect(() => {
    dispatch(fetchAttendanceRequest(eventId, query))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, page, presence, appliedSearch, dispatch])

  // Refresh in the background only while the event runs and the page is visible.
  useEffect(() => {
    const start = combineDateTime(startDate?.date, startDate?.time)
    const end = combineDateTime(endDate?.date, endDate?.time)
    if (!start || !end) return

    const timer = setInterval(() => {
      const now = new Date()
      if (document.visibilityState !== "visible" || now < start || now > end) return
      dispatch(fetchAttendanceStatsRequest(eventId, true))
      dispatch(fetchAttendanceRequest(eventId, query, true))
    }, REFRESH_INTERVAL_MS)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, startDate?.date, startDate?.time, endDate?.date, endDate?.time, page, presence, appliedSearch, dispatch])

  const openScans = (record: AttendanceRecord) => {
    setSelectedRecord(record)
    dispatch(fetchGuestScansRequest(eventId, record.guestId ?? record._id))
  }

  const reload = () => {
    dispatch(fetchAttendanceStatsRequest(eventId))
    dispatch(fetchAttendanceRequest(eventId, query))
  }

  if (error) {
    const isUnavailable = error.status === 404
    return (
      <div className="rounded-md border border-dashed border-muted-foreground/40 p-8 text-center space-y-3">
        <p className="text-sm text-muted-foreground">
          {isUnavailable ? t("events.attendance.unavailable") : t("events.attendance.loadFailed")}
        </p>
        {!isUnavailable && (
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={reload}>
            <RefreshCw className="h-4 w-4" />
            {t("common.retry", "Retry")}
          </Button>
        )}
      </div>
    )
  }

  const statCards = stats
    ? [
        { key: "registered", value: stats.registered },
        { key: "accepted", value: stats.accepted },
        { key: "present", value: stats.present },
        { key: "absent", value: stats.absent },
        { key: "attendanceRate", value: `${Math.round(stats.attendanceRate ?? 0)} %` },
        { key: "totalScans", value: stats.totalScans },
      ]
    : []

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {isLoadingStats && !stats
          ? Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-20 rounded-lg" />)
          : statCards.map(({ key, value }) => (
              <Card key={key} className="border-slate-200 py-3">
                <CardContent className="px-3">
                  <p className="text-2xl font-semibold">{value ?? 0}</p>
                  <p className="text-xs text-muted-foreground">{t(`events.attendance.stats.${key}`)}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      {stats && <CheckInsByHourChart data={stats.checkInsByHour ?? []} />}

      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          className="sm:max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("events.attendance.searchPlaceholder")}
          aria-label={t("events.attendance.searchPlaceholder")}
        />
        <Select
          value={presence}
          onValueChange={(value) => {
            setPresence(value as PresenceFilter)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("events.attendance.filterAll")}</SelectItem>
            <SelectItem value="present">{t("events.attendance.filterPresent")}</SelectItem>
            <SelectItem value="absent">{t("events.attendance.filterAbsent")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <Table>
          <TableHeader>
            <TableRow>
              {["name", "email", "phone", "status", "present", "firstEntry", "lastEntry", "scans"].map((column) => (
                <TableHead key={column} className="whitespace-nowrap">
                  {t(`events.attendance.columns.${column}`)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingRecords && records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <Skeleton className="h-8 w-full" />
                </TableCell>
              </TableRow>
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                  {t("events.attendance.empty")}
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => {
                const scanCount = record.scanCount ?? 0
                return (
                  <TableRow
                    key={record._id}
                    className="cursor-pointer"
                    tabIndex={0}
                    onClick={() => openScans(record)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        openScans(record)
                      }
                    }}
                  >
                    <TableCell className="font-medium whitespace-nowrap">{record.fullName || "—"}</TableCell>
                    <TableCell>{record.email || "—"}</TableCell>
                    <TableCell className="whitespace-nowrap">{record.phone || "—"}</TableCell>
                    <TableCell>
                      {record.status ? t(`members.status.${record.status.toLowerCase()}`, record.status) : "—"}
                    </TableCell>
                    <TableCell>
                      {record.isPresent ? (
                        <Badge variant="outline" className="gap-1 border-green-200 bg-green-100 text-green-800">
                          <Check className="h-3 w-3" />
                          {t("events.attendance.present")}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 text-muted-foreground">
                          <Minus className="h-3 w-3" />
                          {t("events.attendance.absent")}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{formatDateTime(record.firstCheckInAt)}</TableCell>
                    <TableCell className="whitespace-nowrap">{formatDateTime(record.lastCheckInAt)}</TableCell>
                    <TableCell>
                      {scanCount > 1 ? (
                        <Badge
                          variant="outline"
                          className="gap-1 border-amber-300 bg-amber-50 text-amber-800"
                          title={t("events.attendance.multipleScans")}
                        >
                          <AlertTriangle className="h-3 w-3" />
                          {scanCount}
                        </Badge>
                      ) : (
                        scanCount
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <MembersPagination
        pagination={pagination}
        onPageChange={setPage}
        entityLabel={t("events.attendance.entityLabel")}
      />

      <Dialog open={Boolean(selectedRecord)} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("events.attendance.scansTitle")}</DialogTitle>
            <DialogDescription>{selectedRecord?.fullName}</DialogDescription>
          </DialogHeader>
          {isLoadingScans ? (
            <Skeleton className="h-24 w-full" />
          ) : scansError ? (
            <p className="text-sm text-destructive">{scansError}</p>
          ) : scans.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{t("events.attendance.noScans")}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("events.attendance.scanColumns.time")}</TableHead>
                  <TableHead>{t("events.attendance.scanColumns.result")}</TableHead>
                  <TableHead>{t("events.attendance.scanColumns.scannedBy")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scans.map((scan, index) => (
                  <TableRow key={scan._id ?? index}>
                    <TableCell className="whitespace-nowrap">{formatDateTime(scan.scannedAt)}</TableCell>
                    <TableCell>{t(`events.attendance.scanResults.${scan.result}`, scan.result)}</TableCell>
                    <TableCell>{getScannerName(scan.scannedBy)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default EventAttendanceSection
