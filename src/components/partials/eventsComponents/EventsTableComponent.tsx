// components/events/events-table.tsx
'use client'

import { useState, useMemo,useEffect } from 'react'
import { Table, TableBody } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { List, Plus, Calendar as CalendarIcon, Table2, MapPin } from 'lucide-react'
import { filterEvents, sortEvents, paginateEvents } from '@/lib/events-utils'
import { TableHeader } from './table-header'
import { EventTableRow } from './table-row'
import { Filters } from './filters'
import { EventsPagination } from './pagination'
import { EmptyState } from './empty-state'
import type { EventsFilters, EventsSort, PaginationState } from '@/types/eventsTypes'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/store/app/rootReducer'
import { useNavigate } from 'react-router-dom'
import { EVENT_ADD_PAGE, EVENT_DETAILS_PAGE, EVENT_EDIT_PAGE } from '@/constants/routerConstants'
import type { AppDispatch } from '@/store/app/store'
import { deleteEventRequest, fetchEventsRequest, updateEventStatusRequest } from '@/store/features/events/events.actions'
import { DeleteDialog } from '@/components/shared/alert-dialog-reusable'
import { toast } from 'sonner'
import PageHead from '@/components/shared/page-head'
import { StatusChangeDialog } from './StatusChangeDialog'
import { EventsCalendarView } from './EventsCalendarView'
 import { EventsMapView } from './EventsMapView'
import type { EventStatus } from '@/types/eventsTypes'
import { useTranslation } from 'react-i18next'
import EventsTableSkeleton from './EventsTableSkeleton'
import { getLayoutPreferences, setLayoutPreferences, type EventLayout } from '@/services/localStorage'

const PAGE_SIZE = 10

