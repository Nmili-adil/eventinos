import { EventsTable } from "@/components/partials/eventsComponents/EventsTableComponent"
import type { AppDispatch } from "@/store/app/store"
import { fetchEventsRequest } from "@/store/features/events/events.actions"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { useLoading } from "@/contexts/LoadingContext"
import { useTranslation } from "react-i18next"

const EventsPageList = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { setLoading } = useLoading()
  const { t } = useTranslation()
  
  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true, t('events.loadingEvents'))
      try {
        await dispatch(fetchEventsRequest())
      } finally {
        setLoading(false)
      }
    }
    
    loadEvents()
  }, [dispatch, setLoading, t])

  return (
    <div className="container mx-auto  py-6">
        <EventsTable />
    </div>
  )
}

export default EventsPageList