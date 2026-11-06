export const EVENT_STATUSES = ['DRAFT', 'PENDING', 'ACCEPTED', 'REFUSED', 'CLOSED'] as const

export type EventStatus = (typeof EVENT_STATUSES)[number]

// i18n key of the short label for each status (list filter, badges).
export const EVENT_STATUS_LABEL_KEYS: Record<EventStatus, string> = {
  DRAFT: 'events.statusDraft',
  PENDING: 'events.statusPending',
  ACCEPTED: 'events.statusAccepted',
  REFUSED: 'events.statusRejected',
  CLOSED: 'events.statusClosed',
}

export const getEventStatusLabelKey = (status: string): string | undefined =>
  EVENT_STATUS_LABEL_KEYS[status as EventStatus]
