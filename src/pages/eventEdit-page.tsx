import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import type { RootState } from "@/store/app/rootReducer"
import type { AppDispatch } from "@/store/app/store"
import { fetchEventByIdRequest, fetchEventsRequest, updateEventRequest } from "@/store/features/events/events.actions"
import type { EventFormData } from "@/schema/eventSchema"
import EventEditForm from "@/components/partials/eventsComponents/EventEditForm"
import LoadingComponent from "@/components/shared/loadingComponent"
import { toast } from "sonner"
import { EVENT_LISTE_PAGE } from "@/constants/routerConstants"

const EventEditPage = () => {
  const { event, isLoading: isEventLoading, error: eventError, isUpdating } = useSelector((state: RootState) => state.events)
  const dispatch = useDispatch<AppDispatch>()
  const { eventId } = useParams<{ eventId: string | undefined }>()
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()


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
    console.log("Submitting data:", data)
    setIsLoading(true)
    
    try {
      toast.promise(
        async () => await dispatch(updateEventRequest(eventId!, data)),
        {
          loading: 'Updating event...',
          success: 'Event updated successfully',
          error: 'Failed to update event'
        }
      )
      // dispatch(updateEventRequest(eventId, data))
      
      setTimeout(() => navigate(EVENT_LISTE_PAGE),1000) // Refresh events list
    } catch (error) {
      console.error("Failed to update event:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!event) {
    return <LoadingComponent />
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