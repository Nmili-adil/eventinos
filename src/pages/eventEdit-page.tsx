import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useParams } from "react-router-dom"
import type { RootState } from "@/store/app/rootReducer"
import type { AppDispatch } from "@/store/app/store"
import { fetchEventByIdRequest, updateEventRequest } from "@/store/features/events/events.actions"
import type { EventFormData } from "@/schema/eventSchema"
import EventEditForm from "@/components/partials/eventsComponents/EventEditForm"

const EventEditPage = () => {
  const { event } = useSelector((state: RootState) => state.events)
  const dispatch = useDispatch<AppDispatch>()
  const { eventId } = useParams<{ eventId: string }>()
  const [isLoading, setIsLoading] = useState(false)


  useEffect(() => {
    const fetchEvent = async () => {
      if (eventId) {
        try {
          await dispatch(fetchEventByIdRequest(eventId))
        } catch (error) {
          console.log(error)
        }
      }
    }
    fetchEvent()
  }, [eventId, dispatch])

  const handleSubmit = async (data: EventFormData) => {
    setIsLoading(true)
    try {
      // Here you would dispatch an update action
      console.log("Updating event:", data)
      await dispatch(updateEventRequest(data))
    } catch (error) {
      console.error("Failed to update event:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!event) {
    return <div>Loading event...</div>
  }

  return (
    <EventEditForm
      event={event}
      onSubmit={handleSubmit}
      isLoading={isLoading}
    />
  )
}

export default EventEditPage