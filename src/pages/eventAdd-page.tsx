import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import type { RootState } from "@/store/app/rootReducer"
import type { AppDispatch } from "@/store/app/store"
import { createEventRequest } from "@/store/features/events/events.actions"
import type { EventFormData } from "@/schema/eventSchema"
import EventAddForm from "@/components/partials/eventsComponents/EventAddForm"
import { toast } from "sonner"
import { EVENT_LISTE_PAGE } from "@/constants/routerConstants"

const EventAddPage = () => {
  const { isCreating } = useSelector((state: RootState) => state.events)
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const handleSubmit = async (data: EventFormData) => {
    console.log("Submitting data:", data)    
    try {
      toast.promise(
        async () => await dispatch(createEventRequest(data)),
        {
          loading: 'Creating event...',
          success: 'Event created successfully',
          error: 'Failed to create event'
        }
      )
      setTimeout(() => navigate(EVENT_LISTE_PAGE), 1000)
    } catch (error) {
      console.error("Failed to create event:", error)
    }
  }

  return (
    <EventAddForm
      onSubmit={handleSubmit}
      isLoading={isCreating}
    />
  )
}

export default EventAddPage
