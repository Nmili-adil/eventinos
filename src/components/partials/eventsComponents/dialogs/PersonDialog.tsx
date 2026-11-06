import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUpload } from "../FileUpload";
import { handleAsyncError } from "@/hooks/useGlobalErrorHandler";
import { fetchAllSponsorCategoriesRequest } from "@/store/features/sponsorCategories/sponsorCategories.actions";
import type { RootState } from "@/store/app/rootReducer";
import type { AppDispatch } from "@/store/app/store";
import { SPONSOR_CATEGORIES_PAGE } from "@/constants/routerConstants";
import { speakerSchema, sponsorSchema } from "@/schema/eventSchema";
import { normalizeCategoryId } from "@/lib/events-utils";
import { expandLegacySpeaker, getPartnerTypeLabel, toSpeakerValues } from "@/lib/event-people";

interface PersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person: any;
  onSave: (person: any) => void;
  type: "speaker" | "exhibitor" | "sponsor";
}

const EMPTY_SOCIAL_NETWORKS = {
  facebook: "",
  instagram: "",
  linkedin: "",
  twitter: "",
  website: "",
};

const toFormValues = (person: any, type: PersonDialogProps["type"]) => {
  if (person) {
    return {
      ...person,
      ...(type === "speaker" ? expandLegacySpeaker(person) : {}),
      category: normalizeCategoryId(person.category),
    };
  }

  if (type === "sponsor") {
    return { _id: undefined, name: "", logo: "", category: "", socialNetworks: { ...EMPTY_SOCIAL_NETWORKS } };
  }

  return {
    _id: undefined,
    fullName: "",
    firstName: "",
    lastName: "",
    jobTitle: "",
    organization: "",
    picture: "",
    fonction: "",
    nationality: "",
    socialNetworks: { ...EMPTY_SOCIAL_NETWORKS },
  };
};

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="mt-1 text-sm text-destructive">{message}</p> : null;

