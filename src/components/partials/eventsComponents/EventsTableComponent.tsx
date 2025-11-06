// components/events/events-table.tsx
'use client'

import { useState, useMemo, useEffect } from 'react'
import { Table, TableBody } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { filterEvents, sortEvents, paginateEvents } from '@/lib/events-utils'
import { TableHeader } from './table-header'
import { EventTableRow } from './table-row'
import { Filters } from './filters'
import { EventsPagination } from './pagination'
import { EmptyState } from './empty-state'
import type { EventsFilters, EventsSort, PaginationState } from '@/types/eventsTypes'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/app/rootReducer'
import { useNavigate } from 'react-router-dom'
import { EVENT_EDIT_PAGE } from '@/constants/routerConstants'

const PAGE_SIZE = 20

export function EventsTable() {
  const [eventsData, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const { events} = useSelector((state: RootState) => state.events)
  const navigate = useNavigate()

  const [filters, setFilters] = useState<EventsFilters>({
    search: '',
    status: 'all',
    type: 'all'
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

  // Fetch events on component mount
  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true)
      setEvents(events)
      setLoading(false)
    }
    
    loadEvents()
  }, [events])

  // Filter and sort events
  const processedEvents = useMemo(() => {
    const filtered = filterEvents(eventsData, filters)
    const sorted = sortEvents(filtered, sort.field, sort.direction)
    
    // Update total items for pagination
    setPagination(prev => ({ ...prev, totalItems: sorted.length }))
    
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
    setFilters({ search: '', status: 'all', type: 'all' })
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleEdit = (eventId: string) => {
      navigate(EVENT_EDIT_PAGE(eventId))
  }

  const handleChangeStatus = (eventId: string) => {
    console.log('Change status for event:', eventId)
  }

  const handlePreview = (eventId: string) => {
    console.log('Preview event:', eventId)
  }

  const handleDelete = (eventId: string) => {
    console.log('Delete event:', eventId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des événements...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Événements</h1>
          <p className="text-muted-foreground">
            Gérez tous les événements de votre organisation
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nouvel événement
        </Button>
      </div>

      {/* Filters */}
      <Filters filters={filters} onFiltersChange={setFilters} />

      {/* Table */}
      <div className="border border-slate-400 shadow-md rounded-lg overflow-hidden">
        <Table className=''>
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
                onDelete={handleDelete}
              />
            ))}
          </TableBody>
        </Table>

        {/* Empty State */}
        {paginatedEvents.length === 0 && !loading && (
          <EmptyState onResetFilters={handleResetFilters} />
        )}
      </div>

      {/* Pagination */}
      <EventsPagination 
        pagination={pagination}
        onPageChange={handlePageChange}
      />
    </div>
  )
}