import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store/app/rootReducer";
import type { AppDispatch } from "@/store/app/store";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchEventByIdRequest } from "@/store/features/events/events.actions";
import EventDetails from "@/components/partials/eventsComponents/event-details";
import { toast } from "sonner";
import { EVENT_LISTE_PAGE } from "@/constants/routerConstants";

const EventDetailsPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { event, isLoading: loading, error } = useSelector((state: RootState) => state.events);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      if (eventId) {
        try {
          await dispatch(fetchEventByIdRequest(eventId));
        } catch (error) {
          console.error("Failed to fetch event:", error);
          toast.error("Faild to load event details. Please try again later.")
          setNotFound(true);
        }
      }
    };

    loadEvent();
  }, [eventId, dispatch]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center space-x-4 mb-6">
          <Skeleton className="h-8 w-8 rounded" />
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="aspect-video rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || notFound || !event) {
    return (
      <div className="container h-screen flex justify-center items-center mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The event you're looking for doesn't exist or may have been removed.
            </p>
            <div className="space-x-4">
              <Button onClick={() => navigate(EVENT_LISTE_PAGE)}>
                Browse Events
              </Button>
              <Button variant="outline" onClick={() => navigate(-1)}>
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <EventDetails event={event} />;
};

export default EventDetailsPage;