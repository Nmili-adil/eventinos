export type EventStatus = 'ACCEPTED' | 'PENDING' | 'REJECTED' | 'CANCELLED'
export type EventType = 'FACETOFACE' | 'ONLINE' | 'HYBRID'
export type EventVisibility = 'PUBLIC' | 'PRIVATE'

export interface EventDate {
  date: string
  time: string
}

export interface Location {
  name: string
  location: {
    lat: number
    lng: number
  }
  place_id: string
  city: string
  country: string
  countryCode: string
}

export interface Event {
  _id: string
  name: string
  description: string
  image: string
  startDate: EventDate
  endDate: EventDate
  visibility: EventVisibility
  type: EventType
  status: EventStatus
  location: Location
  category: {
    _id: string
    name: string
    description: string
    icon: string
  }
  badge?: {
    _id: string
    name: string
    description: string
    design: string
    image: string
  }
  createdBy: {
    _id: string
    firstName: string
    lastName: string
    gender: string
    picture: string
  }
  tags: string[]
  requirements: string[]
  favorite: boolean
}

export type SortField = 'name' | 'type' | 'visibility' | 'location' | 'startDate' | 'endDate' | 'status'
export type SortDirection = 'asc' | 'desc'

export interface EventsFilters {
  search: string
  status: string
  type: string
}

export interface EventsSort {
  field: SortField
  direction: SortDirection
}

export interface PaginationState {
  currentPage: number
  pageSize: number
  totalItems: number
}



export interface EventsFilters {
  search: string
  status: string
  type: string
}


export interface FiltersProps {
  filters: EventsFilters
  onFiltersChange: (filters: EventsFilters) => void
}

export interface EventsSort {
  field: SortField
  direction: SortDirection
}

export interface PaginationState {
  currentPage: number
  pageSize: number
  totalItems: number
}

export interface PaginationProps {
  pagination: PaginationState
  onPageChange: (page: number) => void
}

export interface TableRowProps {
  event: Event
  onEdit: (id: string) => void
  onChangeStatus: (id: string) => void
  onPreview: (id: string) => void
  onDelete: (id: string) => void
}

export interface TableHeaderProps {
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
}

export interface EmptyStateProps {
  onResetFilters: () => void
}

// types/eventsTypes.ts
