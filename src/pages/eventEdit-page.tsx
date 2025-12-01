import EventEditForm from "@/components/partials/eventsComponents/EventEditForm";
import { Card, CardContent } from "@/components/ui/card";
import { EVENT_LISTE_PAGE } from "@/constants/routerConstants";
import type { EventFormData } from "@/schema/eventSchema";
import type { RootState } from "@/store/app/rootReducer";
import type { AppDispatch } from "@/store/app/store";
import { fetchEventByIdRequest, updateEventRequest } from "@/store/features/events/events.actions";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";


const EventEditPage = () => {
  const { event, isLoading, isUpdating } = useSelector((state: RootState) => state.events);
  const dispatch = useDispatch<AppDispatch>();
  const { eventId } = useParams<{ eventId: string | undefined }>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      if (eventId) {
        try {
          await dispatch(fetchEventByIdRequest(eventId));
        } catch (error) {
          console.error("Error fetching event:", error);
          toast.error("Failed to load event");
        }
      }
    };
    fetchEvent();
  }, [eventId, dispatch]);

  const handleSubmit = async (data: EventFormData) => {
    console.log("Submitting data:", data);

    if (!eventId) {
      toast.error("Event ID is missing");
      return;
    }

    try {
      await dispatch(updateEventRequest(eventId, data));
      toast.success('Event updated successfully');
      setTimeout(() => navigate(EVENT_LISTE_PAGE), 1000);
    } catch (error) {
      console.error("Failed to update event:", error);
      toast.error('Failed to update event');
    }
  };

  const isFetching = isLoading && !event;

  if (!isFetching && !event) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="border-slate-300">
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Event not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <EventEditForm
      event={event}
      onSubmit={handleSubmit}
      isLoading={isUpdating}
      isFetching={isFetching}
    />
  );
};

export default EventEditPage;