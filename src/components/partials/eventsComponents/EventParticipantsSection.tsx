import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchEventParticipantsApi } from "@/api/guestsApi"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"

interface EventParticipant {
  _id?: string
  firstName?: string
  lastName?: string
  email?: string
  phoneNumber?: string
  city?: string
  gender?: string
  status?: string
}

interface EventParticipantsSectionProps {
  eventId?: string
  className?: string
  layout?: "default" | "compact"
  onStatsChange?: (stats: { count: number; isLoading: boolean; error?: string | null }) => void
}

export const EventParticipantsSection = ({
  eventId,
  className,
  layout = "default",
  onStatsChange,
}: EventParticipantsSectionProps) => {
  const { t } = useTranslation()
  const [participants, setParticipants] = useState<EventParticipant[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadParticipants = async () => {
      if (!eventId) return
      setIsLoading(true)
      setError(null)
      onStatsChange?.({ count: 0, isLoading: true, error: null })
      try {
        const response = await fetchEventParticipantsApi(eventId)
        const data = Array.isArray(response?.data?.data)
          ? response.data.data
          : Array.isArray(response?.data)
            ? response.data
            : []
        setParticipants(data)
        onStatsChange?.({ count: data.length, isLoading: false, error: null })
      } catch (err: any) {
        console.error("Failed to load participants:", err)
        setError(err?.response?.data?.message || err?.message || "Unable to load participants.")
        onStatsChange?.({
          count: 0,
          isLoading: false,
          error: err?.response?.data?.message || err?.message || "Unable to load participants.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadParticipants()
  }, [eventId, onStatsChange])
}

export default EventParticipantsSection
