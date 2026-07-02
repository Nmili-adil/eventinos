import { useState, useEffect, use } from "react";
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
import { toast } from "sonner";
import { handleAsyncError } from "@/hooks/useGlobalErrorHandler";
import { fetchAllSponsorCategoriesRequest } from "@/store/features/sponsorCategories/sponsorCategories.actions";
import type { RootState } from "@/store/app/rootReducer";
import type { AppDispatch } from "@/store/app/store";

const normalizeCategoryId = (category: any): string =>
  typeof category === "object" && category !== null ? category._id || "" : category || "";

interface PersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person: any;
  onSave: (person: any) => void;
  type: "speaker" | "exhibitor" | "sponsor";
}

export const PersonDialog = ({
  open,
  onOpenChange,
  person,
  onSave,
  type,
}: PersonDialogProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(
    person || {
      _id: undefined,
      fullName: type === "sponsor" ? undefined : "",
      name: type === "sponsor" ? "" : undefined,
      picture: type === "sponsor" ? undefined : "",
      logo: type === "sponsor" ? "" : undefined,
      category: type === "sponsor" ? "" : undefined,
      fonction: type === "sponsor" ? undefined : "",
      nationality: type === "sponsor" ? undefined : "",
      socialNetworks: {
        facebook: "",
        instagram: "",
        linkedin: "",
        twitter: "",
        website: "",
      },
    }
  );

  useEffect(() => {
    if (person) {
      setFormData({ ...person, category: normalizeCategoryId(person.category) });
    } else {
      setFormData({
        _id: undefined,
        fullName: type === "sponsor" ? undefined : "",
        name: type === "sponsor" ? "" : undefined,
        picture: type === "sponsor" ? undefined : "",
        logo: type === "sponsor" ? "" : undefined,
        category: type === "sponsor" ? "" : undefined,
        fonction: type === "sponsor" ? undefined : "",
        nationality: type === "sponsor" ? undefined : "",
        socialNetworks: {
          facebook: "",
          instagram: "",
          linkedin: "",
          twitter: "",
          website: "",
        },
      });
    }
  }, [person, type]);

useEffect(() => {
    if (!open) {
      setFormData(
        person
          ? { ...person, category: normalizeCategoryId(person.category) }
          : {
          _id: undefined,
          fullName: type === "sponsor" ? undefined : "",
          name: type === "sponsor" ? "" : undefined,
          picture: type === "sponsor" ? undefined : "",
          logo: type === "sponsor" ? "" : undefined,
          category: type === "sponsor" ? "" : undefined,
          fonction: type === "sponsor" ? undefined : "",
          nationality: type === "sponsor" ? undefined : "",
          socialNetworks: {
            facebook: "",
            instagram: "",
            linkedin: "",
            twitter: "",
            website: "",
          },
        }
      );
    }
  }, [open]);

  const dispatch = useDispatch<AppDispatch>();
  const sponsorCategories = useSelector((state: RootState) => state.sponsorCategories.all);

  useEffect(() => {
    if (open && type === "sponsor") {
      dispatch(fetchAllSponsorCategoriesRequest());
    }
  }, [open, type, dispatch]);

  const handleSave = () => {
    if (type === "sponsor" && !formData.name) {
      handleAsyncError(new Error("Validation error"), t("eventForm.addSponsorDialog.validation.required") || "Sponsor name is required");
      return;
    }
    if ((type === "exhibitor" || type === "speaker") && !formData.fullName) {
      handleAsyncError(new Error("Validation error"), t(`eventForm.add${type.charAt(0).toUpperCase() + type.slice(1)}Dialog.validation.required`) || `${type} name is required`);
      return;
    }
    onSave(formData);
    onOpenChange(false);
  };

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
          <div>
            <label className="text-sm font-medium">
              {type === "sponsor"
                ? t("eventForm.fields.sponsorName") || "Sponsor Name"
                : t("eventForm.fields.fullName") || "Full Name"}
            </label>
            <Input
              value={type === "sponsor" ? formData.name : formData.fullName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  [type === "sponsor" ? "name" : "fullName"]: e.target.value,
                })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
                }
              }}
              placeholder={
                type === "sponsor"
                  ? t("eventForm.addSponsorDialog.placeholders.enterName") || "Enter sponsor name"
                  : type === "exhibitor" ? t("eventForm.addExhibitorDialog.placeholders.enterName") || "Enter full name" : t("eventForm.addSpeakerDialog.placeholders.enterName") || "Enter full name"
              }
            />
          </div>

          {type === "sponsor" && (
            <div>
              <label className="text-sm font-medium">
                {t("eventForm.addSponsorDialog.fields.category") || "Sponsor Category"}
              </label>
              <Select
                value={formData.category || undefined}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("eventForm.addSponsorDialog.placeholders.selectCategory") || "Select a sponsor category"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {sponsorCategories.map((cat: any) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {type !== "sponsor" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">
                  {t("eventForm.fields.fonction", "Function")}
                </label>
                <Input
                  value={formData.fonction || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fonction: e.target.value,
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSave();
                    }
                  }}
                  placeholder={t("eventForm.placeholders.enterFonction", "Enter job function")}
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  {t("eventForm.fields.nationality", "Nationality")}
                </label>
                <Input
                  value={formData.nationality || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nationality: e.target.value,
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSave();
                    }
                  }}
                  placeholder={t("eventForm.placeholders.enterNationality", "Enter nationality")}
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium">
              {type === "sponsor"
                ? t("eventForm.addSponsorDialog.fields.logo") || "Logo"
                : t("eventForm.addExhibitorDialog.fields.picture") || "Picture"}
            </label>
            <FileUpload
  onUploadComplete={(url: string | null) => {
    // ALWAYS update, even with empty string
    setFormData((prev: any) => ({
      ...prev,
      [type === "sponsor" ? "logo" : "picture"]: url || "",
    }));
  }}
  currentUrl={type === "sponsor" ? formData.logo : formData.picture}
  label={' '}
  accept="image/*"
/>
            {/* Add a more explicit check */}
{(type === "sponsor" ? formData.logo : formData.picture) && 
 (type === "sponsor" ? formData.logo : formData.picture).trim() !== "" && (
  <div className="mt-2">
    <img
      src={type === "sponsor" ? formData.logo : formData.picture}
      alt="Preview"
      className="w-20 h-20 object-cover rounded"
      onError={(e) => {
        // Hide the image if it fails to load
        e.currentTarget.style.display = 'none';
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
              {["facebook", "instagram", "linkedin", "twitter", "website"].map(
                (platform) => (
                  <div key={platform}>
                    <label className="text-xs text-gray-600 capitalize">
                      {platform}
                    </label>
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
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSave();
                        }
                      }}
                      placeholder={`${platform} URL`}
                    />
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("eventForm.buttons.cancel") || "Cancel"}
          </Button>
          <Button type="button" onClick={handleSave}>
            {/* {t("eventForm.addExhibitorDialog.buttons.addExhibitor") || "Save"} */}
            {
                type === "sponsor"
                  ? t("eventForm.addSponsorDialog.buttons.addSponsor") || "Add Sponsor"
                  :type ==="exhibitor" ? t("eventForm.addExhibitorDialog.buttons.addExhibitor") || "Add Exhibitor" : t("eventForm.addSpeakerDialog.buttons.addSpeaker") || "Add Speaker"
              }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
