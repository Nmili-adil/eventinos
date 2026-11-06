import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
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
  const { t } = useTranslation()

  const handleSubmit = async (data: EventFormData) => {
    const creation = dispatch(createEventRequest(data)) as unknown as Promise<unknown>
    toast.promise(creation, {
      loading: t("eventForm.messages.creating"),
      success: t("eventForm.messages.created"),
      error: (error: any) =>
        error?.response?.data?.message || t("eventForm.messages.createFailed"),
    })

    try {
      await creation
      navigate(EVENT_LISTE_PAGE)
    } catch {
      // Already shown by the toast. Stay on the form so nothing typed is lost.
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
