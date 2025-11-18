
import type { Event, EventStatus, SortDirection, SortField } from "@/types/eventsTypes"

export const getStatusColor = (status: EventStatus): string => {
  switch (status) {
    case 'ACCEPTED':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'REFUSED':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'CLOSED':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}


// export const getStatusText = (status: EventStatus): string => {
//   switch (status) {
//     case 'ACCEPTED':
//       return 'Accepté'
//     case 'PENDING':
//       return 'En attente'
//     case 'REFUSED':
//       return 'Rejeté'
//     case 'CLOSED':
//       return 'Fermé'
//     default:
//       return status
//   }
// }

// export const getTypeText = (type: string): string => {
//   switch (type) {
//     case 'FACETOFACE':
//       return 'Présentiel'
//     case 'ONLINE':
//       return 'En ligne'
//     case 'HYBRID':
//       return 'Hybride'
//     default:
//       return type
//   }
// }

// export const getVisibilityText = (visibility: string): string => {
//   switch (visibility) {
//     case 'PUBLIC':
//       return 'Publique'
//     case 'PRIVATE':
//       return 'Privée'
//     default:
//       return visibility
//   }
// }

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR')
}

export const filterEvents = (
  events: Event[],
  filters: { search: string; status: string; type: string }
): Event[] => {
  return events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         event.location.city.toLowerCase().includes(filters.search.toLowerCase()) ||
                         event.location.country.toLowerCase().includes(filters.search.toLowerCase())
    const matchesStatus = filters.status === 'all' || event.status === filters.status
    const matchesType = filters.type === 'all' || event.type === filters.type
    
    return matchesSearch && matchesStatus && matchesType
  })
}

