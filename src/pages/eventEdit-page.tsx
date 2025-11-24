import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import type { RootState } from "@/store/app/rootReducer"
import type { AppDispatch } from "@/store/app/store"
import { fetchEventByIdRequest, updateEventRequest } from "@/store/features/events/events.actions"
import type { EventFormData } from "@/schema/eventSchema"
import EventEditForm from "@/components/partials/eventsComponents/EventEditForm"
import { toast } from "sonner"
import { EVENT_LISTE_PAGE } from "@/constants/routerConstants"
import { Card, CardContent } from "@/components/ui/card"

const EventEditPage = () => {
  const { event, isLoading, isUpdating } = useSelector((state: RootState) => state.events)
  const dispatch = useDispatch<AppDispatch>()
  const { eventId } = useParams<{ eventId: string | undefined }>()
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
    try {
      toast.promise(
        async () => await dispatch(updateEventRequest(eventId!, data)),
        {
          loading: 'Updating event...',
          success: 'Event updated successfully',
          error: 'Failed to update event'
        }
      )
      setTimeout(() => navigate(EVENT_LISTE_PAGE),1000)   // Refresh events list
    } catch (error) {
      console.error("Failed to update event:", error)
      }
  }

  const isFetching = isLoading && !event

  if (!isFetching && !event) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="border-slate-300">
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Event not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <EventEditForm
      event={event}
      onSubmit={handleSubmit}
      isLoading={isUpdating}
      isFetching={isFetching}
    />
  )
}

export default EventEditPage