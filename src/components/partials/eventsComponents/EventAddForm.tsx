import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { eventFormSchema, type EventFormData } from "@/schema/eventSchema";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Pencil,
  Loader2,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store/app/store";
import type { RootState } from "@/store/app/rootReducer";
import { fetchCategoriesRequest } from "@/store/features/categories/categories.actions";
import { fetchBadgesRequest } from "@/store/features/badges/badges.actions";
import { FileUpload } from "./FileUpload";
import { EventPreview } from "./EventPreview";
import {
  LocationSelector,
  type LocationValue,
} from "@/components/shared/location-selector";
import { useTranslation } from "react-i18next";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { CustomSelect } from "@/components/shared/custom-select";
import { PersonDialog } from "./dialogs/PersonDialog";
import { toast } from "sonner";
import { deleteFileApi } from "@/api/filesApi";

interface EventAddFormProps {
  onSubmit: (data: EventFormData) => void;
  isLoading?: boolean;
}

const EventAddForm = ({ onSubmit, isLoading = false }: EventAddFormProps) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [speakerDialog, setSpeakerDialog] = useState<{
    open: boolean;
    person: any;
  }>({
    open: false,
    person: null,
  });
  const [exhibitorDialog, setExhibitorDialog] = useState<{
    open: boolean;
    person: any;
  }>({
    open: false,
    person: null,
  });
  const [sponsorDialog, setSponsorDialog] = useState<{
    open: boolean;
    person: any;
  }>({
    open: false,
    person: null,
  });
  const { t } = useTranslation();

  const dispatch = useDispatch<AppDispatch>();
  const { categories } = useSelector((state: RootState) => state.categories);
  const { badges } = useSelector((state: RootState) => state.badges);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema) as any,
    defaultValues: {
      createdBy: "",
      name: "",
      description: "",
      image: "",
      visibility: "PUBLIC",
      type: "FACETOFACE",
      isNearestEvent: false,
      isUpComingEvent: false,
      status: "PENDING",
      startDate: { date: "", time: "" },
      endDate: { date: "", time: "" },
      location: {
        location: { lat: 0, lng: 0 },
        name: "",
        address: "",
        place_id: "",
        city: "",
        country: "",
        countryCode: "",
      },
      socialNetworks: {
        facebook: "",
        instagram: "",
        linkedin: "",
        twitter: "",
        website: "",
      },
      category: "",
      badges: [],
      speakers: [],
      exhibitors: [],
      sponsors: [],
      gallery: [],
      program: "",
      requirements: [],
      capacity: 0,
      allowRegistration: false,
      registrationDeadline: { date: "", time: "" },
      tags: [],
    },
  });

  const navigate = useNavigate();

  // Field arrays for dynamic fields
  const {
    fields: speakerFields,
    append: appendSpeaker,
    remove: removeSpeaker,
  } = useFieldArray({
    control: form.control,
    name: "speakers",
  });

  const {
    fields: exhibitorFields,
    append: appendExhibitor,
    remove: removeExhibitor,
  } = useFieldArray({
    control: form.control,
    name: "exhibitors",
  });

  const {
    fields: sponsorFields,
    append: appendSponsor,
    remove: removeSponsor,
  } = useFieldArray({
    control: form.control,
    name: "sponsors",
  });

  useEffect(() => {
    dispatch(fetchCategoriesRequest());
    dispatch(fetchBadgesRequest());
  }, []);


  const sections = [
    { id: 0, title: t("eventForm.sections.basicInfo"), color: "blue" },
    { id: 1, title: t("eventForm.sections.dateTime"), color: "green" },
    { id: 2, title: t("eventForm.sections.location"), color: "purple" },
    { id: 3, title: t("eventForm.sections.socialNetworks"), color: "orange" },
    { id: 4, title: t("eventForm.sections.program"), color: "red" },
    { id: 5, title: t("eventForm.sections.badges"), color: "yellow" },
    { id: 6, title: t("eventForm.sections.gallery"), color: "pink" },
    {
      id: 7,
      title: t("eventForm.sections.speakersExhibitorsSponsors"),
      color: "indigo",
    },
  ];

  const handleNext = async () => {
    const fieldsToValidate = getSectionFields(currentSection);
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid && currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const getSectionFields = (section: number): (keyof EventFormData)[] => {
    switch (section) {
      case 0:
        return [
          "name",
          "description",
          "image",
          "visibility",
          "type",
          "status",
          "category",
          "capacity",
          "isNearestEvent",
          "isUpComingEvent",
          "allowRegistration",
        ];
      case 1:
        return ["startDate", "endDate"] as (keyof EventFormData)[];
      case 2:
        return [
          "location.name",
          "location.city",
          "location.country",
          "location.countryCode",
          "location.place_id",
        ] as unknown as (keyof EventFormData)[];
      case 3:
        return ["socialNetworks"] as (keyof EventFormData)[];
      case 4:
        return ["program"] as (keyof EventFormData)[];
      case 5:
        return ["badges"] as (keyof EventFormData)[];
      case 6:
        return ["gallery"] as (keyof EventFormData)[];
      case 7:
        return ["speakers", "exhibitors", "sponsors"] as (keyof EventFormData)[];
      default:
        return [];
    }
  };

  const handleSubmit = (data: EventFormData) => {


    if (currentSection !== sections.length - 1) {
      console.log("Not on last section, preventing submission");
      return;
    }

    const extractTime = (isoString: string): string => {
      if (!isoString) return "";
      try {
        const date = new Date(isoString);
        return date.toTimeString().slice(0, 5);
      } catch {
        return "";
      }
    };

    const cleaned = {
      ...data,
      image: data.image?.trim() || "",
      socialNetworks: {
        facebook: data.socialNetworks?.facebook?.trim() || "",
        instagram: data.socialNetworks?.instagram?.trim() || "",
        linkedin: data.socialNetworks?.linkedin?.trim() || "",
        twitter: data.socialNetworks?.twitter?.trim() || "",
        website: data.socialNetworks?.website?.trim() || "",
      },
      startDate: {
        date: data.startDate?.date || "",
        time: extractTime(data.startDate?.date || ""),
      },
      endDate: {
        date: data.endDate?.date || "",
        time: extractTime(data.endDate?.date || ""),
      },
      location: {
        ...data.location,
        location: {
          lat: Number(data.location.location.lat) || 0,
          lng: Number(data.location.location.lng) || 0,
        },
      },
      speakers: data.speakers || [],
      exhibitors: data.exhibitors || [],
      sponsors: data.sponsors || [],
    } as EventFormData;

    onSubmit(cleaned);
  };

  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16);
    } catch {
      return "";
    }
  };

  const parseDateFromInput = (inputValue: string): string => {
    if (!inputValue) return "";
    try {
      const date = new Date(inputValue);
      return date.toISOString();
    } catch {
      return inputValue;
    }
  };

  const formData = form.watch();

  const handleLocationChange = (updated: LocationValue) => {
    const current = form.getValues("location");
    form.setValue(
      "location",
      {
        ...current,
        name: updated.name ?? current.name,
        address: updated.address ?? current.address,
        city: updated.city ?? current.city,
        country: updated.country ?? current.country,
        countryCode: updated.countryCode ?? current.countryCode,
        place_id: updated.place_id ?? current.place_id,
        location: updated.location
          ? {
              lat: Number((updated.location as any).lat) || 0,
              lng: Number((updated.location as any).lng) || 0,
            }
          : current.location,
      },
      { shouldDirty: true }
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl relative">
      <div className="flex flex-col lg:flex-row gap-6 relative">
        {/* Form Section */}
        <div
          className={`flex-1 transition-all ${
            showPreview ? "lg:w-2/3" : "lg:w-full"
          }`}
        >
          <Card className="border-slate-300 max-h-[83vh] overflow-y-hidden relative">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl md:text-2xl font-bold">
                  {t("eventForm.title")}
                </CardTitle>
                <p className="text-muted-foreground text-sm md:text-base">
                  {t("eventForm.description")}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="flex"
              >
                {showPreview ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">
                      {t("eventForm.preview.hide")}
                    </span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">
                      {t("eventForm.preview.show")}
                    </span>
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col h-full justify-between overflow-y-hidden">
              {/* Progress Indicator */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  {sections.map((section, index) => (
                    <div key={section.id} className="flex items-center flex-1">
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                          index === currentSection
                            ? "border-blue-500 bg-blue-500 text-white"
                            : index < currentSection
                            ? "border-green-500 bg-green-500 text-white"
                            : "border-gray-300 bg-white text-gray-400"
                        }`}
                      >
                        {index + 1}
                      </div>
                      {index < sections.length - 1 && (
                        <div
                          className={`flex-1 h-1 mx-2 transition-all ${
                            index < currentSection
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between">
                  {sections.map((section, index) => (
                    <div
                      key={section.id}
                      className={`text-xs text-center flex-1 ${
                        index === currentSection
                          ? "font-semibold"
                          : "text-gray-500"
                      }`}
                    >
                      {section.title}
                    </div>
                  ))}
                </div>
              </div>

              <Form {...form}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    // e.stopPropagation();
                    // if (currentSection === sections.length - 1) {
                    //   form.handleSubmit(handleSubmit)(e);
                    // }
                  }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  {/* Section 0: Basic Information */}
                  <div className="flex-1 overflow-y-auto space-y-6 px-1">
                    {currentSection === 0 && (
                      <div className="space-y-4 animate-in fade-in duration-300 inset-0 overflow-y-auto pb-4">
                        <h3 className="text-lg font-semibold">
                          {t("eventForm.sections.basicInfo")}
                        </h3>

                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t("eventForm.fields.name")} *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={t(
                                    "eventForm.placeholders.enterEventName"
                                  )}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t("eventForm.fields.description")} *
                              </FormLabel>
                              <FormControl>
                                <RichTextEditor
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  onBlur={field.onBlur}
                                  placeholder={t(
                                    "eventForm.placeholders.enterDescription"
                                  )}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          <FormField
                            control={form.control}
                            name="visibility"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  {t("eventForm.fields.visibility")}
                                </FormLabel>
                                <FormControl>
                                  <CustomSelect
                                    value={field.value}
                                    onChange={field.onChange}
                                    options={[
                                      {
                                        value: "PUBLIC",
                                        label: t(
                                          "eventForm.options.visibility.public"
                                        ),
                                      },
                                      {
                                        value: "PRIVATE",
                                        label: t(
                                          "eventForm.options.visibility.private"
                                        ),
                                      },
                                    ]}
                                    placeholder={t(
                                      "eventForm.placeholders.selectVisibility"
                                    )}
                                    disabled={isLoading}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  {t("eventForm.fields.categories")}
                                </FormLabel>
                                <FormControl>
                                  <CustomSelect
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                    options={
                                      categories?.map((category: any) => ({
                                        value: category._id,
                                        label: category.name,
                                      })) || []
                                    }
                                    placeholder={t(
                                      "eventForm.placeholders.selectCategory"
                                    )}
                                    disabled={isLoading}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  {t("eventForm.fields.type")}
                                </FormLabel>
                                <FormControl>
                                  <CustomSelect
                                    value={field.value}
                                    onChange={field.onChange}
                                    options={[
                                      {
                                        value: "FACETOFACE",
                                        label: t(
                                          "eventForm.options.type.faceToFace"
                                        ),
                                      },
                                      {
                                        value: "VIRTUEL",
                                        label: t(
                                          "eventForm.options.type.virtual"
                                        ),
                                      },
                                    ]}
                                    placeholder={t(
                                      "eventForm.placeholders.selectType"
                                    )}
                                    disabled={isLoading}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  {t("eventForm.fields.status")}
                                </FormLabel>
                                <FormControl>
                                  <CustomSelect
                                    value={field.value}
                                    onChange={field.onChange}
                                    options={[
                                      {
                                        value: "PENDING",
                                        label: t(
                                          "eventForm.options.status.pending"
                                        ),
                                      },
                                      {
                                        value: "ACCEPTED",
                                        label: t(
                                          "eventForm.options.status.accepted"
                                        ),
                                      },
                                      {
                                        value: "REFUSED",
                                        label: t(
                                          "eventForm.options.status.refused"
                                        ),
                                      },
                                      {
                                        value: "CLOSED",
                                        label: t(
                                          "eventForm.options.status.closed"
                                        ),
                                      },
                                    ]}
                                    placeholder={t(
                                      "eventForm.placeholders.selectStatus"
                                    )}
                                    disabled={isLoading}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="min-h-[100px]">
                          <FormField
                            control={form.control}
                            name="image"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <div className="space-y-2">
                                    <FileUpload
                                      onUploadComplete={(url) =>
                                        field.onChange(url)
                                      }
                                      currentUrl={field.value || ""}
                                      label={t("eventForm.buttons.uploadImage")}
                                      accept="image/*"
                                      disabled={isLoading}
                                    />
                                    <div className="text-xs text-muted-foreground">
                                      {t(
                                        "eventForm.placeholders.enterImageUrlManual"
                                      )}
                                    </div>
                                    <Input
                                      placeholder={t(
                                        "eventForm.placeholders.enterImageUrl"
                                      )}
                                      {...field}
                                      value={field.value || ""}
                                      onChange={(e) =>
                                        field.onChange(e.target.value)
                                      }
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="capacity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  {t("eventForm.fields.capacity")}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder={t(
                                      "eventForm.placeholders.enterCapacity"
                                    )}
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                  />
                                </FormControl>
                                <FormDescription>
                                  {t("eventForm.descriptions.capacity")}
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="tags"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t("eventForm.fields.tags")}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={t(
                                    "eventForm.placeholders.enterTags"
                                  )}
                                  value={
                                    Array.isArray(field.value)
                                      ? field.value.join(", ")
                                      : ""
                                  }
                                  onChange={(e) => {
                                    const tagsArray = e.target.value
                                      .split(",")
                                      .map((tag) => tag.trim())
                                      .filter((tag) => tag.length > 0);
                                    field.onChange(tagsArray);
                                  }}
                                />
                              </FormControl>
                              <FormDescription>
                                {t("eventForm.descriptions.tags")}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="requirements"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t("eventForm.fields.requirements")}
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder={t(
                                    "eventForm.placeholders.enterRequirements"
                                  )}
                                  value={
                                    Array.isArray(field.value)
                                      ? field.value.join("\n")
                                      : ""
                                  }
                                  onChange={(e) => {
                                    const requirementsArray = e.target.value
                                      .split("\n")
                                      .map((req) => req.trim())
                                      .filter((req) => req.length > 0);
                                    field.onChange(requirementsArray);
                                  }}
                                  rows={4}
                                />
                              </FormControl>
                              <FormDescription>
                                {t("eventForm.descriptions.requirements")}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-sm">
                            {t("eventForm.labels.eventHighlights")}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="isNearestEvent"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>
                                      {t("eventForm.labels.markAsNearestEvent")}
                                    </FormLabel>
                                    <FormDescription>
                                      {t(
                                        "eventForm.descriptions.isNearestEvent"
                                      )}
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="isUpComingEvent"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>
                                      {t(
                                        "eventForm.labels.markAsUpcomingEvent"
                                      )}
                                    </FormLabel>
                                    <FormDescription>
                                      {t(
                                        "eventForm.descriptions.isUpcomingEvent"
                                      )}
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Section 1: Date & Time */}
                    {currentSection === 1 && (
                      <div className="space-y-4 animate-in fade-in duration-300">
                        <h3 className="text-lg font-semibold">
                          {t("eventForm.sections.dateTime")}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <Label className="text-base font-medium">
                              {t("eventForm.fields.startDate")} *
                            </Label>

                            <FormField
                              control={form.control}
                              name="startDate.date"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    {t("eventForm.fields.startDate")}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="datetime-local"
                                      {...field}
                                      value={formatDateForInput(field.value)}
                                      onChange={(e) => {
                                        const newValue = parseDateFromInput(
                                          e.target.value
                                        );
                                        field.onChange(newValue);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="space-y-4">
                            <Label className="text-base font-medium">
                              {t("eventForm.fields.endDate")} *
                            </Label>

                            <FormField
                              control={form.control}
                              name="endDate.date"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    {t("eventForm.fields.endDate")}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="datetime-local"
                                      {...field}
                                      value={formatDateForInput(field.value)}
                                      onChange={(e) => {
                                        const newValue = parseDateFromInput(
                                          e.target.value
                                        );
                                        field.onChange(newValue);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        <div>
                          <FormField
                            control={form.control as any}
                            name="allowRegistration"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>
                                    {t("eventForm.fields.allowRegistration")}
                                  </FormLabel>
                                  <FormDescription>
                                    {t(
                                      "eventForm.descriptions.allowRegistration"
                                    )}
                                  </FormDescription>
                                </div>
                              </FormItem>
                            )}
                          />

                          {form.watch("allowRegistration") && (
                            <FormField
                              control={form.control as any}
                              name="registrationDeadline.date"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    {t("eventForm.fields.registrationDeadline")}
                                  </FormLabel>
                                  <FormControl>
                                    <Input type="datetime-local" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    {t(
                                      "eventForm.descriptions.registrationDeadline"
                                    )}
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </div>

                        {form.formState.errors.endDate?.date && (
                          <div className="text-sm text-red-500 mt-2">
                            {form.formState.errors.endDate.date.message}
                          </div>
                        )}
                      </div>
                    )}
                    {/* Section 2: Location */}
                    {currentSection === 2 && (
                      <div className="space-y-4 animate-in fade-in duration-300">
                        <h3 className="text-lg font-semibold">
                          {t("eventForm.sections.location")}
                        </h3>
                        <LocationSelector
                          value={{
                            name: form.watch("location.name"),
                            address: form.watch("location.address"),
                            city: form.watch("location.city"),
                            country: form.watch("location.country"),
                            countryCode: form.watch("location.countryCode"),
                            place_id: form.watch("location.place_id"),
                            location: form.watch("location.location"),
                          }}
                          onChange={handleLocationChange}
                          defaultMode={
                            form.watch("location.place_id") ? "map" : "manual"
                          }
                        />
                      </div>
                    )}
                    {/* Section 3: Social Networks */}
                    {currentSection === 3 && (
                      <div className="space-y-4 animate-in fade-in duration-300">
                        <h3 className="text-lg font-semibold">
                          {t("eventForm.sections.socialNetworks")}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control as any}
                            name="socialNetworks.website"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  {t("eventForm.fields.website")}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder={t(
                                      "eventForm.placeholders.enterWebsite"
                                    )}
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control as any}
                            name="socialNetworks.facebook"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  {t("eventForm.fields.facebook")}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder={t(
                                      "eventForm.placeholders.enterFacebook"
                                    )}
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control as any}
                            name="socialNetworks.instagram"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  {t("eventForm.fields.instagram")}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder={t(
                                      "eventForm.placeholders.enterInstagram"
                                    )}
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control as any}
                            name="socialNetworks.twitter"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  {t("eventForm.fields.twitter")}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder={t(
                                      "eventForm.placeholders.enterTwitter"
                                    )}
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control as any}
                            name="socialNetworks.linkedin"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  {t("eventForm.fields.linkedin")}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder={t(
                                      "eventForm.placeholders.enterLinkedIn"
                                    )}
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}
                    {/* Section 4: Program */}
                    {currentSection === 4 && (
                      <div className="space-y-4 animate-in fade-in duration-300">
                        <h3 className="text-lg font-semibold">
                          {t("eventForm.sections.program")}
                        </h3>

                        <FormField
                          control={form.control}
                          name="program"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t("eventForm.fields.program")}
                              </FormLabel>
                              <FormControl>
                                <RichTextEditor
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  onBlur={field.onBlur}
                                  placeholder={t(
                                    "eventForm.placeholders.enterProgram"
                                  )}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                    {/* Section 5: Badges */}
                    {currentSection === 5 && (
                      <div className="space-y-4 animate-in fade-in duration-300">
                        <h3 className="text-lg font-semibold">
                          {t("eventForm.sections.badges")}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {t("eventForm.descriptions.badges")}
                        </p>

                        <FormField
                          control={form.control}
                          name="badges"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t("eventForm.labels.availableBadges")}
                              </FormLabel>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                                {badges && badges.length > 0 ? (
                                  badges.map((badge: any) => (
                                    <div
                                      key={badge._id}
                                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                        field.value?.includes(badge._id)
                                          ? "border-blue-500 bg-blue-50"
                                          : "border-gray-200 hover:border-gray-300"
                                      }`}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const currentBadges = field.value || [];
                                        if (currentBadges.includes(badge._id)) {
                                          field.onChange(
                                            currentBadges.filter(
                                              (id: string) => id !== badge._id
                                            )
                                          );
                                        } else {
                                          field.onChange([
                                            ...currentBadges,
                                            badge._id,
                                          ]);
                                        }
                                      }}
                                    >
                                      <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0">
                                          {badge.icon ? (
                                            <img
                                              src={badge.icon}
                                              alt={badge.name}
                                              className="w-12 h-12 object-cover rounded"
                                            />
                                          ) : (
                                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                              <span className="text-2xl">
                                                🏆
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h4 className="font-medium text-sm truncate">
                                            {badge.name}
                                          </h4>
                                          {badge.description && (
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                              {badge.description}
                                            </p>
                                          )}
                                          {field.value?.includes(badge._id) && (
                                            <div className="mt-2 text-xs text-blue-600 font-medium">
                                              ✓ {t("eventForm.labels.selected")}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="col-span-full text-center py-8 text-gray-500">
                                    {t("eventForm.labels.noBadges")}
                                  </div>
                                )}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {form.watch("badges")?.length > 0 && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium text-blue-900">
                              {t("eventForm.labels.selectedBadges")}:{" "}
                              {form.watch("badges").length}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Section 6: Gallery */}
                    {currentSection === 6 && (
                      <div className="space-y-1 animate-in fade-in duration-300">
                        <h3 className="text-lg font-semibold">
                          {t("eventForm.sections.gallery")}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {t("eventForm.descriptions.gallery")}
                        </p>

                        <FormField
                          control={form.control}
                          name="gallery"
                          render={({ field }) => (
                            <FormItem>
                              {/* <FormLabel>{t('eventForm.fields.galleryImages')}</FormLabel> */}
                              <div className="space-y-4">
                                <FileUpload
                                  onUploadComplete={(url, fileId) => {
                                    if (url) {
                                      const currentGallery = field.value || [];
                                      field.onChange([
                                        ...currentGallery,
                                        url,
                                      ]);
                                    }
                                  }}
                                  resetAfterUpload={true}
                                  currentUrl={""}
                                  label={t(
                                    "eventForm.buttons.uploadGalleryImage"
                                  )}
                                  accept="image/*"
                                  disabled={isLoading}
                                />

                                <div className="flex gap-2">
                                  <Input
                                    type="url"
                                    placeholder={t(
                                      "eventForm.placeholders.enterImageUrlGallery"
                                    )}
                                    value={newImageUrl}
                                    onChange={(e) =>
                                      setNewImageUrl(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        if (newImageUrl.trim()) {
                                          const currentGallery =
                                            field.value || [];
                                          field.onChange([
                                            ...currentGallery,
                                            newImageUrl.trim(),
                                          ]);
                                          setNewImageUrl("");
                                        }
                                      }
                                    }}
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      if (newImageUrl.trim()) {
                                        const currentGallery =
                                          field.value || [];
                                        field.onChange([
                                          ...currentGallery,
                                          newImageUrl.trim(),
                                        ]);
                                        setNewImageUrl("");
                                      }
                                    }}
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    {t("eventForm.buttons.addUrl")}
                                  </Button>
                                </div>

                                    {field.value && field.value.length > 0 ? (
                                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                        {field.value.map(
                                          (imageUrl: string, index: number) => {
                                            if (!imageUrl) return null;

                                            return (
                                              <div
                                                key={index}
                                                className="relative group rounded-lg h-40 overflow-hidden border border-gray-200 aspect-square"
                                              >
                                                <img
                                                  src={imageUrl}
                                                  alt={t(
                                                    "eventForm.labels.imageNumber",
                                                    { number: index + 1 }
                                                  )}
                                                  className="w-full h-full object-cover"
                                                  onError={(e) => {
                                                    const target =
                                                      e.target as HTMLImageElement;
                                                    target.src =
                                                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                                                  }}
                                                />
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                                                  <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={async (e) => {
                                                      e.preventDefault();
                                                      e.stopPropagation();

                                                      try {
                                                        // Extract fileId from URL
                                                        const extractFileIdFromUrl = (
                                                          url: string
                                                        ):
                                                          | string
                                                          | null => {
                                                          const match =
                                                            url.match(
                                                              /\/uploads\/([a-fA-F0-9]{24})/
                                                            );
                                                          return match
                                                            ? match[1]
                                                            : null;
                                                        };

                                                        const extractedFileId =
                                                          extractFileIdFromUrl(
                                                            imageUrl
                                                          );
                                                        if (extractedFileId) {
                                                          await deleteFileApi(
                                                            extractedFileId
                                                          );
                                                          toast.success(
                                                            "Image deleted successfully"
                                                          );
                                                        } else {
                                                          // If we can't extract fileId, try with URL (may fail)
                                                          try {
                                                            await deleteFileApi(
                                                              imageUrl
                                                            );
                                                            toast.success(
                                                              "Image deleted successfully"
                                                            );
                                                          } catch (urlError: any) {
                                                            toast.error(
                                                              "Image removed locally but could not delete from server"
                                                            );
                                                          }
                                                        }

                                                        // Remove from UI
                                                        const currentGallery =
                                                          field.value || [];
                                                        field.onChange(
                                                          currentGallery.filter(
                                                            (
                                                              _: any,
                                                              i: number
                                                            ) => i !== index
                                                          )
                                                        );
                                                      } catch (error: any) {
                                                        toast.error(
                                                          error.message ||
                                                            "Failed to delete image"
                                                        );
                                                      }
                                                    }}
                                                  >
                                                    <Trash2 className="w-4 h-4" />
                                                  </Button>
                                                </div>
                                                <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                                                  {index + 1}
                                                </div>
                                              </div>
                                            );
                                          }
                                        )}
                                      </div>
                                    ) : (
                                      // ... rest of your gallery code
                                      <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                                        <p className="text-gray-500">
                                          {t("eventForm.labels.noImages")}
                                        </p>
                                        <p className="text-sm text-gray-400 mt-1">
                                          {t(
                                            "eventForm.labels.noImagesDescription"
                                          )}
                                        </p>
                                      </div>
                                    )}
                                

                                {field.value && field.value.length > 0 && (
                                  <div className="text-sm text-gray-600">
                                    {t("eventForm.labels.totalImages")}:{" "}
                                    <span className="font-medium">
                                      {field.value.length}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                    {/* Section 7: Speakers, Exhibitors & Sponsors */}
                    {currentSection === 7 && (
                      <div className="space-y-6 animate-in fade-in duration-300">
                        <h3 className="text-lg font-semibold">
                          {t("eventForm.sections.speakersExhibitorsSponsors")}
                        </h3>

                        {/* Speakers Section */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-md font-medium">
                              {t("eventForm.fields.speakers")}
                            </h4>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() =>
                                setSpeakerDialog({ open: true, person: null })
                              }
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              {t("eventForm.buttons.addSpeaker")}
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {speakerFields.map((field, index) => (
                              <Card key={field.id} className="p-2">
                                <div className="flex gap-3">
                                  {field.picture && (
                                    <img
                                      src={field.picture}
                                      alt={field.fullName}
                                      className="w-12 h-12 rounded object-cover"
                                    />
                                  )}
                                  <div className="flex-1 flex items-center justify-between min-w-0">
                                    <h4 className="font-medium truncate text-sm">
                                      {field.fullName}
                                    </h4>
                                    <div className="flex gap-2 mt-2">
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          setSpeakerDialog({
                                            open: true,
                                            person: { ...field, index },
                                          })
                                        }
                                      >
                                        <Pencil className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => removeSpeaker(index)}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            ))}
                            {speakerFields.length === 0 && (
                              <div className="col-span-full text-center py-8 text-gray-500">
                                {t("eventForm.labels.noSpeakers") ||
                                  "No speakers added yet"}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Exhibitors Section */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-md font-medium">
                              {t("eventForm.fields.exhibitors")}
                            </h4>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() =>
                                setExhibitorDialog({ open: true, person: null })
                              }
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              {t("eventForm.buttons.addExhibitor")}
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {exhibitorFields.map((field, index) => (
                              <Card key={field.id} className="p-2">
                                <div className="flex gap-3">
                                  {field.picture && (
                                    <img
                                      src={field.picture}
                                      alt={field.fullName}
                                      className="w-12 h-12 rounded object-cover"
                                    />
                                  )}
                                  <div className="flex-1 flex items-center justify-between min-w-0">
                                    <h4 className="font-medium truncate text-sm">
                                      {field.fullName}
                                    </h4>
                                    <div className="flex gap-2 mt-2">
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          setExhibitorDialog({
                                            open: true,
                                            person: { ...field, index },
                                          })
                                        }
                                      >
                                        <Pencil className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => removeExhibitor(index)}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            ))}
                            {exhibitorFields.length === 0 && (
                              <div className="col-span-full text-center py-8 text-gray-500">
                                {t("eventForm.labels.noExhibitors") ||
                                  "No exhibitors added yet"}
                              </div>
                            )}
                          </div>
                        </div>{" "}
                        {/* Sponsors Section */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-md font-medium">
                              {t("eventForm.fields.sponsors")}
                            </h4>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() =>
                                setSponsorDialog({ open: true, person: null })
                              }
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              {t("eventForm.buttons.addSponsor")}
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {sponsorFields.map((field, index) => (
                              <Card key={field.id} className="p-2">
                                <div className="flex gap-3">
                                  {field.logo && (
                                    <img
                                      src={field.logo}
                                      alt={field.name}
                                      className="w-12 h-12 rounded object-cover"
                                    />
                                  )}
                                  <div className="flex-1 flex items-center justify-between min-w-0">
                                    <h4 className="font-medium truncate text-sm">
                                      {field.name}
                                    </h4>
                                    <div className="flex gap-2 mt-2">
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          setSponsorDialog({
                                            open: true,
                                            person: { ...field, index },
                                          })
                                        }
                                      >
                                        <Pencil className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => removeSponsor(index)}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            ))}
                            {sponsorFields.length === 0 && (
                              <div className="col-span-full text-center py-8 text-gray-500">
                                {t("eventForm.labels.noSponsors") ||
                                  "No sponsors added yet"}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}{" "}
                  </div>
                  {/* Navigation Buttons */}
                  <div className="flex-none flex justify-between pt-6 mt-3 border-t border-gray-300">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(-1)}
                      >
                        {t("eventForm.buttons.cancel")}
                      </Button>
                      {currentSection > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrevious}
                        >
                          <ChevronLeft className="w-4 h-4 mr-2" />
                          {t("eventForm.buttons.previous")}
                        </Button>
                      )}
                    </div>

                    <div>
                      {currentSection === sections.length - 1 ? (
                        <Button
                          type="button"
                          disabled={isLoading}
                          onClick={form.handleSubmit(handleSubmit)} // Explicitly trigger RHF submit
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {t("eventForm.buttons.creating")}
                            </>
                          ) : (
                            t("eventForm.buttons.createEvent")
                          )}
                        </Button>
                      ) : (
                        <Button type="button" onClick={handleNext}>
                          {t("eventForm.buttons.next")}
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Preview Section */}
        {showPreview && (
          <div className="w-full lg:w-1/3 lg:sticky lg:top-6 h-fit order-first lg:order-last">
            <Card className="border-slate-300 p-0 overflow-hidden">
              <CardContent className="overflow-x-auto p-0">
                <EventPreview formData={formData} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Speaker Dialog */}
      <PersonDialog
        open={speakerDialog.open}
        onOpenChange={(open) => setSpeakerDialog({ open, person: null })}
        person={speakerDialog.person}
        onSave={(person) => {
          if (person.index !== undefined) {
            // Edit existing
            const current = form.getValues("speakers");
            current[person.index] = {
              _id: person._id,
              fullName: person.fullName,
              picture: person.picture,
              socialNetworks: person.socialNetworks,
            };
            form.setValue("speakers", current);
          } else {
            // Add new
            appendSpeaker({
              fullName: person.fullName,
              picture: person.picture,
              socialNetworks: person.socialNetworks,
            } as any);
          }
        }}
        type="speaker"
      />

      {/* Exhibitor Dialog */}
      <PersonDialog
        open={exhibitorDialog.open}
        onOpenChange={(open) => setExhibitorDialog({ open, person: null })}
        person={exhibitorDialog.person}
        onSave={(person) => {
          if (person.index !== undefined) {
            // Edit existing
            const current = form.getValues("exhibitors");
            current[person.index] = {
              _id: person._id,
              fullName: person.fullName,
              picture: person.picture,
              socialNetworks: person.socialNetworks,
            };
            form.setValue("exhibitors", current);
          } else {
            // Add new
            appendExhibitor({
              fullName: person.fullName,
              picture: person.picture,
              socialNetworks: person.socialNetworks,
            } as any);
          }
        }}
        type="exhibitor"
      />

      {/* Sponsor Dialog */}
      <PersonDialog
        open={sponsorDialog.open}
        onOpenChange={(open) => setSponsorDialog({ open, person: null })}
        person={sponsorDialog.person}
        onSave={(person) => {
          if (person.index !== undefined) {
            // Edit existing
            const current = form.getValues("sponsors");
            current[person.index] = {
              _id: person._id,
              name: person.name,
              logo: person.logo,
              socialNetworks: person.socialNetworks,
            };
            form.setValue("sponsors", current);
          } else {
            // Add new
            appendSponsor({
              name: person.name,
              logo: person.logo,
              socialNetworks: person.socialNetworks,
            } as any);
          }
        }}
        type="sponsor"
      />
    </div>
  );
};

export default EventAddForm;