export const sortEvents = (events: Event[], sortField: SortField, sortDirection: SortDirection): Event[] => {
  return [...events].sort((a, b) => {
    let aValue: any
    let bValue: any

    switch (sortField) {
      case 'startDate':
      case 'endDate':
        // Handle date objects
        aValue = new Date(a[sortField].date)
        bValue = new Date(b[sortField].date)
        break
      case 'location':
        // Sort by city name
        aValue = a.location.city
        bValue = b.location.city
        break
      default:
        // For other fields, use the value directly
        aValue = a[sortField]
        bValue = b[sortField]
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })
}

export const paginateEvents = (events: Event[], currentPage: number, pageSize: number): Event[] => {
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  return events.slice(startIndex, endIndex)
}

export const transformEventForTable = (event: Event) => {
  return {
    id: event._id,
    name: event.name,
    type: event.type,
    website: event.visibility,
    location: `${event.location.city}, ${event.location.country}`,
    startDate: formatDate(event.startDate.date),
    endDate: formatDate(event.endDate.date),
    status: event.status,
    rawEvent: event // Keep the original event data for details
  }
}


// export interface EventsFilterOptions {
//   search: string
//   status: string
//   type: string
//   visibility: string
//   city: string
//   country: string
//   dateRange: {
//     start: string
//     end: string
//   }
//   category: string
// }

// export const filterEvents = (
//   events: Event[],
//   filters: EventsFilterOptions
// ): Event[] => {
//   return events.filter(event => {
//     // Search filter
//     const matchesSearch = !filters.search || 
//       event.name.toLowerCase().includes(filters.search.toLowerCase()) ||
//       event.location.city.toLowerCase().includes(filters.search.toLowerCase()) ||
//       event.location.country.toLowerCase().includes(filters.search.toLowerCase()) ||
//       event.description.toLowerCase().includes(filters.search.toLowerCase())

//     // Status filter
//     const matchesStatus = filters.status === 'all' || event.status === filters.status

//     // Type filter
//     const matchesType = filters.type === 'all' || event.type === filters.type

//     // Visibility filter
//     const matchesVisibility = filters.visibility === 'all' || event.visibility === filters.visibility

//     // City filter
//     const matchesCity = !filters.city || event.location.city.toLowerCase().includes(filters.city.toLowerCase())

//     // Country filter
//     const matchesCountry = !filters.country || event.location.country.toLowerCase().includes(filters.country.toLowerCase())

//     // Date range filter
//     const eventStartDate = new Date(event.startDate.date)
//     const matchesDateRange = !filters.dateRange.start || !filters.dateRange.end || (
//       eventStartDate >= new Date(filters.dateRange.start) && 
//       eventStartDate <= new Date(filters.dateRange.end)
//     )

//     // Category filter
//     const matchesCategory = !filters.category || event.category.name.toLowerCase().includes(filters.category.toLowerCase())

//     return matchesSearch && matchesStatus && matchesType && matchesVisibility && 
//            matchesCity && matchesCountry && matchesDateRange && matchesCategory
//   })
// }

// // Advanced filter functions for specific use cases
// export const filterEventsByStatus = (events: Event[], status: EventStatus): Event[] => {
//   return events.filter(event => event.status === status)
// }

// export const filterEventsByType = (events: Event[], type: EventType): Event[] => {
//   return events.filter(event => event.type === type)
// }

// export const filterEventsByVisibility = (events: Event[], visibility: EventVisibility): Event[] => {
//   return events.filter(event => event.visibility === visibility)
// }

// export const filterEventsByLocation = (events: Event[], city?: string, country?: string): Event[] => {
//   return events.filter(event => {
//     const matchesCity = !city || event.location.city.toLowerCase().includes(city.toLowerCase())
//     const matchesCountry = !country || event.location.country.toLowerCase().includes(country.toLowerCase())
//     return matchesCity && matchesCountry
//   })
// }

// export const filterEventsByDateRange = (events: Event[], startDate: string, endDate: string): Event[] => {
//   const start = new Date(startDate)
//   const end = new Date(endDate)
  
//   return events.filter(event => {
//     const eventStart = new Date(event.startDate.date)
//     const eventEnd = new Date(event.endDate.date)
    
//     // Event overlaps with the date range
//     return (eventStart >= start && eventStart <= end) || 
//            (eventEnd >= start && eventEnd <= end) ||
//            (eventStart <= start && eventEnd >= end)
//   })
// }

// export const filterEventsByCategory = (events: Event[], categoryName: string): Event[] => {
//   return events.filter(event => 
//     event.category.name.toLowerCase().includes(categoryName.toLowerCase())
//   )
// }

// export const filterUpcomingEvents = (events: Event[]): Event[] => {
//   const now = new Date()
//   return events.filter(event => new Date(event.startDate.date) >= now)
// }

// export const filterPastEvents = (events: Event[]): Event[] => {
//   const now = new Date()
//   return events.filter(event => new Date(event.endDate.date) < now)
// }

// export const filterOngoingEvents = (events: Event[]): Event[] => {
//   const now = new Date()
//   return events.filter(event => {
//     const start = new Date(event.startDate.date)
//     const end = new Date(event.endDate.date)
//     return start <= now && end >= now
//   })
// }

// // Filter by multiple criteria with AND/OR logic
// export const filterEventsAdvanced = (
//   events: Event[], 
//   criteria: {
//     fields: (keyof Event)[]
//     values: string[]
//     operator: 'AND' | 'OR'
//   }
// ): Event[] => {
//   return events.filter(event => {
//     const matches = criteria.fields.map((field, index) => {
//       const value = criteria.values[index]
//       if (!value) return true

//       const eventValue = getEventFieldValue(event, field)
//       return eventValue?.toString().toLowerCase().includes(value.toLowerCase()) || false
//     })

//     return criteria.operator === 'AND' 
//       ? matches.every(match => match)
//       : matches.some(match => match)
//   })
// }

// // Helper function to get nested field values
// const getEventFieldValue = (event: Event, field: keyof Event): any => {
//   if (field === 'location') {
//     return event.location.city || event.location.country
//   }
//   if (field === 'startDate' || field === 'endDate') {
//     return event[field].date
//   }
//   if (field === 'category') {
//     return event.category.name
//   }
//   return event[field]
// }

// // Get unique filter options for dropdowns
// export const getUniqueStatuses = (events: Event[]): string[] => {
//   return [...new Set(events.map(event => event.status))]
// }

// export const getUniqueTypes = (events: Event[]): string[] => {
//   return [...new Set(events.map(event => event.type))]
// }

// export const getUniqueVisibilities = (events: Event[]): string[] => {
//   return [...new Set(events.map(event => event.visibility))]
// }

// export const getUniqueCities = (events: Event[]): string[] => {
//   return [...new Set(events.map(event => event.location.city))].filter(Boolean)
// }

// export const getUniqueCountries = (events: Event[]): string[] => {
//   return [...new Set(events.map(event => event.location.country))].filter(Boolean)
// }

// export const getUniqueCategories = (events: Event[]): string[] => {
//   return [...new Set(events.map(event => event.category.name))].filter(Boolean)
// }

// // Search events with multiple fields and fuzzy matching
// export const searchEvents = (events: Event[], query: string): Event[] => {
//   if (!query.trim()) return events

//   const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0)
  
//   return events.filter(event => {
//     const searchableText = [
//       event.name,
//       event.description,
//       event.location.city,
//       event.location.country,
//       event.category.name,
//       ...event.tags
//     ].join(' ').toLowerCase()

//     return searchTerms.every(term => searchableText.includes(term))
//   })
// }

// // Filter events with combined search and filters
// export const filterAndSearchEvents = (
//   events: Event[],
//   searchQuery: string,
//   filters: Partial<EventsFilterOptions>
// ): Event[] => {
//   let filteredEvents = events

//   // Apply search first
//   if (searchQuery) {
//     filteredEvents = searchEvents(filteredEvents, searchQuery)
//   }

//   // Apply other filters
//   if (filters.status && filters.status !== 'all') {
//     filteredEvents = filterEventsByStatus(filteredEvents, filters.status as EventStatus)
//   }

//   if (filters.type && filters.type !== 'all') {
//     filteredEvents = filterEventsByType(filteredEvents, filters.type as EventType)
//   }

//   if (filters.visibility && filters.visibility !== 'all') {
//     filteredEvents = filterEventsByVisibility(filteredEvents, filters.visibility as EventVisibility)
//   }

//   if (filters.city) {
//     filteredEvents = filterEventsByLocation(filteredEvents, filters.city, undefined)
//   }

//   if (filters.country) {
//     filteredEvents = filterEventsByLocation(filteredEvents, undefined, filters.country)
//   }

//   if (filters.dateRange?.start && filters.dateRange?.end) {
//     filteredEvents = filterEventsByDateRange(filteredEvents, filters.dateRange.start, filters.dateRange.end)
//   }

//   if (filters.category) {
//     filteredEvents = filterEventsByCategory(filteredEvents, filters.category)
//   }

//   return filteredEvents
// }

// // Get events statistics for filters
// export const getEventsStatistics = (events: Event[]) => {
//   return {
//     total: events.length,
//     byStatus: {
//       ACCEPTED: events.filter(e => e.status === 'ACCEPTED').length,
//       PENDING: events.filter(e => e.status === 'PENDING').length,
//       REJECTED: events.filter(e => e.status === 'REJECTED').length,
//       CANCELLED: events.filter(e => e.status === 'CANCELLED').length,
//     },
//     byType: {
//       FACETOFACE: events.filter(e => e.type === 'FACETOFACE').length,
//       ONLINE: events.filter(e => e.type === 'ONLINE').length,
//       HYBRID: events.filter(e => e.type === 'HYBRID').length,
//     },
//     byVisibility: {
//       PUBLIC: events.filter(e => e.visibility === 'PUBLIC').length,
//       PRIVATE: events.filter(e => e.visibility === 'PRIVATE').length,
//     },
//     upcoming: filterUpcomingEvents(events).length,
//     ongoing: filterOngoingEvents(events).length,
//     past: filterPastEvents(events).length,
//   }
// }