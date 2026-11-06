import { z } from 'zod'
import i18n from 'i18next'

export const participantExportSchema = z
  .object({
    format: z.enum(['csv', 'xlsx']),
    csvSeparator: z.enum([';', ',']),
    fields: z.array(z.string()).min(1, {
      error: () => i18n.t('events.participants.export.noColumnSelected'),
    }),
    status: z.array(z.string()),
    presence: z.enum(['all', 'present', 'absent']),
    registeredFrom: z.string(),
    registeredTo: z.string(),
    search: z.string(),
  })
  .refine(
    (data) =>
      !data.registeredFrom || !data.registeredTo || data.registeredTo >= data.registeredFrom,
    {
      error: () => i18n.t('events.participants.export.invalidPeriod'),
      path: ['registeredTo'],
    },
  )

export type ParticipantExportFormData = z.infer<typeof participantExportSchema>
