import { EventsTable } from "@/components/partials/eventsComponents/EventsTableComponent"
import type { AppDispatch } from "@/store/app/store"
import { fetchEventsRequest } from "@/store/features/events/events.actions"
import { useEffect } from "react"
import { useDispatch } from "react-redux"

const EventsPageList = () => {

  const dispatch = useDispatch<AppDispatch>()
  useEffect(() => {
    dispatch(fetchEventsRequest())
  }, [])


  return (
    <div>
        <EventsTable />
        </div>
  )
}

export default EventsPageList