import type { User } from '@/types/usersType'

export type UserSortField = 'firstName' | 'lastName' | 'email' | 'createdAt' | 'isActive' | 'registrationCompleted' | 'user'
export type UserSortDirection = 'asc' | 'desc'

export interface UsersFilters {
  search: string
  status: 'all' | 'active' | 'inactive'
  registrationStatus: 'all' | 'completed' | 'pending'
  gender: 'all' | 'MALE' | 'FEMALE' | 'OTHER'
  userType: 'all' | 'Organizer' | 'Member'
}

export const filterUsers = (
  users: User[],
  filters: UsersFilters
): User[] => {
  return users.filter(user => {
    // Search filter
    const searchLower = filters.search.toLowerCase()
    const matchesSearch = !filters.search ||
      (user.firstName?.toLowerCase() || '').includes(searchLower) ||
      (user.lastName?.toLowerCase() || '').includes(searchLower) ||
      (user.email?.toLowerCase() || '').includes(searchLower) ||
      (user.phoneNumber || '').includes(filters.search) ||
      (user.city?.toLowerCase() || '').includes(searchLower) ||
      (user.country?.toLowerCase() || '').includes(searchLower) ||
      (user.company?.name?.toLowerCase() || '').includes(searchLower)

    // Status filter
    const matchesStatus = filters.status === 'all' || 
      (filters.status === 'active' && user.isActive) ||
      (filters.status === 'inactive' && !user.isActive)

    // Registration status filter
    const matchesRegistration = filters.registrationStatus === 'all' ||
      (filters.registrationStatus === 'completed' && user.registrationCompleted) ||
      (filters.registrationStatus === 'pending' && !user.registrationCompleted)

    // Gender filter
    const matchesGender = filters.gender === 'all' || user.gender === filters.gender

    // User type filter
    const matchesUserType = filters.userType === 'all' || user.user === filters.userType

    return matchesSearch && matchesStatus && matchesRegistration && matchesGender && matchesUserType
  })
}

export const sortUsers = (
  users: User[],
  sortField: UserSortField,
  sortDirection: UserSortDirection
): User[] => {
  return [...users].sort((a, b) => {
    let aValue: any
    let bValue: any

    switch (sortField) {
      case 'createdAt':
        // Handle date objects
        const aDate = a.createdAt?.$date?.$numberLong
        const bDate = b.createdAt?.$date?.$numberLong
        aValue = aDate ? parseInt(aDate) : 0
        bValue = bDate ? parseInt(bDate) : 0
        break
      case 'firstName':
      case 'lastName':
      case 'email':
      case 'user':
        aValue = (a[sortField] || '').toLowerCase()
        bValue = (b[sortField] || '').toLowerCase()
        break
      case 'isActive':
      case 'registrationCompleted':
        aValue = a[sortField] ? 1 : 0
        bValue = b[sortField] ? 1 : 0
        break
      default:
        aValue = a[sortField]
        bValue = b[sortField]
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })
}