export const PersonDialog = ({
  open,
  onOpenChange,
  person,
  onSave,
  type,
}: PersonDialogProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(() => toFormValues(person, type));
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData(toFormValues(person, type));
    setErrors({});
  }, [person, type, open]);

  const dispatch = useDispatch<AppDispatch>();
  const partnerTypes = useSelector((state: RootState) => state.sponsorCategories.all);
  const isLoadingPartnerTypes = useSelector(
    (state: RootState) => state.sponsorCategories.isLoadingAll
  );

  useEffect(() => {
    if (open && type === "sponsor") {
      dispatch(fetchAllSponsorCategoriesRequest());
    }
  }, [open, type, dispatch]);

  const validate = (schema: typeof speakerSchema | typeof sponsorSchema) => {
    const result = schema.safeParse(formData);
    if (result.success) {
      setErrors({});
      return true;
    }
    const nextErrors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const field = String(issue.path[0]);
      nextErrors[field] ??= issue.message;
    });
    setErrors(nextErrors);
    return false;
  };

  const handleSave = () => {
    if (type === "speaker") {
      if (!validate(speakerSchema)) return;
      onSave({ ...formData, ...toSpeakerValues(formData) });
    } else if (type === "sponsor") {
      if (!validate(sponsorSchema)) return;
      onSave(formData);
    } else {
      if (!formData.fullName) {
        handleAsyncError(
          new Error("Validation error"),
          t("eventForm.addExhibitorDialog.validation.required") || "exhibitor name is required"
        );
        return;
      }
      onSave(formData);
    }
    onOpenChange(false);
  };

  const submitOnEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  };

  const renderTextField = (field: string, label: string, placeholder: string, isRequired = false) => (
    <div>
      <label className="text-sm font-medium">
        {label}
        {isRequired && " *"}
      </label>
      <Input
        value={formData[field] || ""}
        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
        onKeyDown={submitOnEnter}
        placeholder={placeholder}
        aria-invalid={Boolean(errors[field])}
      />
      <FieldError message={errors[field]} />
    </div>
  );

  const imageField = type === "sponsor" ? "logo" : "picture";
  const imageValue = formData[imageField];
  const isImageRequired = type !== "exhibitor";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {person?._id
              ? t(`eventForm.edit${type.charAt(0).toUpperCase() + type.slice(1)}`) ||
                `Edit ${type}`
              : t(`eventForm.add${type.charAt(0).toUpperCase() + type.slice(1)}Dialog.title`) ||
                `Add ${type}`}
          </DialogTitle>
          <DialogDescription>
            {t(`eventForm.add${type.charAt(0).toUpperCase() + type.slice(1)}Dialog.description`) ||
              `Enter ${type} details`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {type === "speaker" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {renderTextField(
                  "firstName",
                  t("eventForm.addSpeakerDialog.fields.firstName"),
                  t("eventForm.addSpeakerDialog.placeholders.firstName"),
                  true
                )}
                {renderTextField(
                  "lastName",
                  t("eventForm.addSpeakerDialog.fields.lastName"),
                  t("eventForm.addSpeakerDialog.placeholders.lastName"),
                  true
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {renderTextField(
                  "jobTitle",
                  t("eventForm.addSpeakerDialog.fields.jobTitle"),
                  t("eventForm.addSpeakerDialog.placeholders.jobTitle"),
                  true
                )}
                {renderTextField(
                  "organization",
                  t("eventForm.addSpeakerDialog.fields.organization"),
                  t("eventForm.addSpeakerDialog.placeholders.organization"),
                  true
                )}
              </div>
              {renderTextField(
                "nationality",
                t("eventForm.fields.nationality", "Nationality"),
                t("eventForm.placeholders.enterNationality", "Enter nationality")
              )}
            </>
          )}

          {type === "exhibitor" && (
            <>
              {renderTextField(
                "fullName",
                t("eventForm.fields.fullName") || "Full Name",
                t("eventForm.addExhibitorDialog.placeholders.enterName") || "Enter full name"
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {renderTextField(
                  "fonction",
                  t("eventForm.fields.fonction", "Function"),
                  t("eventForm.placeholders.enterFonction", "Enter job function")
                )}
                {renderTextField(
                  "nationality",
                  t("eventForm.fields.nationality", "Nationality"),
                  t("eventForm.placeholders.enterNationality", "Enter nationality")
                )}
              </div>
            </>
          )}

          {type === "sponsor" && (
            <>
              {renderTextField(
                "name",
                t("eventForm.fields.sponsorName") || "Sponsor Name",
                t("eventForm.addSponsorDialog.placeholders.enterName") || "Enter sponsor name",
                true
              )}
              <div>
                <label className="text-sm font-medium">
                  {t("eventForm.addSponsorDialog.fields.category")} *
                </label>
                <Select
                  value={formData.category || undefined}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger aria-invalid={Boolean(errors.category)}>
                    <SelectValue placeholder={t("eventForm.addSponsorDialog.placeholders.selectCategory")} />
                  </SelectTrigger>
                  <SelectContent>
                    {partnerTypes.map((partnerType: any) => (
                      <SelectItem key={partnerType._id} value={partnerType._id}>
                        {getPartnerTypeLabel(t, partnerType)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError message={errors.category} />
                {!isLoadingPartnerTypes && partnerTypes.length === 0 && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("eventForm.addSponsorDialog.noCategories")}{" "}
                    <a
                      href={SPONSOR_CATEGORIES_PAGE}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      {t("eventForm.addSponsorDialog.manageCategories")}
                    </a>
                  </p>
                )}
              </div>
            </>
          )}

          <div>
            <label className="text-sm font-medium">
              {type === "sponsor"
                ? t("eventForm.addSponsorDialog.fields.logo") || "Logo"
                : t("eventForm.addExhibitorDialog.fields.picture") || "Picture"}
              {isImageRequired && " *"}
            </label>
            <FileUpload
              onUploadComplete={(url: string | null) => {
                // ALWAYS update, even with empty string
                setFormData((prev: any) => ({ ...prev, [imageField]: url || "" }));
              }}
              currentUrl={imageValue}
              label={" "}
              accept="image/*"
            />
            <FieldError message={errors[imageField]} />
            {imageValue && imageValue.trim() !== "" && (
              <div className="mt-2">
                <img
                  src={imageValue}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded"
                  onError={(e) => {
                    // Hide the image if it fails to load
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">
              {t("eventForm.sections.socialNetworks") || "Social Networks"}
            </h4>
            <div className="space-y-2">
              {["facebook", "instagram", "linkedin", "twitter", "website"].map((platform) => (
                <div key={platform}>
                  <label className="text-xs text-gray-600 capitalize">{platform}</label>
                  <Input
                    value={formData.socialNetworks?.[platform] || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialNetworks: {
                          ...formData.socialNetworks,
                          [platform]: e.target.value,
                        },
                      })
                    }
                    onKeyDown={submitOnEnter}
                    placeholder={`${platform} URL`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("eventForm.buttons.cancel") || "Cancel"}
          </Button>
          <Button type="button" onClick={handleSave}>
            {type === "sponsor"
              ? t("eventForm.addSponsorDialog.buttons.addSponsor") || "Add Sponsor"
              : type === "exhibitor"
                ? t("eventForm.addExhibitorDialog.buttons.addExhibitor") || "Add Exhibitor"
                : t("eventForm.addSpeakerDialog.buttons.addSpeaker") || "Add Speaker"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
