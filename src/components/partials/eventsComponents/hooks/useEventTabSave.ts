import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
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
} from "@/api/eventUpdateApi";

export const useEventTabSave = (eventId: string) => {
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);

  const saveBasicInfo = async (data: any, onSuccess?: () => void) => {
    try {
      setIsSaving(true);
      const basicData = {
        name: data.name,
        description: data.description,
        image: data.image,
        visibility: data.visibility,
        type: data.type,
        status: data.status,
        capacity: data.capacity,
        allowRegistration: data.allowRegistration,
        registrationDeadline: data.registrationDeadline,
        isNearestEvent: data.isNearestEvent,
        isUpComingEvent: data.isUpComingEvent,
        tags: data.tags,
        requirements: data.requirements,
      };

      await updateEventInfos(eventId, basicData);

      // Update category separately
      if (data.category) {
        await updateEventCategory(eventId, data.category);
      }

      toast.success(t("eventForm.success.basicInfoUpdated") || "Basic info updated successfully");
      onSuccess?.();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || t("eventForm.errors.updateFailed") || "Update failed"
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
      toast.success(t("eventForm.success.datesUpdated") || "Dates updated successfully");
      onSuccess?.();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || t("eventForm.errors.updateFailed") || "Update failed"
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
      toast.error(
        error.response?.data?.message || t("eventForm.errors.updateFailed") || "Update failed"
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
      toast.error(
        error.response?.data?.message || t("eventForm.errors.updateFailed") || "Update failed"
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
      toast.error(
        error.response?.data?.message || t("eventForm.errors.updateFailed") || "Update failed"
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
      toast.error(
        error.response?.data?.message || t("eventForm.errors.updateFailed") || "Update failed"
      );
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const saveGallery = async (data: any, onSuccess?: () => void) => {
    try {
      setIsSaving(true);
      await updateEventInfos(eventId, { gallery: data.gallery });
      toast.success(t("eventForm.success.galleryUpdated") || "Gallery updated successfully");
      onSuccess?.();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || t("eventForm.errors.updateFailed") || "Update failed"
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
      toast.error(
        error.response?.data?.message || t("eventForm.errors.updateFailed") || "Update failed"
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
        updateEventExhibitors(eventId, data.exhibitors),
        updateEventSponsors(eventId, data.sponsors),
      ]);
      toast.success(
        t("eventForm.success.exhibitorsSponsorsUpdated") ||
          "Exhibitors and sponsors updated successfully"
      );
      onSuccess?.();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || t("eventForm.errors.updateFailed") || "Update failed"
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
