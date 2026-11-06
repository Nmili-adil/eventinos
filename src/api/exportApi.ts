import { api } from "@/lib/apiClient"
import type {
  ExportFieldsResponse,
  ExportFilters,
  ExportFormat,
  ExportPreset,
  ParticipantExportParams,
} from "@/types/exportTypes"

export const fetchParticipantExportFieldsApi = async (eventId: string, lang: string) => {
  const response = await api.get<ExportFieldsResponse>(
    `/events/${eventId}/participants/export/fields`,
    { params: { lang }, skipServerErrorPage: true },
  )
  return response.data
}

// Returns the full response: the file name is in the Content-Disposition header.
export const exportEventParticipantsApi = (eventId: string, params: ParticipantExportParams) =>
  api.post<Blob>(`/events/${eventId}/participants/export`, params, {
    responseType: "blob",
    skipServerErrorPage: true,
  })

export const fetchExportPresetsApi = async (): Promise<ExportPreset[]> => {
  const response = await api.get("/export-presets", {
    params: { type: "participants" },
    skipServerErrorPage: true,
  })
  const data = response.data?.data ?? response.data
  return Array.isArray(data) ? data : []
}

export const createExportPresetApi = async (preset: {
  name: string
  fields: string[]
  filters?: ExportFilters
  format: ExportFormat
}): Promise<ExportPreset> => {
  const response = await api.post(
    "/export-presets",
    { ...preset, type: "participants" },
    { skipServerErrorPage: true },
  )
  return response.data?.data ?? response.data
}

export const deleteExportPresetApi = (id: string) =>
  api.delete(`/export-presets/${id}`, { skipServerErrorPage: true })
