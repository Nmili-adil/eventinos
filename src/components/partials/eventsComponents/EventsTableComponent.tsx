// components/events/events-table.tsx
'use client'

import { useState, useMemo } from 'react'
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
import LoadingComponent from '@/components/shared/loadingComponent'
import type { AppDispatch } from '@/store/app/store'
import { deleteEventRequest, updateEventStatusRequest } from '@/store/features/events/events.actions'
import { DeleteDialog } from '@/components/shared/alert-dialog-reusable'
import { toast } from 'sonner'
import PageHead from '@/components/shared/page-head'
import { StatusChangeDialog } from './StatusChangeDialog'
import { EventsCalendarView } from './EventsCalendarView'
 import { EventsMapView } from './EventsMapView'
import type { EventStatus } from '@/types/eventsTypes'
import { useTranslation } from 'react-i18next'

const PAGE_SIZE = 10

type ViewMode = 'table' | 'calendar' | 'maps'

export function EventsTable() {
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const { events, isLoading } = useSelector((state: RootState) => state.events)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { t } = useTranslation()

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
  
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: PAGE_SIZE,
    totalItems: 0
  })

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

  // Use events directly from Redux store instead of local state
  let eventsData = events || []

  // Filter and sort events
  const processedEvents = useMemo(() => {
    const filtered = filterEvents(eventsData, filters)
    const sorted = sortEvents(filtered, sort.field, sort.direction)
    
    // Update total items for pagination
    setPagination(prev => ({ 
      ...prev, 
      totalItems: sorted.length,
      currentPage: prev.currentPage > Math.ceil(sorted.length / prev.pageSize) ? 1 : prev.currentPage
    }))
    
    return sorted
  }, [eventsData, filters, sort.field, sort.direction])

  // Paginate events
  const paginatedEvents = useMemo(() => {
    return paginateEvents(processedEvents, pagination.currentPage, pagination.pageSize)
  }, [processedEvents, pagination.currentPage, pagination.pageSize])

  const handleSort = (field: EventsSort['field']) => {
    setSort(prev => ({
      field,
      direction: prev.field === field ? (prev.direction === 'asc' ? 'desc' : 'asc') : 'asc'
    }))
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
  }

  const handleResetFilters = () => {
    setFilters({ search: '', status: 'all', type: 'all', startDate: null, endDate: null })
    setPagination(prev => ({ ...prev, currentPage: 1 }))
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
      eventsData = eventsData.map(event => event._id === eventId ? {...event, status: newStatus} : event)
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
        <LoadingComponent />
      </div>
    )
  }




  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHead 
          title={t('events.title')} 
          icon={List} 
          description={t('events.eventDescription')}
          total={0}
        />
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="gap-2"
            >
              <Table2 className="h-4 w-4" />
              <span className="hidden sm:inline">{t('events.view.table')}</span>
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="gap-2"
            >
              <CalendarIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{t('events.view.calendar')}</span>
            </Button>
            <Button
              variant={viewMode === 'maps' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('maps')}
              className="gap-2"
            >
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">{t('events.view.maps')}</span>
            </Button>
          </div>
          <Button 
            onClick={() => navigate(EVENT_ADD_PAGE)}
            className="flex items-center gap-2"
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
          <div className="border border-slate-300 shadow-md rounded-lg overflow-hidden">
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

            {/* Empty State */}
            {paginatedEvents.length === 0 && !isLoading && (
              <EmptyState onResetFilters={handleResetFilters} />
            )}
          </div>

          {/* Pagination */}
          {processedEvents.length > 0 && (
            <EventsPagination 
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
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