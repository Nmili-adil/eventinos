import { fetchEvents } from '@/api/eventsApi'
import { fetchMembersApi } from '@/api/membersApi'
import { fetchUsers } from '@/api/usersApi'
import { EVENT_DETAILS_PAGE, MEMBERS_PAGE, PROFILE_PAGE } from '@/constants/routerConstants'
import type { Event } from '@/types/eventsTypes'
import type { Member } from '@/types/membersType'
import type { User } from '@/types/usersType'

export type GlobalSearchType = 'event' | 'member' | 'organizer' | 'admin'

export interface GlobalSearchResult {
  id: string
  type: GlobalSearchType
  title: string
  subtitle?: string
  meta?: string
  route: string
  state?: Record<string, unknown>
  avatar?: string
}

const MAX_RESULTS_PER_GROUP = 5

const textIncludesQuery = (text: string | undefined | null, query: string) => {
  if (!text) return false
  return text.toLowerCase().includes(query)
}

type ObjectIdLike =
  | string
  | number
  | { $oid?: string; $id?: string; _id?: string }
  | null
  | undefined

const extractId = (value: ObjectIdLike): string | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') return value
  if (typeof value === 'number') return value.toString()
  if (typeof value === 'object') {
    if ('_id' in value && typeof value._id === 'string') return value._id
    if ('$oid' in value && typeof value.$oid === 'string') return value.$oid
    if ('$id' in value && typeof value.$id === 'string') return value.$id
  }
  return null
}

let cachedEvents: Event[] | null = null
let cachedMembers: Member[] | null = null
let cachedUsers: User[] | null = null

const ensureEvents = async (): Promise<Event[]> => {
  if (cachedEvents) return cachedEvents
  try {
    const response = await fetchEvents()
    const data = Array.isArray(response?.data?.data) ? response.data.data : []
    cachedEvents = data
    return data
  } catch (error) {
    console.error('Global search: failed to fetch events', error)
    return []
  }
}

const ensureMembers = async (): Promise<Member[]> => {
  if (cachedMembers) return cachedMembers
  try {
    const response = await fetchMembersApi(1, 100)
    const data = Array.isArray(response?.data?.data) ? response.data.data : []
    cachedMembers = data
    return data
  } catch (error) {
    console.error('Global search: failed to fetch members', error)
    return []
  }
}

const ensureUsers = async (): Promise<User[]> => {
  if (cachedUsers) return cachedUsers
  try {
    const response = await fetchUsers(1, 100, 'all')
    const data = Array.isArray(response?.data?.data) ? response.data.data : []
    cachedUsers = data
    return data
  } catch (error) {
    console.error('Global search: failed to fetch users', error)
    return []
  }
}

const formatUserType = (user: User): GlobalSearchType | null => {
  const roleName = user.role?.name?.toLowerCase()
  if (roleName?.includes('admin')) return 'admin'
  if (roleName?.includes('organizer') || user.user?.toLowerCase() === 'organizer') return 'organizer'
  return null
}

const formatMemberName = (member: Partial<Member>) => {
  const first = member.firstName?.trim() || ''
  const last = member.lastName?.trim() || ''
  if (!first && !last) return member.email || member.phoneNumber || 'Unknown member'
  return `${first} ${last}`.trim()
}

const matchesMember = (member: Partial<Member>, query: string) => {
  return (
    textIncludesQuery(member.firstName, query) ||
    textIncludesQuery(member.lastName, query) ||
    textIncludesQuery(member.email, query) ||
    textIncludesQuery(member.phoneNumber, query) ||
    textIncludesQuery(member.city, query) ||
    textIncludesQuery(member.country, query)
  )
}

const matchesEvent = (event: Partial<Event>, query: string) => {
  return (
    textIncludesQuery(event.name, query) ||
    textIncludesQuery(event.title, query) ||
    textIncludesQuery(event.description, query) ||
    textIncludesQuery(event.location?.name, query) ||
    textIncludesQuery(event.location?.city, query) ||
    textIncludesQuery(event.location?.country, query)
  )
}

const matchesUser = (user: Partial<User>, query: string) => {
  return (
    textIncludesQuery(user.firstName, query) ||
    textIncludesQuery(user.lastName, query) ||
    textIncludesQuery(user.email, query) ||
    textIncludesQuery(user.company?.name, query)
  )
}

export const performGlobalSearch = async (query: string): Promise<GlobalSearchResult[]> => {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery || normalizedQuery.length < 2) {
    return []
  }

  const [events, members, users] = await Promise.all([
    ensureEvents(),
    ensureMembers(),
    ensureUsers(),
  ])

  const results: GlobalSearchResult[] = []

  events
    .filter(event => matchesEvent(event, normalizedQuery))
    .slice(0, MAX_RESULTS_PER_GROUP)
    .forEach(event => {
      const id = event._id
      if (!id) return
      results.push({
        id,
        type: 'event',
        title: event.name || event.title || 'Untitled event',
        subtitle: event.location?.name || event.location?.city,
        meta: event.startDate?.date,
        route: EVENT_DETAILS_PAGE(id),
        avatar: event.image,
      })
    })

  members
    .filter(member => matchesMember(member, normalizedQuery))
    .slice(0, MAX_RESULTS_PER_GROUP)
    .forEach(member => {
      const id = extractId(member._id as unknown as ObjectIdLike)
      if (!id) return
      results.push({
        id,
        type: 'member',
        title: formatMemberName(member),
        subtitle: member.email || member.phoneNumber,
        route: MEMBERS_PAGE,
        state: { focusMemberId: id, focusMemberData: member },
        avatar: member.picture,
      })
    })

  users
    .filter(user => matchesUser(user, normalizedQuery))
    .slice(0, 100)
    .forEach(user => {
      const userType = formatUserType(user)
      if (!userType) return
      const id = extractId(user._id as unknown as ObjectIdLike) || extractId(user.role as unknown as ObjectIdLike)
      if (!id) return

      results.push({
        id,
        type: userType,
        title: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        subtitle: user.email || user.company?.name,
        route: PROFILE_PAGE(id),
        avatar: user.picture,
      })
    })

  return results
}

