import { EventsTable } from "@/components/partials/eventsComponents/EventsTableComponent"
import type { AppDispatch } from "@/store/app/store"
import { fetchEventsRequest } from "@/store/features/events/events.actions"
import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { useTranslation } from "react-i18next"
import { Skeleton } from "@/components/ui/skeleton"
import EventsTableSkeleton from "@/components/partials/eventsComponents/EventsTableSkeleton"

const EventsPageList = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const loadEvents = async () => {
      try {
        await dispatch(fetchEventsRequest())
      } finally {
        setIsLoading(false)
      }
    }
    
    loadEvents()
  }, [dispatch, t])

  return (
    <div className="container mx-auto py-6">
      {isLoading ? <EventsTableSkeleton /> : <EventsTable />}
    </div>
  )
}



export default EventsPageList