import { EventsTable } from "@/components/partials/eventsComponents/EventsTableComponent"
import type { AppDispatch } from "@/store/app/store"
import { fetchEventsRequest } from "@/store/features/events/events.actions"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { useLoading } from "@/contexts/LoadingContext"

const EventsPageList = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { setLoading } = useLoading()
  
  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true, 'Chargement des événements...')
      try {
        await dispatch(fetchEventsRequest())
      } finally {
        setLoading(false)
      }
    }
    
    loadEvents()
  }, [dispatch, setLoading])

  return (
    <div>
        <EventsTable />
    </div>
  )
}

export default EventsPageList