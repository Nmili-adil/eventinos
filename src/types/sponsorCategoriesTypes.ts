export interface SponsorCategory {
  _id: string
  name: string
  organizer?: string
  createdAt?: string
  updatedAt?: string
}

export interface SponsorCategoryPagination {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}
