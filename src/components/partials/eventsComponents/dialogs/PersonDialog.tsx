import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
import { FileUpload } from "../FileUpload";
import { toast } from "sonner";

interface PersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person: any;
  onSave: (person: any) => void;
  type: "exhibitor" | "sponsor";
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
      fullName: type === "exhibitor" ? "" : undefined,
      name: type === "sponsor" ? "" : undefined,
      picture: type === "exhibitor" ? "" : undefined,
      logo: type === "sponsor" ? "" : undefined,
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
      setFormData(person);
    } else {
      setFormData({
        _id: undefined,
        fullName: type === "exhibitor" ? "" : undefined,
        name: type === "sponsor" ? "" : undefined,
        picture: type === "exhibitor" ? "" : undefined,
        logo: type === "sponsor" ? "" : undefined,
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

  const handleSave = () => {
    if (type === "sponsor" && !formData.name) {
      toast.error(t("eventForm.addSponsorDialog.validation.required") || "Sponsor name is required");
      return;
    }
    if (type === "exhibitor" && !formData.fullName) {
      toast.error(t("eventForm.addExhibitorDialog.validation.required") || "Exhibitor name is required");
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
              ? t(`eventForm.edit${type === "sponsor" ? "Sponsor" : "Exhibitor"}`) ||
                `Edit ${type}`
              : t(`eventForm.add${type === "exhibitor" ? "ExhibitorDialog.title" : "SponsorDialog.title"}`) ||
                `Add ${type}`}
          </DialogTitle>
          <DialogDescription>
            {t(`eventForm.${type === "exhibitor" ? "addExhibitorDialog.description" : "addSponsorDialog.description"}`) ||
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
                  : t("eventForm.addExhibitorDialog.placeholders.enterName") || "Enter full name"
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              {type === "sponsor"
                ? t("eventForm.addSponsorDialog.fields.logo") || "Logo"
                : t("eventForm.addExhibitorDialog.fields.picture") || "Picture"}
            </label>
            <FileUpload
              onUploadComplete={(url: string | null) => {
                if (url) {
                  setFormData({
                    ...formData,
                    [type === "sponsor" ? "logo" : "picture"]: url,
                  });
                }
              }}
              label={
                ' ' 
              }
              accept="image/*"
            />
            {(type === "sponsor" ? formData.logo : formData.picture) && (
              <div className="mt-2">
                <img
                  src={type === "sponsor" ? formData.logo : formData.picture}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded"
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
                  : t("eventForm.addExhibitorDialog.buttons.addExhibitor") || "Add Exhibitor"
              }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