export function EventsTable() {
  const [viewMode, setViewMode] = useState<EventLayout>(getLayoutPreferences().eventsLayout)
  const { events, isLoading, pagination: backendPagination } = useSelector((state: RootState) => state.events)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { t } = useTranslation()

  const setViewModeFunc = (mode: EventLayout) => {
    setViewMode(mode)
    setLayoutPreferences({ ...getLayoutPreferences(), eventsLayout: mode })
  }

  const [filters, setFilters] = useState<EventsFilters>({
    search: '',
    status: 'all',
    type: 'all',
    startDate: null,
    endDate: null,
  })
  
  const [sort, setSort] = useState<EventsSort>({
    field: 'startDate',
    direction: 'desc'
  })
  
  const [currentPage, setCurrentPage] = useState(1)
  
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    eventId: string | null
    eventTitle?: string
  }>({
    open: false,
    eventId: null,
    eventTitle: ''
  })

  const [statusDialog, setStatusDialog] = useState<{
    open: boolean
    eventId: string | null
    currentStatus: EventStatus | null
    eventName?: string
  }>({
    open: false,
    eventId: null,
    currentStatus: null,
    eventName: ''
  })

  const [statusLoading, setStatusLoading] = useState(false)

  // Fetch all events once when component mounts
  useEffect(() => {
    dispatch(fetchEventsRequest())
  }, [dispatch])

  // Use events directly from Redux store
  let eventsData = events || []

  // Filter, sort, and paginate events (all client-side)
  const processedEvents = useMemo(() => {
    const filtered = filterEvents(eventsData, filters)
    const sorted = sortEvents(filtered, sort.field, sort.direction)
    return sorted
  }, [eventsData, filters, sort.field, sort.direction])

  // Client-side pagination
  const paginatedEvents = useMemo(() => {
    return paginateEvents(processedEvents, currentPage, PAGE_SIZE)
  }, [processedEvents, currentPage])

  const totalItems = processedEvents.length
  const pagination: PaginationState = {
    currentPage,
    pageSize: PAGE_SIZE,
    totalItems
  }

  const handleSort = (field: EventsSort['field']) => {
    setSort(prev => ({
      field,
      direction: prev.field === field ? (prev.direction === 'asc' ? 'desc' : 'asc') : 'asc'
    }))
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleResetFilters = () => {
    setFilters({ search: '', status: 'all', type: 'all', startDate: null, endDate: null })
    setCurrentPage(1)
  }

  const handleEdit = (eventId: string) => {
    navigate(EVENT_EDIT_PAGE(eventId))
  }

  const handleChangeStatus = (eventId: string) => {
    const event = eventsData.find(e => e._id === eventId)
    if (event) {
      setStatusDialog({
        open: true,
        eventId,
        currentStatus: event.status as EventStatus,
        eventName: event.name || event.title
      })
    }
  }

  const handleConfirmStatusChange = async (newStatus: EventStatus) => {
    if (!statusDialog.eventId) return

    const eventId = statusDialog.eventId
    setStatusLoading(true)
    
    try {
      await dispatch(updateEventStatusRequest(eventId, newStatus))
      // Refetch events to update UI immediately
      await dispatch(fetchEventsRequest())
      toast.success('Event status updated successfully')
      setStatusDialog({ open: false, eventId: null, currentStatus: null })
    } catch (error: any) {
      toast.error(error.message || 'Failed to update event status')
    } finally {
      setStatusLoading(false)
    }
  }

  const handlePreview = (eventId: string) => {
    navigate(EVENT_DETAILS_PAGE(eventId))
  }

  const handleDelete = (eventId: string, eventTitle: string) => {
    setDeleteDialog({ open: true, eventId, eventTitle })
  }

  const handleConfirmDelete = async () => {
    if (!deleteDialog.eventId) return
    
    setDeleteLoading(true)
    try {
      await dispatch(deleteEventRequest(deleteDialog.eventId))
      setDeleteDialog({ open: false, eventId: null, eventTitle: '' })
      // The toast is handled by the promise in the dispatch
    } catch (error) {
      console.error('Failed to delete event:', error)
      toast.error(t('events.deleteError'))
    } finally {
      setDeleteLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className='h-screen w-full flex items-center justify-center'>
        <EventsTableSkeleton />
      </div>
    )
  }




  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-start md:justify-between lg:justify-between items-start gap-4">
        <PageHead 
          title={t('events.title')} 
          icon={List} 
          description={t('events.eventDescription')}
          total={0}
        />
        <div className="flex items-center gap-3 justify-evenly flex-wrap">
          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewModeFunc('table')}
              className="gap-2 transition-all duration-200"
            >
              <Table2 className="h-4 w-4" />
              <span className="hidden sm:inline">{t('events.view.table')}</span>
            </Button>
            <Button
              variant={viewMode === 'calender' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewModeFunc('calender')}
              className="gap-2 transition-all duration-200"
            >
              <CalendarIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{t('events.view.calendar')}</span>
            </Button>
            <Button
              variant={viewMode === 'maps' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewModeFunc('maps')}
              className="gap-2 transition-all duration-200"
            >
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">{t('events.view.maps')}</span>
            </Button>
          </div>
          <Button 
            onClick={() => navigate(EVENT_ADD_PAGE)}
            className="flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            {t('events.addEvent')}
          </Button>
        </div>
      </div>

      {/* Filters - Only show for table view */}
      {viewMode === 'table' && (
        <Filters 
          filters={filters} 
          onFiltersChange={setFilters} 
        />
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <>
          <div className="border border-slate-200 shadow-lg rounded-xl overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader 
                  sortField={sort.field}
                  sortDirection={sort.direction}
                  onSort={handleSort}
                />
                <TableBody>
                  {paginatedEvents.map((event) => (
                    <EventTableRow
                      key={event._id}
                      event={event}
                      onEdit={handleEdit}
                      onChangeStatus={handleChangeStatus}
                      onPreview={handlePreview}
                      onDelete={() => handleDelete(event._id, event.title || event.name || '')}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Empty State */}
            {processedEvents.length === 0 && !isLoading && (
              <EmptyState onResetFilters={handleResetFilters} />
            )}
          </div>

          {/* Pagination */}
          {totalItems > 0 && (
            <EventsPagination 
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* Calendar View */}
      {viewMode === 'calender' && (
        <EventsCalendarView
          events={processedEvents}
          onEventClick={(event) => handlePreview(event._id)}
          onEdit={handleEdit}
          onChangeStatus={handleChangeStatus}
          onDelete={handleDelete}
        />
      )}

      {/* Maps View */}
      {viewMode === 'maps' && (
        <EventsMapView
          events={processedEvents}
          onEventClick={(event) => handlePreview(event._id)}
          onEdit={handleEdit}
          onChangeStatus={handleChangeStatus}
          onDelete={handleDelete}
        />
      )}

      {/* Dialogs - Render at root level */}
      <DeleteDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
        onConfirm={handleConfirmDelete}
        eventTitle={deleteDialog.eventTitle}
        isLoading={deleteLoading}
      />

      <StatusChangeDialog
        open={statusDialog.open}
        onOpenChange={(open) => setStatusDialog(prev => ({ ...prev, open }))}
        currentStatus={statusDialog.currentStatus || 'PENDING'}
        onConfirm={handleConfirmStatusChange}
        isLoading={statusLoading}
        eventName={statusDialog.eventName}
      />
    </div>
  )
}