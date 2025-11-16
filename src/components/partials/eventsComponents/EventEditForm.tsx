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
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store/app/store";
import type { RootState } from "@/store/app/rootReducer";
import { fetchCategoriesRequest } from "@/store/features/categories/categories.actions";
import { fetchBadgesRequest } from "@/store/features/badges/badges.actions";
import { FileUpload } from "./FileUpload";

interface EventEditFormProps {
  event: any;
  onSubmit: (data: EventFormData) => void;
  isLoading?: boolean;
}

const EventEditForm = ({ event, onSubmit, isLoading = false }: EventEditFormProps) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [newImageUrl, setNewImageUrl] = useState("");
  
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

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="border-slate-300">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Edit Event</CardTitle>
          <p className="text-muted-foreground">
            Update your event details in the sections below
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-8 mb-8 overflow-x-auto">
                  <TabsTrigger value="basic" className="flex items-center space-x-2 text-xs">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>Basic</span>
                  </TabsTrigger>
                  <TabsTrigger value="datetime" className="flex items-center space-x-2 text-xs">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Date & Time</span>
                  </TabsTrigger>
                  <TabsTrigger value="location" className="flex items-center space-x-2 text-xs">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    <span>Location</span>
                  </TabsTrigger>
                  <TabsTrigger value="social" className="flex items-center space-x-2 text-xs">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    <span>Social</span>
                  </TabsTrigger>
                  <TabsTrigger value="program" className="flex items-center space-x-2 text-xs">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span>Program</span>
                  </TabsTrigger>
                  <TabsTrigger value="badges" className="flex items-center space-x-2 text-xs">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span>Badges</span>
                  </TabsTrigger>
                  <TabsTrigger value="gallery" className="flex items-center space-x-2 text-xs">
                    <div className="w-2 h-2 bg-pink-500 rounded-full" />
                    <span>Gallery</span>
                  </TabsTrigger>
                  <TabsTrigger value="exhibitors" className="flex items-center space-x-2 text-xs">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                    <span>Exhibitors</span>
                  </TabsTrigger>
                </TabsList>

                {/* Basic Information Tab */}
                <TabsContent value="basic" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                    
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter event name" {...field} />
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
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter event description"
                              className="min-h-[100px]"
                              {...field}
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
                            <FormLabel>Visibility</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select visibility" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="PUBLIC">Public</SelectItem>
                                <SelectItem value="PRIVATE">Private</SelectItem>
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
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
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
                            <FormLabel>Event Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="FACETOFACE">Face to Face</SelectItem>
                                <SelectItem value="VIRTUEL">Virtual</SelectItem>
                                <SelectItem value="HYBRID">Hybrid</SelectItem>
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
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="ACCEPTED">Accepted</SelectItem>
                                <SelectItem value="REFUSED">Refused</SelectItem>
                                <SelectItem value="CLOSED">Closed</SelectItem>
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
                          <FormLabel>Event Image</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <FileUpload
                                onUploadComplete={(url) => field.onChange(url)}
                                currentUrl={field.value}
                                label="Upload Event Image"
                                accept="image/*"
                                disabled={isLoading}
                              />
                              <div className="text-xs text-muted-foreground">
                                Or enter image URL manually:
                              </div>
                              <Input 
                                placeholder="https://example.com/image.jpg" 
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
                            <FormLabel>Event Capacity</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Maximum number of participants" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                value={field.value || 0}
                              />
                            </FormControl>
                            <FormDescription>
                              Set to 0 for unlimited capacity
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
                                Allow Registration
                              </FormLabel>
                              <FormDescription>
                                Enable participant registration for this event
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
                            <FormLabel>Registration Deadline</FormLabel>
                            <FormControl>
                              <Input
                                type="datetime-local"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormDescription>
                              Last date and time for participants to register
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-sm">Event Highlights</h4>
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
                                  Mark as Nearest Event
                                </FormLabel>
                                <FormDescription>
                                  Show this event in nearest events section
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
                                  Mark as Upcoming Event
                                </FormLabel>
                                <FormDescription>
                                  Feature this event in upcoming events section
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 ">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("datetime")}
                      className="place-self-end"
                    >
                      Next: Date & Time
                    </Button>
                  </div>
                </TabsContent>

                {/* Date & Time Tab */}
                <TabsContent value="datetime" className="space-y-6  ">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Date & Time</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <Label className="text-base font-medium">Start Date & Time</Label>
                        <div className="space-y-2">
                          <Label htmlFor="startDate">Start Date</Label>
                          <Controller 
                            control={form.control}
                            name="startDate.date"
                            render={({ field }) => (
                              <DateTimePicker
                              date={field.value as date}
                              onDateChange={field.onChange}
                              placeholder="Select start date & time"
                              className="w-full"
                              fromDate={new Date()}
                              />
                            )}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-base font-medium">End Date & Time</Label>
                        <div className="space-y-2">
                          <Label htmlFor="endDate">End Date</Label>
                          <Controller 
                            control={form.control}
                            name="endDate.date"
                            render={({ field }) => (
                              <DateTimePicker
                              date={field.value as date}
                              onDateChange={field.onChange}
                              placeholder="Select end date & time"
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
                      Previous: Basic
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("location")}
                    >
                      Next: Location
                    </Button>
                  </div>
                </TabsContent>

                {/* Location Tab */}
                <TabsContent value="location" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Location Information</h3>
                    
                    <FormField
                      control={form.control}
                      name="location.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Venue Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter venue name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="location.city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter city" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="location.country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter country" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="location.countryCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country Code *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., US, GB, FR" 
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
                        name="location.place_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Place ID *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Google Places ID" 
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
                      onClick={() => setActiveTab("datetime")}
                    >
                      Previous: Date & Time
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("social")}
                    >
                      Next: Social Networks
                    </Button>
                  </div>
                </TabsContent>

                {/* Social Networks Tab */}
                <TabsContent value="social" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Social Networks</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="socialNetworks.website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com" {...field} />
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
                            <FormLabel>Facebook</FormLabel>
                            <FormControl>
                              <Input placeholder="https://facebook.com/event" {...field} />
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
                            <FormLabel>Twitter</FormLabel>
                            <FormControl>
                              <Input placeholder="https://twitter.com/event" {...field} />
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
                            <FormLabel>Instagram</FormLabel>
                            <FormControl>
                              <Input placeholder="https://instagram.com/event" {...field} value={field.value || ''} />
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
                            <FormLabel>LinkedIn</FormLabel>
                            <FormControl>
                              <Input placeholder="https://linkedin.com/event" {...field} value={field.value || ''} />
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
                      Previous: Location
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("program")}
                    >
                      Next: Program
                    </Button>
                  </div>
                </TabsContent>

                {/* Program Tab */}
                <TabsContent value="program" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Event Program</h3>
                    
                    <FormField
                      control={form.control}
                      name="program"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Program</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter detailed program schedule"
                              className="min-h-[150px]"
                              {...field}
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
                      Previous: Social
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("badges")}
                    >
                      Next: Badges
                    </Button>
                  </div>
                </TabsContent>

                {/* Badges Tab */}
                <TabsContent value="badges" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Badges</h3>
                    <p className="text-sm text-gray-600">Select badges that participants can earn at this event</p>
                    
                    <FormField
                      control={form.control}
                      name="badges"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Available Badges</FormLabel>
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
                                          ✓ Selected
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="col-span-full text-center py-8 text-gray-500">
                                No badges available. Please create badges first.
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
                          Selected Badges: {form.watch('badges').length}
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
                      Previous: Program
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("gallery")}
                    >
                      Next: Gallery
                    </Button>
                  </div>
                </TabsContent>

                {/* Gallery Tab */}
                <TabsContent value="gallery" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Event Gallery</h3>
                    <p className="text-sm text-gray-600">Add images to showcase your event</p>
                    
                    <FormField
                      control={form.control}
                      name="gallery"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gallery Images</FormLabel>
                          <div className="space-y-4">
                            {/* File Upload Option */}
                            <FileUpload
                              onUploadComplete={(url) => {
                                if (url) {
                                  const currentGallery = field.value || [];
                                  field.onChange([...currentGallery, url]);
                                }
                              }}
                              label="Upload Gallery Image"
                              accept="image/*"
                              disabled={isLoading}
                            />
                            
                            {/* Add new image input */}
                            <div className="flex gap-2">
                              <Input
                                type="url"
                                placeholder="Or enter image URL (https://...)"
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
                                Add URL
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
                                      alt={`Gallery image ${index + 1}`}
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
                                <p className="text-gray-500">No images added yet</p>
                                <p className="text-sm text-gray-400 mt-1">Add image URLs to create your event gallery</p>
                              </div>
                            )}

                            {field.value && field.value.length > 0 && (
                              <div className="text-sm text-gray-600">
                                Total images: <span className="font-medium">{field.value.length}</span>
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
                      Previous: Badges
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("exhibitors")}
                    >
                      Next: Exhibitors & Sponsors
                    </Button>
                  </div>
                </TabsContent>

                {/* Exhibitors & Sponsors Tab */}
                <TabsContent value="exhibitors" className="space-y-6">
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Exhibitors & Sponsors</h3>
                    
                    {/* Exhibitors Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-md font-medium">Exhibitors</h4>
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
                          Add Exhibitor
                        </Button>
                      </div>

                      {exhibitorFields.map((field, index) => (
                        <Card key={field.id} className="p-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium">Exhibitor {index + 1}</h5>
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
                                  <FormLabel>Full Name *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter exhibitor name" {...field} />
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
                                  <FormLabel>Picture URL</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://example.com/image.jpg" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Social Networks</Label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormField
                                  control={form.control}
                                  name={`exhibitors.${index}.socialNetworks.facebook`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input placeholder="Facebook URL" {...field} />
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
                                        <Input placeholder="Instagram URL" {...field} />
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
                                        <Input placeholder="LinkedIn URL" {...field} />
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
                                        <Input placeholder="Twitter URL" {...field} />
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
                                        <Input placeholder="Website URL" {...field} />
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
                        <h4 className="text-md font-medium">Sponsors</h4>
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
                          Add Sponsor
                        </Button>
                      </div>

                      {sponsorFields.map((field, index) => (
                        <Card key={field.id} className="p-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium">Sponsor {index + 1}</h5>
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
                                  <FormLabel>Sponsor Name *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter sponsor name" {...field} />
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
                                  <FormLabel>Logo URL</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://example.com/logo.jpg" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Social Networks</Label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormField
                                  control={form.control}
                                  name={`sponsors.${index}.socialNetworks.facebook`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input placeholder="Facebook URL" {...field} />
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
                                        <Input placeholder="Instagram URL" {...field} />
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
                                        <Input placeholder="LinkedIn URL" {...field} />
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
                                        <Input placeholder="Twitter URL" {...field} />
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
                                        <Input placeholder="Website URL" {...field} />
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
                      Previous: Gallery
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
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Event"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventEditForm;