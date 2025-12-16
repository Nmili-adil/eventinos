import type { Member } from '@/types/membersType'

export type MemberSortField = 'firstName' | 'lastName' | 'email' | 'createdAt' | 'isActive' | 'registrationCompleted'
export type MemberSortDirection = 'asc' | 'desc'

export interface MembersFilters {
  search: string
  status: 'all' | 'active' | 'inactive'
  registrationStatus: 'all' | 'completed' | 'pending'
  gender: 'all' | 'MALE' | 'FEMALE' | 'OTHER'
}

export const filterMembers = (
  members: Member[],
  filters: MembersFilters
): Member[] => {
  return members.filter(member => {
    // Search filter
    const searchLower = filters.search.toLowerCase()
    const matchesSearch = !filters.search ||
      (member.firstName?.toLowerCase() || '').includes(searchLower) ||
      (member.lastName?.toLowerCase() || '').includes(searchLower) ||
      (member.email?.toLowerCase() || '').includes(searchLower) ||
      (member.phoneNumber || '').includes(filters.search) ||
      (member.city?.toLowerCase() || '').includes(searchLower) ||
      (member.country?.toLowerCase() || '').includes(searchLower)

    // Status filter
    const matchesStatus = filters.status === 'all' || 
      (filters.status === 'active' && member.isActive) ||
      (filters.status === 'inactive' && !member.isActive)

    // Registration status filter
    const matchesRegistration = filters.registrationStatus === 'all' ||
      (filters.registrationStatus === 'completed' && member.registrationCompleted) ||
      (filters.registrationStatus === 'pending' && !member.registrationCompleted)

    // Gender filter
    const matchesGender = filters.gender === 'all' || member.gender === filters.gender

    return matchesSearch && matchesStatus && matchesRegistration && matchesGender
  })
}

export const sortMembers = (
  members: Member[],
  sortField: MemberSortField,
  sortDirection: MemberSortDirection
): Member[] => {
  return [...members].sort((a, b) => {
    let aValue: any
    let bValue: any

    switch (sortField) {
      case 'createdAt':
        // Handle date objects
        const aDate = typeof a.createdAt === "object" ? (a.createdAt as any)?.$date?.$numberLong : 0
        const bDate = typeof b.createdAt === "object" ? (b.createdAt as any)?.$date?.$numberLong : 0
        aValue = aDate ? parseInt(aDate) : 0
        bValue = bDate ? parseInt(bDate) : 0
        break
      case 'firstName':
      case 'lastName':
      case 'email':
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

