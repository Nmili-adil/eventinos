import React, { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Clock, Eye, Edit, MoreVertical } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns'
import { cn } from '@/lib/utils'
import type { Event } from '@/types/eventsTypes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { getStatusColor, getStatusText } from '@/lib/events-utils'

interface EventsCalendarViewProps {
  events: Event[]
  onEventClick?: (event: Event) => void
  onEdit?: (eventId: string) => void
  onChangeStatus?: (eventId: string) => void
  onDelete?: (eventId: string, eventTitle: string) => void
}

export const EventsCalendarView: React.FC<EventsCalendarViewProps> = ({
  events,
  onEventClick,
  onEdit,
  onChangeStatus,
  onDelete,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  // Get month start and end
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  // Generate calendar days
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, Event[]> = {}
    events.forEach((event) => {
      if (event.startDate?.date) {
        try {
          const eventDate = new Date(event.startDate.date)
          const dateKey = format(eventDate, 'yyyy-MM-dd')
          if (!grouped[dateKey]) {
            grouped[dateKey] = []
          }
          grouped[dateKey].push(event)
        } catch (error) {
          console.error('Error parsing event date:', error)
        }
      }
    })
    return grouped
  }, [events])

  // Get events for a specific date
  const getEventsForDate = (date: Date): Event[] => {
    const dateKey = format(date, 'yyyy-MM-dd')
    return eventsByDate[dateKey] || []
  }

  // Navigation
  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(null)
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(date)
      setSelectedDate(date)
      setDatePickerOpen(false)
    }
  }

  // Get total events in current month
  const monthEventsCount = useMemo(() => {
    return Object.values(eventsByDate).reduce((sum, events) => sum + events.length, 0)
  }, [eventsByDate])

  return (
    <div className="space-y-6">
      {/* Header with Date Picker */}
      <Card className="border-slate-300 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousMonth}
                className="h-9 w-9 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[240px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(currentDate, 'MMMM yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate || currentDate}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Button
                variant="outline"
                size="sm"
                onClick={goToNextMonth}
                className="h-9 w-9 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
              >
                Today
              </Button>
              <Badge variant="secondary" className="px-3 py-1">
                {monthEventsCount} {monthEventsCount === 1 ? 'event' : 'events'} this month
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card className="border-slate-300 shadow-md">
        <CardContent className="p-6">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-semibold text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, dayIdx) => {
              const dayEvents = getEventsForDate(day)
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isToday = isSameDay(day, new Date())
              const isSelected = selectedDate && isSameDay(day, selectedDate)

              return (
                <div
                  key={dayIdx}
                  className={cn(
                    'min-h-[100px] md:min-h-[120px] border rounded-lg p-1.5 md:p-2 transition-all cursor-pointer',
                    isCurrentMonth
                      ? 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md hover:scale-[1.02]'
                      : 'bg-slate-50 border-slate-100 opacity-60',
                    isToday && 'ring-2 ring-blue-500 ring-offset-1 bg-blue-50/50',
                    isSelected && 'bg-blue-50 border-blue-400 shadow-md'
                  )}
                  onClick={() => setSelectedDate(day)}
                >
                  {/* Date Number */}
                  <div className="flex items-center justify-between mb-1">
                    <div
                      className={cn(
                        'text-xs md:text-sm font-medium',
                        isToday
                          ? 'text-blue-600 font-bold bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center'
                          : isCurrentMonth
                          ? 'text-gray-900'
                          : 'text-gray-400',
                        isSelected && !isToday && 'text-blue-700'
                      )}
                    >
                      {format(day, 'd')}
                    </div>
                    {dayEvents.length > 0 && (
                      <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                        {dayEvents.length}
                      </Badge>
                    )}
                  </div>

                  {/* Events */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <EventTicket
                        key={event._id}
                        event={event}
                        onClick={() => onEventClick?.(event)}
                        onEdit={() => onEdit?.(event._id)}
                        onChangeStatus={() => onChangeStatus?.(event._id)}
                        onDelete={() => onDelete?.(event._id, event.name || event.title)}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <button
                        className="text-[10px] text-blue-600 font-medium px-1 py-0.5 bg-blue-50 hover:bg-blue-100 rounded w-full transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedDate(day)
                        }}
                      >
                        +{dayEvents.length - 3} more
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Event Ticket Component
interface EventTicketProps {
  event: Event
  onClick?: () => void
  onEdit?: () => void
  onChangeStatus?: () => void
  onDelete?: () => void
}

const EventTicket: React.FC<EventTicketProps> = ({
  event,
  onClick,
  onEdit,
  onChangeStatus,
  onDelete,
}) => {
  const formatTime = (dateString: string) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return format(date, 'HH:mm')
    } catch {
      return ''
    }
  }

  const getEventColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200'
      case 'PENDING':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200'
      case 'REJECTED':
        return 'bg-red-100 border-red-300 text-red-800 hover:bg-red-200'
      case 'CANCELLED':
        return 'bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200'
      default:
        return 'bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200'
    }
  }

  return (
    <div
      className={cn(
        'group relative text-[10px] md:text-xs rounded border-l-3 cursor-pointer transition-all hover:shadow-sm hover:scale-[1.02]',
        getEventColor(event.status || 'PENDING')
      )}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
    >
      <div className="px-1 md:px-1.5 py-0.5 md:py-1">
        <div className="flex items-start justify-between gap-1">
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate leading-tight">{event.name || event.title}</div>
            {event.startDate?.date && (
              <div className="flex items-center gap-0.5 md:gap-1 mt-0.5 text-[9px] md:text-[10px] opacity-80">
                <Clock className="w-2 h-2 md:w-2.5 md:h-2.5 flex-shrink-0" />
                {formatTime(event.startDate.date)}
              </div>
            )}
            {event.location?.name && (
              <div className="flex items-center gap-0.5 md:gap-1 mt-0.5 text-[9px] md:text-[10px] opacity-80 truncate">
                <MapPin className="w-2 h-2 md:w-2.5 md:h-2.5 flex-shrink-0" />
                <span className="truncate">{event.location.name}</span>
              </div>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <button
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-black/10 rounded flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-2.5 h-2.5 md:w-3 md:h-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {onClick && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onClick() }}>
                  <Eye className="w-3 h-3 mr-2" />
                  View
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit() }}>
                  <Edit className="w-3 h-3 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {onChangeStatus && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onChangeStatus() }}>
                  Change Status
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onDelete() }}
                  className="text-red-600"
                >
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

