export type ExportFormat = 'csv' | 'xlsx'

export type ExportFieldGroup = 'identity' | 'contact' | 'registration' | 'profile' | 'attendance'

export interface ExportField {
  key: string
  label: string
  group: ExportFieldGroup
  default: boolean
}

export interface ExportFieldsResponse {
  fields: ExportField[]
  formats?: ExportFormat[]
  statuses?: string[]
}

export interface ExportFilters {
  status?: string[]
  present?: boolean
  registeredFrom?: string
  registeredTo?: string
  search?: string
}

export interface ParticipantExportParams {
  format: ExportFormat
  fields: string[] // ordered
  filters?: ExportFilters
  sort?: { field: string; direction: 'asc' | 'desc' }
  lang?: 'fr' | 'en' | 'ar'
  options?: { includeHeader?: boolean; csvSeparator?: ';' | ','; dateFormat?: string }
}

export interface ExportPreset {
  _id: string
  name: string
  fields: string[]
  filters?: ExportFilters
  format: ExportFormat
}
