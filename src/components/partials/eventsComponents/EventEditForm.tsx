import { useState, useEffect } from "react";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { eventFormSchema, type EventFormData } from "@/schema/eventSchema";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import type { date } from "zod";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store/app/store";
import type { RootState } from "@/store/app/rootReducer";
import { fetchCategoriesRequest } from "@/store/features/categories/categories.actions";
import { fetchBadgesRequest } from "@/store/features/badges/badges.actions";
import { FileUpload } from "./FileUpload";
import { useTranslation } from "react-i18next";
import { EventPreview } from "./EventPreview";
import { LocationSelector, type LocationValue } from "@/components/shared/location-selector";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { Skeleton } from "@/components/ui/skeleton";

interface EventEditFormProps {
  event?: any | null;
  onSubmit: (data: EventFormData) => void;
  isLoading?: boolean;
  isFetching?: boolean;
}

const EventEditForm = ({ event, onSubmit, isLoading = false, isFetching = false }: EventEditFormProps) => {
  if (isFetching || !event) {
    return <EventEditFormSkeleton />
  }

  const [activeTab, setActiveTab] = useState("basic");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [showPreview, setShowPreview] = useState(true); 
  const { t } = useTranslation();
  
  const dispatch = useDispatch<AppDispatch>()
  const { categories } = useSelector((state: RootState) => state.categories)
  const { badges } = useSelector((state: RootState) => state.badges)

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      createdBy: event.createdBy || "",
      name: event.name || "",
      description: event.description || "",
      image: event.image || "",
      visibility: event.visibility || "PUBLIC",
      type: event.type || "FACETOFACE",
      isNearestEvent: event.isNearestEvent || false,
      isUpCommingEvent: event.isUpCommingEvent || false,
      status: event.status || "PENDING",
      categories: event.categories || "",
      capacity: event.capacity || 0,
      allowRegistration: event.allowRegistration || false,
      registrationDeadline: event.registrationDeadline || { date: "", time: "" },
      startDate: event.startDate || { date: "", time: "" },
      endDate: event.endDate || { date: "", time: "" },
      location: event.location || {
        location: { lat: 0, lng: 0 },
        name: "",
        place_id: "",
        city: "",
        country: "",
        countryCode: "",
      },
      socialNetworks: event.socialNetworks || {
        facebook: "",
        instagram: "",
        linkedin: "",
        twitter: "",
        website: "",
      },
      speakers: event.speakers || [],
      exhibitors: event.exhibitors || [],
      sponsors: event.sponsors || [],
      gallery: event.gallery || [],
      badges: event.badges || [],
      program: event.program || "",
      tags: event.tags || [],
      requirements: event.requirements || [],
    },
  });
  
  const navigate = useNavigate();
  
  // Field arrays for dynamic fields
  const { fields: exhibitorFields, append: appendExhibitor, remove: removeExhibitor } = useFieldArray({
    control: form.control,
    name: "exhibitors",
  });

  const { fields: sponsorFields, append: appendSponsor, remove: removeSponsor } = useFieldArray({
    control: form.control,
    name: "sponsors",
  });
  
  useEffect(() => {
    dispatch(fetchCategoriesRequest())
    dispatch(fetchBadgesRequest())
  }, [dispatch])

  const handleSubmit = (data: EventFormData) => {
    onSubmit(data);
  };

  const formData = form.watch();

  const handleLocationChange = (updated: LocationValue) => {
    const current = form.getValues('location')
    form.setValue(
      'location',
      {
        ...current,
        name: updated.name ?? current.name,
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
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-6">
      <div className={`flex-1 transition-all ${showPreview ? 'lg:w-2/3' : 'lg:w-full'}`}>
      <Card className="border-slate-300">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-start gap-4">

            <Button variant={"outline"} size={'icon'} onClick={() => navigate(-1)}>
              <ArrowLeft />
            </Button>
          <div>
          <CardTitle className="text-2xl font-bold">
            {t('events.editEvent')}
          </CardTitle>
          <p className="text-muted-foreground">
            {t('eventForm.description')}
          </p>
          </div>
          </div><Button
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
                      {t('eventForm.preview.hide')}
                    </span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">
                      {t('eventForm.preview.show')}
                    </span>
                  </>
                )}
              </Button>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-8 mb-8 overflow-x-auto">
                  <TabsTrigger value="basic" className="flex items-center space-x-2 text-xs">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="truncate">{t('eventForm.sections.basicInfo')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="datetime" className="flex items-center space-x-2 text-xs">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="truncate">{t('eventForm.sections.dateTime')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="location" className="flex items-center space-x-2 text-xs">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    <span className="truncate">{t('eventForm.sections.location')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="social" className="flex items-center space-x-2 text-xs">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    <span className="truncate">{t('eventForm.sections.socialNetworks')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="program" className="flex items-center space-x-2 text-xs">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="truncate">{t('eventForm.sections.program')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="badges" className="flex items-center space-x-2 text-xs">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span className="truncate">{t('eventForm.sections.badges')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="gallery" className="flex items-center space-x-2 text-xs">
                    <div className="w-2 h-2 bg-pink-500 rounded-full" />
                    <span className="truncate">{t('eventForm.sections.gallery')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="exhibitors" className="flex items-center space-x-2 text-xs">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                    <span className="truncate">{t('eventForm.sections.exhibitorsSponsors')}</span>
                  </TabsTrigger>
                </TabsList>

                {/* Basic Information Tab */}
                <TabsContent value="basic" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      {t('eventForm.sections.basicInfo')}
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('eventForm.fields.name')}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={t('eventForm.placeholders.enterEventName')} 
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
                          <FormLabel>{t('eventForm.fields.description')}</FormLabel>
                          <FormControl>
                            <RichTextEditor
                              value={field.value || ""}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              placeholder={t('eventForm.placeholders.enterDescription')}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name="visibility"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('eventForm.fields.visibility')}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t('eventForm.placeholders.selectVisibility')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="PUBLIC">
                                  {t('eventForm.options.visibility.public')}
                                </SelectItem>
                                <SelectItem value="PRIVATE">
                                  {t('eventForm.options.visibility.private')}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="categories"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('eventForm.fields.categories')}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t('eventForm.placeholders.selectCategory')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories && categories.map((category: any) => (
                                  <SelectItem key={category._id} value={category._id}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('eventForm.fields.type')}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t('eventForm.placeholders.selectType')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="FACETOFACE">
                                  {t('eventForm.options.type.faceToFace')}
                                </SelectItem>
                                <SelectItem value="VIRTUEL">
                                  {t('eventForm.options.type.virtual')}
                                </SelectItem>
                                <SelectItem value="HYBRID">
                                  {t('events.hybrid')}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('eventForm.fields.status')}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t('eventForm.placeholders.selectStatus')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="PENDING">
                                  {t('eventForm.options.status.pending')}
                                </SelectItem>
                                <SelectItem value="ACCEPTED">
                                  {t('eventForm.options.status.accepted')}
                                </SelectItem>
                                <SelectItem value="REFUSED">
                                  {t('eventForm.options.status.refused')}
                                </SelectItem>
                                <SelectItem value="CLOSED">
                                  {t('eventForm.options.status.closed')}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('eventForm.fields.image')}</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <FileUpload
                                onUploadComplete={(url) => field.onChange(url)}
                                currentUrl={field.value}
                                label={t('eventForm.buttons.uploadImage')}
                                accept="image/*"
                                disabled={isLoading}
                              />
                              <div className="text-xs text-muted-foreground">
                                {t('eventForm.placeholders.enterImageUrlManual')}
                              </div>
                              <Input 
                                placeholder={t('eventForm.placeholders.enterImageUrl')} 
                                {...field}
                                value={field.value || ''}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="capacity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('eventForm.fields.capacity')}</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder={t('eventForm.placeholders.enterCapacity')} 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                value={field.value || 0}
                              />
                            </FormControl>
                            <FormDescription>
                              {t('eventForm.descriptions.capacity')}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="allowRegistration"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                {t('eventForm.fields.allowRegistration')}
                              </FormLabel>
                              <FormDescription>
                                {t('eventForm.descriptions.allowRegistration')}
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    {form.watch('allowRegistration') && (
                      <FormField
                        control={form.control}
                        name="registrationDeadline.date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('eventForm.fields.registrationDeadline')}</FormLabel>
                            <FormControl>
                              <Input
                                type="datetime-local"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormDescription>
                              {t('eventForm.descriptions.registrationDeadline')}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-sm">
                        {t('eventForm.labels.eventHighlights')}
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
                                  {t('eventForm.labels.markAsNearestEvent')}
                                </FormLabel>
                                <FormDescription>
                                  {t('eventForm.descriptions.isNearestEvent')}
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="isUpCommingEvent"
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
                                  {t('eventForm.labels.markAsUpcomingEvent')}
                                </FormLabel>
                                <FormDescription>
                                  {t('eventForm.descriptions.isUpcomingEvent')}
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("datetime")}
                      className="place-self-end"
                    >
                      {t('eventForm.buttons.next')}: {t('eventForm.sections.dateTime')}
                    </Button>
                  </div>
                </TabsContent>

                {/* Date & Time Tab */}
                <TabsContent value="datetime" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      {t('eventForm.sections.dateTime')}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <Label className="text-base font-medium">
                          {t('eventForm.fields.startDate')}
                        </Label>
                        <div className="space-y-2">
                          <Label htmlFor="startDate">
                            {t('eventForm.fields.startDate')}
                          </Label>
                          <Controller 
                            control={form.control}
                            name="startDate.date"
                            render={({ field }) => (
                              <DateTimePicker
                              date={field.value as date}
                              onDateChange={field.onChange}
                              placeholder={t('eventForm.placeholders.enterEventName')}
                              className="w-full"
                              fromDate={new Date()}
                              />
                            )}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-base font-medium">
                          {t('eventForm.fields.endDate')}
                        </Label>
                        <div className="space-y-2">
                          <Label htmlFor="endDate">
                            {t('eventForm.fields.endDate')}
                          </Label>
                          <Controller 
                            control={form.control}
                            name="endDate.date"
                            render={({ field }) => (
                              <DateTimePicker
                              date={field.value as date}
                              onDateChange={field.onChange}
                              placeholder={t('eventForm.placeholders.enterEventName')}
                              className="w-full"
                              fromDate={new Date()}
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("basic")}
                    >
                      {t('eventForm.buttons.previous')}: {t('eventForm.sections.basicInfo')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("location")}
                    >
                      {t('eventForm.buttons.next')}: {t('eventForm.sections.location')}
                    </Button>
                  </div>
                </TabsContent>

                {/* Location Tab */}
                <TabsContent value="location" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      {t('eventForm.sections.location')}
                    </h3>
                    <LocationSelector
                      value={{
                        name: form.watch('location.name'),
                        city: form.watch('location.city'),
                        country: form.watch('location.country'),
                        countryCode: form.watch('location.countryCode'),
                        place_id: form.watch('location.place_id'),
                        location: form.watch('location.location'),
                      }}
                      onChange={handleLocationChange}
                      defaultMode={form.watch('location.place_id') ? 'map' : 'manual'}
                    />
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("datetime")}
                    >
                      {t('eventForm.buttons.previous')}: {t('eventForm.sections.dateTime')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("social")}
                    >
                      {t('eventForm.buttons.next')}: {t('eventForm.sections.socialNetworks')}
                    </Button>
                  </div>
                </TabsContent>

                {/* Social Networks Tab */}
                <TabsContent value="social" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      {t('eventForm.sections.socialNetworks')}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="socialNetworks.website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('eventForm.fields.website')}</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={t('eventForm.placeholders.enterWebsite')} 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="socialNetworks.facebook"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('eventForm.fields.facebook')}</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={t('eventForm.placeholders.enterFacebook')} 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="socialNetworks.twitter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('eventForm.fields.twitter')}</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={t('eventForm.placeholders.enterTwitter')} 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="socialNetworks.instagram"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('eventForm.fields.instagram')}</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={t('eventForm.placeholders.enterInstagram')} 
                                {...field} 
                                value={field.value || ''} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="socialNetworks.linkedin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('eventForm.fields.linkedin')}</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={t('eventForm.placeholders.enterLinkedIn')} 
                                {...field} 
                                value={field.value || ''} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("location")}
                    >
                      {t('eventForm.buttons.previous')}: {t('eventForm.sections.location')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("program")}
                    >
                      {t('eventForm.buttons.next')}: {t('eventForm.sections.program')}
                    </Button>
                  </div>
                </TabsContent>

                {/* Program Tab */}
                <TabsContent value="program" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      {t('eventForm.sections.program')}
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="program"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('eventForm.fields.program')}</FormLabel>
                          <FormControl>
                            <RichTextEditor
                              value={field.value || ""}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              placeholder={t('eventForm.placeholders.enterProgram')}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("social")}
                    >
                      {t('eventForm.buttons.previous')}: {t('eventForm.sections.socialNetworks')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("badges")}
                    >
                      {t('eventForm.buttons.next')}: {t('eventForm.sections.badges')}
                    </Button>
                  </div>
                </TabsContent>

                {/* Badges Tab */}
                <TabsContent value="badges" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      {t('eventForm.sections.badges')}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t('eventForm.descriptions.badges')}
                    </p>
                    
                    <FormField
                      control={form.control}
                      name="badges"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('eventForm.labels.availableBadges')}</FormLabel>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                            {badges && badges.length > 0 ? (
                              badges.map((badge: any) => (
                                <div
                                  key={badge._id}
                                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                    field.value?.includes(badge._id)
                                      ? 'border-blue-500 bg-blue-50'
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const currentBadges = field.value || [];
                                    if (currentBadges.includes(badge._id)) {
                                      field.onChange(currentBadges.filter((id: string) => id !== badge._id));
                                    } else {
                                      field.onChange([...currentBadges, badge._id]);
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
                                          <span className="text-2xl">🏆</span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-medium text-sm truncate">{badge.name}</h4>
                                      {badge.description && (
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                          {badge.description}
                                        </p>
                                      )}
                                      {field.value?.includes(badge._id) && (
                                        <div className="mt-2 text-xs text-blue-600 font-medium">
                                          ✓ {t('eventForm.labels.selected')}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="col-span-full text-center py-8 text-gray-500">
                                {t('eventForm.labels.noBadges')}
                              </div>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch('badges')?.length > 0 && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-900">
                          {t('eventForm.labels.selectedBadges')}: {form.watch('badges').length}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("program")}
                    >
                      {t('eventForm.buttons.previous')}: {t('eventForm.sections.program')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("gallery")}
                    >
                      {t('eventForm.buttons.next')}: {t('eventForm.sections.gallery')}
                    </Button>
                  </div>
                </TabsContent>

                {/* Gallery Tab */}
                <TabsContent value="gallery" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      {t('eventForm.sections.gallery')}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t('eventForm.descriptions.gallery')}
                    </p>
                    
                    <FormField
                      control={form.control}
                      name="gallery"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('eventForm.fields.galleryImages')}</FormLabel>
                          <div className="space-y-4">
                            {/* File Upload Option */}
                            <FileUpload
                              onUploadComplete={(url) => {
                                if (url) {
                                  const currentGallery = field.value || [];
                                  field.onChange([...currentGallery, url]);
                                }
                              }}
                              label={t('eventForm.buttons.uploadGalleryImage')}
                              accept="image/*"
                              disabled={isLoading}
                            />
                            
                            {/* Add new image input */}
                            <div className="flex gap-2">
                              <Input
                                type="url"
                                placeholder={t('eventForm.placeholders.enterImageUrlGallery')}
                                value={newImageUrl}
                                onChange={(e) => setNewImageUrl(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (newImageUrl.trim()) {
                                      const currentGallery = field.value || [];
                                      field.onChange([...currentGallery, newImageUrl.trim()]);
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
                                    const currentGallery = field.value || [];
                                    field.onChange([...currentGallery, newImageUrl.trim()]);
                                    setNewImageUrl("");
                                  }
                                }}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                {t('eventForm.buttons.addUrl')}
                              </Button>
                            </div>

                            {/* Gallery preview grid */}
                            {field.value && field.value.length > 0 ? (
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {field.value.map((imageUrl: string, index: number) => (
                                  <div
                                    key={index}
                                    className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square"
                                  >
                                    <img
                                      src={imageUrl}
                                      alt={t('eventForm.labels.imageNumber', { number: index + 1 })}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                                      }}
                                    />
                                    {/* Delete button overlay */}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          const currentGallery = field.value || [];
                                          field.onChange(currentGallery.filter((_: string, i: number) => i !== index));
                                        }}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                    {/* Image number badge */}
                                    <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                                      {index + 1}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                                <p className="text-gray-500">{t('eventForm.labels.noImages')}</p>
                                <p className="text-sm text-gray-400 mt-1">
                                  {t('eventForm.labels.noImagesDescription')}
                                </p>
                              </div>
                            )}

                            {field.value && field.value.length > 0 && (
                              <div className="text-sm text-gray-600">
                                {t('eventForm.labels.totalImages')}: <span className="font-medium">{field.value.length}</span>
                              </div>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("badges")}
                    >
                      {t('eventForm.buttons.previous')}: {t('eventForm.sections.badges')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("exhibitors")}
                    >
                      {t('eventForm.buttons.next')}: {t('eventForm.sections.exhibitorsSponsors')}
                    </Button>
                  </div>
                </TabsContent>

                {/* Exhibitors & Sponsors Tab */}
                <TabsContent value="exhibitors" className="space-y-6">
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">
                      {t('eventForm.sections.exhibitorsSponsors')}
                    </h3>
                    
                    {/* Exhibitors Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-md font-medium">
                          {t('eventForm.fields.exhibitors')}
                        </h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => appendExhibitor({
                            fullName: "",
                            picture: "",
                            socialNetworks: {
                              facebook: "",
                              instagram: "",
                              linkedin: "",
                              twitter: "",
                              website: "",
                            },
                          })}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          {t('eventForm.buttons.addExhibitor')}
                        </Button>
                      </div>

                      {exhibitorFields.map((field, index) => (
                        <Card key={field.id} className="p-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium">
                                {t('eventForm.fields.exhibitors')} {index + 1}
                              </h5>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeExhibitor(index)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>

                            <FormField
                              control={form.control}
                              name={`exhibitors.${index}.fullName`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('eventForm.fields.fullName')} *</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder={t('eventForm.placeholders.enterExhibitorName')} 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`exhibitors.${index}.picture`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('eventForm.fields.picture')}</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder={t('eventForm.placeholders.enterExhibitorPicture')} 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="space-y-2">
                              <Label className="text-sm font-medium">
                                {t('eventForm.descriptions.socialNetworks')}
                              </Label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormField
                                  control={form.control}
                                  name={`exhibitors.${index}.socialNetworks.facebook`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input 
                                          placeholder={t('eventForm.placeholders.enterFacebook')} 
                                          {...field} 
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`exhibitors.${index}.socialNetworks.instagram`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input 
                                          placeholder={t('eventForm.placeholders.enterInstagram')} 
                                          {...field} 
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`exhibitors.${index}.socialNetworks.linkedin`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input 
                                          placeholder={t('eventForm.placeholders.enterLinkedIn')} 
                                          {...field} 
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`exhibitors.${index}.socialNetworks.twitter`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input 
                                          placeholder={t('eventForm.placeholders.enterTwitter')} 
                                          {...field} 
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`exhibitors.${index}.socialNetworks.website`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input 
                                          placeholder={t('eventForm.placeholders.enterWebsite')} 
                                          {...field} 
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>

                    {/* Sponsors Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-md font-medium">
                          {t('eventForm.fields.sponsors')}
                        </h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => appendSponsor({
                            name: "",
                            logo: "",
                            socialNetworks: {
                              facebook: "",
                              instagram: "",
                              linkedin: "",
                              twitter: "",
                              website: "",
                            },
                          })}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          {t('eventForm.buttons.addSponsor')}
                        </Button>
                      </div>

                      {sponsorFields.map((field, index) => (
                        <Card key={field.id} className="p-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium">
                                {t('eventForm.fields.sponsors')} {index + 1}
                              </h5>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSponsor(index)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>

                            <FormField
                              control={form.control}
                              name={`sponsors.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('eventForm.fields.sponsorName')} *</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder={t('eventForm.placeholders.enterSponsorName')} 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`sponsors.${index}.logo`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('eventForm.fields.logo')}</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder={t('eventForm.placeholders.enterSponsorLogo')} 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="space-y-2">
                              <Label className="text-sm font-medium">
                                {t('eventForm.descriptions.socialNetworks')}
                              </Label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormField
                                  control={form.control}
                                  name={`sponsors.${index}.socialNetworks.facebook`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input 
                                          placeholder={t('eventForm.placeholders.enterFacebook')} 
                                          {...field} 
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`sponsors.${index}.socialNetworks.instagram`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input 
                                          placeholder={t('eventForm.placeholders.enterInstagram')} 
                                          {...field} 
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`sponsors.${index}.socialNetworks.linkedin`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input 
                                          placeholder={t('eventForm.placeholders.enterLinkedIn')} 
                                          {...field} 
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`sponsors.${index}.socialNetworks.twitter`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input 
                                          placeholder={t('eventForm.placeholders.enterTwitter')} 
                                          {...field} 
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`sponsors.${index}.socialNetworks.website`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input 
                                          placeholder={t('eventForm.placeholders.enterWebsite')} 
                                          {...field} 
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("gallery")}
                    >
                      {t('eventForm.buttons.previous')}: {t('eventForm.sections.gallery')}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  {t('eventForm.buttons.cancel')}
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : t('events.editEvent')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      </div>

           {/* Preview Section */}
           {showPreview && (
          <div className="w-full lg:w-1/3 lg:sticky lg:top-6 h-fit order-first lg:order-last">
            <Card className="border-slate-300">
              <CardHeader className="m-0">
                <CardTitle className="text-lg font-semibold">
                  {t('eventForm.preview.title')}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {t('eventForm.preview.description')}
                </p>
              </CardHeader>
              <CardContent className="overflow-x-auto p-0bg-red-400">
                <EventPreview formData={formData} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventEditForm;

const EventEditFormSkeleton = () => (
  <div className="container mx-auto p-4 md:p-6 max-w-7xl">
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 space-y-6">
        <Card className="border-slate-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-start gap-4 w-full">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <Skeleton className="h-8 w-24" />
          </CardHeader>
          <CardContent className="space-y-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-300 p-6">
          <div className="space-y-3">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </Card>
      </div>
      <div className="w-full lg:w-1/3 space-y-4">
        <Card className="border-slate-300">
          <CardHeader className="m-0 space-y-2">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
)