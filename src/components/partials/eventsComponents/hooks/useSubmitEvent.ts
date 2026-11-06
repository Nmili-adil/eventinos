import { useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { AppDispatch } from "@/store/app/store";
import { submitEventRequest } from "@/store/features/events/events.actions";

// Backend validation lists what is missing; accept the plain strings or the
// { field, message } objects an endpoint may return.
const getMissingFields = (data: any): string[] => {
  const list = data?.missingFields ?? data?.errors;
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => (typeof item === "string" ? item : item?.message || item?.field))
    .filter(Boolean);
};

// Moves a draft to PENDING. Resolves to whether it worked; failures are shown here.
export const useSubmitEvent = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitEvent = async (eventId: string): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await (dispatch(submitEventRequest(eventId)) as unknown as Promise<unknown>);
      toast.success(t("eventForm.success.submittedForReview"));
      return true;
    } catch (error: any) {
      const data = error?.response?.data;
      toast.error(data?.message || t("eventForm.errors.submitFailed"), {
        description: getMissingFields(data).join(", ") || undefined,
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitEvent, isSubmitting };
};
