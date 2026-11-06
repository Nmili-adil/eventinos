import { useRef, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { handleAsyncError } from "@/hooks/useGlobalErrorHandler";
import type { AppDispatch } from "@/store/app/store";
import { fetchEventsRequest } from "@/store/features/events/events.actions";
import { getRole } from "@/services/localStorage";
import { toEventDateTime } from "@/lib/events-utils";
import {
  updateEventInfos,
  updateEventCategory,
  updateEventDates,
  updateEventLocation,
  updateEventSocialNetworks,
  updateEventSpeakers,
  updateEventExhibitors,
  updateEventSponsors,
  updateEventBadge,
  updateEventGallery,
  updateEventStatus,
} from "@/api/eventUpdateApi";

interface SavedValues {
  status?: string;
  category?: string;
}

export const useEventTabSave = (eventId: string, initial: SavedValues = {}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const [isSaving, setIsSaving] = useState(false);
  // Last values known to be on the server, so unchanged ones are not re-sent.
  const savedStatus = useRef(initial.status);
  const savedCategory = useRef(initial.category);

  const saveBasicInfo = async (data: any, onSuccess?: () => void) => {
    try {
      setIsSaving(true);
      const basicData = {
        name: data.name,
        description: data.description,
        image: data.image,
        logo: data.logo,
        visibility: data.visibility,
        type: data.type,
        capacity: data.capacity,
        isNearestEvent: data.isNearestEvent,
        isUpComingEvent: data.isUpComingEvent,
        tags: data.tags,
        requirements: data.requirements,
      };

      await updateEventInfos(eventId, basicData);

      // Update category separately. Never send an empty one: it would erase it.
      if (data.category && data.category !== savedCategory.current) {
        await updateEventCategory(eventId, data.category);
        savedCategory.current = data.category;
      }

      // /infos ignores status: only PUT /events/:id/status changes it.
      if (getRole() === "admin" && data.status && data.status !== savedStatus.current) {
        await updateEventStatus(eventId, data.status);
        savedStatus.current = data.status;
        dispatch(fetchEventsRequest());
      }

      toast.success(t("eventForm.success.basicInfoUpdated") || "Basic info updated successfully");
      onSuccess?.();
    } catch (error: any) {
      handleAsyncError(
        error, t("eventForm.errors.updateFailed") || "Update failed"
      );
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const saveDateTime = async (data: any, onSuccess?: () => void) => {
    try {
      setIsSaving(true);
      const dates = {
        startDate: data.startDate,
        endDate: data.endDate,
      };

      await updateEventDates(eventId, dates);
      // These two fields live on the date tab but belong to the /infos endpoint.
      await updateEventInfos(eventId, {
        allowRegistration: data.allowRegistration,
        registrationDeadline: toEventDateTime(data.registrationDeadline),
      });
      toast.success(t("eventForm.success.datesUpdated") || "Dates updated successfully");
      onSuccess?.();
    } catch (error: any) {
      handleAsyncError(
        error, t("eventForm.errors.updateFailed") || "Update failed"
      );
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const saveLocation = async (data: any, onSuccess?: () => void) => {
    try {
      setIsSaving(true);
      await updateEventLocation(eventId, data.location);
      toast.success(t("eventForm.success.locationUpdated") || "Location updated successfully");
      onSuccess?.();
    } catch (error: any) {
      handleAsyncError(
        error, t("eventForm.errors.updateFailed") || "Update failed"
      );
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const saveSocialNetworks = async (data: any, onSuccess?: () => void) => {
    try {
      setIsSaving(true);
      await updateEventSocialNetworks(eventId, data.socialNetworks);
      toast.success(
        t("eventForm.success.socialNetworksUpdated") || "Social networks updated successfully"
      );
      onSuccess?.();
    } catch (error: any) {
      handleAsyncError(
        error, t("eventForm.errors.updateFailed") || "Update failed"
      );
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const saveProgram = async (data: any, onSuccess?: () => void) => {
    try {
      setIsSaving(true);
      await updateEventInfos(eventId, { program: data.program });
      toast.success(t("eventForm.success.programUpdated") || "Program updated successfully");
      onSuccess?.();
    } catch (error: any) {
      handleAsyncError(
        error, t("eventForm.errors.updateFailed") || "Update failed"
      );
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const saveBadges = async (data: any, onSuccess?: () => void) => {
    try {
      setIsSaving(true);
      await updateEventBadge(eventId, data.badges);
      toast.success(t("eventForm.success.badgesUpdated") || "Badges updated successfully");
      onSuccess?.();
    } catch (error: any) {
      handleAsyncError(
        error, t("eventForm.errors.updateFailed") || "Update failed"
      );
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const saveGallery = async (data: any, onSuccess?: () => void) => {
    try {
      setIsSaving(true);
      await updateEventGallery(eventId, data.gallery);
      toast.success(t("eventForm.success.galleryUpdated") || "Gallery updated successfully");
      onSuccess?.();
    } catch (error: any) {
      handleAsyncError(
        error, t("eventForm.errors.updateFailed") || "Update failed"
      );
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const saveSpeakers = async (data: any, onSuccess?: () => void) => {
    try {
      setIsSaving(true);
      await updateEventSpeakers(eventId, data.speakers);
      toast.success(t("eventForm.success.speakersUpdated") || "Speakers updated successfully");
      onSuccess?.();
    } catch (error: any) {
      handleAsyncError(
        error, t("eventForm.errors.updateFailed") || "Update failed"
      );
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const saveExhibitorsSponsors = async (data: any, onSuccess?: () => void) => {
    try {
      setIsSaving(true);
      await Promise.all([
        updateEventSpeakers(eventId, data.speakers),
        updateEventExhibitors(eventId, data.exhibitors),
        updateEventSponsors(eventId, data.sponsors),
      ]);
      toast.success(
        t("eventForm.success.exhibitorsSponsorsUpdated") ||
          "Speakers, exhibitors and sponsors updated successfully"
      );
      onSuccess?.();
    } catch (error: any) {
      handleAsyncError(
        error, t("eventForm.errors.updateFailed") || "Update failed"
      );
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    saveBasicInfo,
    saveDateTime,
    saveLocation,
    saveSocialNetworks,
    saveProgram,
    saveBadges,
    saveGallery,
    saveSpeakers,
    saveExhibitorsSponsors,
  };
};
