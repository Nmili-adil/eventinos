import type { Control } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { EventLogoInput } from "./EventLogoInput";

interface OrganizerFieldsProps {
  control: Control<any>;
  disabled?: boolean;
}

export const OrganizerFields = ({ control, disabled = false }: OrganizerFieldsProps) => {
  const { t } = useTranslation();

  const contactFields = [
    { name: "organizer.website", label: "eventForm.fields.organizerWebsite", type: "url" },
    { name: "organizer.email", label: "eventForm.fields.organizerEmail", type: "email" },
    { name: "organizer.phone", label: "eventForm.fields.organizerPhone", type: "tel" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 items-start">
        <FormField
          control={control}
          name="organizer.name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("eventForm.fields.organizer")} *</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("eventForm.placeholders.organizer")}
                  disabled={disabled}
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="organizer.logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("eventForm.fields.organizerLogo")}</FormLabel>
              <FormControl>
                <EventLogoInput
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                  chooseLabel={t("common.upload", "Upload")}
                  clearLabel={t("common.delete", "Delete")}
                  placeholder={t(
                    "eventForm.placeholders.enterLogoUrl",
                    "https://example.com/logo.jpg"
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {contactFields.map(({ name, label, type }) => (
          <FormField
            key={name}
            control={control}
            name={name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t(label)}</FormLabel>
                <FormControl>
                  <Input type={type} disabled={disabled} {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </div>
    </div>
  );
};
