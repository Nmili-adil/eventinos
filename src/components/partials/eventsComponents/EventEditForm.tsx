import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { eventFormSchema, type EventFormData } from "@/schema/eventSchema";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import type { date } from "zod";

interface EventEditFormProps {
  event: any;
  onSubmit: (data: EventFormData) => void;
  isLoading?: boolean;
}

const EventEditForm = ({ event, onSubmit, isLoading = false }: EventEditFormProps) => {
  const [activeTab, setActiveTab] = useState("basic");

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: event.name || "",
      description: event.description || "",
      image: event.image || "",
      visibility: event.visibility || "PUBLIC",
      type: event.type || "FACETOFACE",
      status: event.status || "DRAFT",
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
        linkedin: "",
        twitter: "",
        website: "",
      },
      speakers: event.speakers || [],
      exhibitors: event.exhibitors || [],
      sponsors: event.sponsors || [],
      gallery: event.gallery || [],
      program: event.program || "",
      tags: event.tags || [],
      requirements: event.requirements || [],
    },
  });

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
                <TabsList className="grid w-full grid-cols-5 mb-8">
                  <TabsTrigger value="basic" className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>Basic</span>
                  </TabsTrigger>
                  <TabsTrigger value="datetime" className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Date & Time</span>
                  </TabsTrigger>
                  <TabsTrigger value="location" className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    <span>Location</span>
                  </TabsTrigger>
                  <TabsTrigger value="social" className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    <span>Social</span>
                  </TabsTrigger>
                  <TabsTrigger value="program" className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span>Program</span>
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                <SelectItem value="ONLINE">Online</SelectItem>
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
                                <SelectItem value="DRAFT">Draft</SelectItem>
                                <SelectItem value="PUBLISHED">Published</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
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
                          <FormLabel>Event Image URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/image.jpg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter city" {...field} />
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
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter country" {...field} />
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
                        name="socialNetworks.linkedin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>LinkedIn</FormLabel>
                            <FormControl>
                              <Input placeholder="https://linkedin.com/event" {...field} />
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
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("basic")}
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