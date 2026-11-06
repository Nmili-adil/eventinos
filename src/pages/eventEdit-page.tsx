import EventEditForm, { EventEditFormSkeleton } from "@/components/partials/eventsComponents/EventEditForm";
import { Card, CardContent } from "@/components/ui/card";
import type { RootState } from "@/store/app/rootReducer";
import type { AppDispatch } from "@/store/app/store";
import { fetchEventByIdRequest } from "@/store/features/events/events.actions";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

const EventEditPage = () => {
  const { t } = useTranslation();
  const { event, isLoading, isUpdating } = useSelector((state: RootState) => state.events);
  const dispatch = useDispatch<AppDispatch>();
  const { eventId } = useParams<{ eventId: string | undefined }>();
  // The store may still hold an older copy of this event from a previous
  // page, so the form only mounts on data requested by this visit.
  const [requestedId, setRequestedId] = useState<string | undefined>();

  useEffect(() => {
    if (!eventId) return;
    dispatch(fetchEventByIdRequest(eventId));
    setRequestedId(eventId);
  }, [eventId, dispatch]);

  const loadedId = typeof event?._id === "string" ? event._id : (event as any)?._id?.$oid;

  if (requestedId && requestedId === eventId && event && loadedId === eventId) {
    return (
      <div className="min-h-screen ">
        <EventEditForm key={loadedId} event={event} isLoading={isUpdating} />
      </div>
    );
  }

  if (requestedId && !isLoading && !event) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="border-slate-300">
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">{t("events.details.notFound", "Event not found")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <EventEditFormSkeleton />
    </div>
  );
};

export default EventEditPage;
