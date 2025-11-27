import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Member } from "@/types/membersType";
import { useTranslation } from "react-i18next";

interface MemberEditDialogProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (memberId: string, data: Partial<Member>) => Promise<void>;
  isLoading?: boolean;
}

interface MemberFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  city: string;
  country: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  isActive: boolean;
}

const MemberEditDialog = ({
  member,
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}: MemberEditDialogProps) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<MemberFormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      city: "",
      country: "",
      gender: "MALE",
      isActive: true,
    },
  });

  const isActive = watch("isActive");

  useEffect(() => {
    if (member && isOpen) {
      reset({
        firstName: member.firstName || "",
        lastName: member.lastName || "",
        email: member.email || "",
        phoneNumber: member.phoneNumber || "",
        city: member.city || "",
        country: member.country || "",
        gender: member.gender || "MALE",
        isActive: member.isActive ?? true,
      });
    }
  }, [member, isOpen, reset]);

  const onSubmit = async (data: MemberFormData) => {
    if (!member) return;

    try {
      await onSave(member._id.toString(), data);
      onClose();
    } catch (error) {
      console.error("Failed to update member:", error);
    }
  };

  if (!member) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] border-slate-300">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {t("members.editDialog.title", "Edit Member")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "members.editDialog.description",
              "Update member information. Changes will be saved immediately."
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">
                  {t(
                    "members.editDialog.sections.personalInfo",
                    "Personal Information"
                  )}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      {t("members.editDialog.fields.firstName", "First Name")} *
                    </Label>
                    <Input
                      id="firstName"
                      {...register("firstName", {
                        required: t(
                          "members.editDialog.validation.required",
                          "This field is required"
                        ),
                      })}
                      placeholder={t(
                        "members.editDialog.placeholders.enterFirstName",
                        "Enter first name"
                      )}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-destructive">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      {t("members.editDialog.fields.lastName", "Last Name")} *
                    </Label>
                    <Input
                      id="lastName"
                      {...register("lastName", {
                        required: t(
                          "members.editDialog.validation.required",
                          "This field is required"
                        ),
                      })}
                      placeholder={t(
                        "members.editDialog.placeholders.enterLastName",
                        "Enter last name"
                      )}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-destructive">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">
                      {t("members.editDialog.fields.gender", "Gender")}
                    </Label>
                    <select
                      value={watch("gender")}
                      onChange={(e) =>
                        setValue("gender", e.target.value as "MALE" | "FEMALE")
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-transparent"
                    >
                      <option value="" disabled>
                        {t(
                          "members.editDialog.placeholders.selectGender",
                          "Select gender"
                        )}
                      </option>

                      <option value="MALE">
                        {t("members.editDialog.genderOptions.male", "Male")}
                      </option>

                      <option value="FEMALE">
                        {t("members.editDialog.genderOptions.female", "Female")}
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Contact Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">
                  {t(
                    "members.editDialog.sections.contactInfo",
                    "Contact Information"
                  )}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      {t("members.editDialog.fields.email", "Email Address")} *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email", {
                        required: t(
                          "members.editDialog.validation.required",
                          "This field is required"
                        ),
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: t(
                            "members.editDialog.validation.invalidEmail",
                            "Invalid email address"
                          ),
                        },
                      })}
                      placeholder={t(
                        "members.editDialog.placeholders.enterEmail",
                        "Enter email address"
                      )}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">
                      {t(
                        "members.editDialog.fields.phoneNumber",
                        "Phone Number"
                      )}
                    </Label>
                    <Input
                      id="phoneNumber"
                      {...register("phoneNumber")}
                      placeholder={t(
                        "members.editDialog.placeholders.enterPhone",
                        "Enter phone number"
                      )}
                    />
                    {errors.phoneNumber && (
                      <p className="text-sm text-destructive">
                        {errors.phoneNumber.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Location Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">
                  {t(
                    "members.editDialog.sections.locationInfo",
                    "Location Information"
                  )}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">
                      {t("members.editDialog.fields.city", "City")}
                    </Label>
                    <Input
                      id="city"
                      {...register("city")}
                      placeholder={t(
                        "members.editDialog.placeholders.enterCity",
                        "Enter city"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">
                      {t("members.editDialog.fields.country", "Country")}
                    </Label>
                    <Input
                      id="country"
                      {...register("country")}
                      placeholder={t(
                        "members.editDialog.placeholders.enterCountry",
                        "Enter country"
                      )}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Account Status */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">
                  {t(
                    "members.editDialog.sections.accountStatus",
                    "Account Status"
                  )}
                </h4>
                <div className="space-y-2">
                  <Label htmlFor="isActive">
                    {t(
                      "members.editDialog.fields.accountStatus",
                      "Account Status"
                    )}
                  </Label>
                  <select
  value={isActive ? "active" : "inactive"}
  onChange={(e) => setValue("isActive", e.target.value === "active")}
  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-transparent"
>
  <option value="" disabled>
    {t("members.editDialog.placeholders.selectStatus", "Select status")}
  </option>

  <option value="active">
    {t("members.editDialog.statusOptions.active", "Active")}
  </option>

  <option value="inactive">
    {t("members.editDialog.statusOptions.inactive", "Inactive")}
  </option>
</select>

                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              {t("members.editDialog.buttons.cancel", "Cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {t("members.editDialog.buttons.saving", "Saving...")}
                </>
              ) : (
                t("members.editDialog.buttons.save", "Save Changes")
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MemberEditDialog;
