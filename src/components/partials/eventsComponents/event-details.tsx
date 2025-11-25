import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Globe,
  Share2,
  Bookmark,
  ArrowLeft,
  Facebook,
  Twitter,
  Linkedin,
  ExternalLink,
  Trash,
  Edit,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import GoogleMap from "@/components/shared/googleMap";
import { EVENT_EDIT_PAGE } from "@/constants/routerConstants";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EventDetailsProps {
  event: any;
}

const EventDetails = ({ event }: EventDetailsProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("details");
  // const [isBookmarked, setIsBookmarked] = useState(false);

  const [open, setOpen] = useState<boolean>(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    eventId: string | null;
    eventTitle?: string;
  }>({
    open: false,
    eventId: null,
    eventTitle: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  
  // New states for modals
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedSpeaker, setSelectedSpeaker] = useState<any | null>(null);

  // Safe data extraction functions
  const getOrganizerName = () => {
    if (!event.createdBy) return "Event Organizer";

    if (typeof event.createdBy === "string") {
      return event.createdBy;
    }

    if (typeof event.createdBy === "object") {
      if (event.createdBy.firstName && event.createdBy.lastName) {
        return `${event.createdBy.firstName} ${event.createdBy.lastName}`;
      }
      if (event.createdBy.fullName) {
        return event.createdBy.fullName;
      }
      if (event.createdBy.name) {
        return event.createdBy.name;
      }
    }

    return "Event Organizer";
  };

  const getOrganizerAvatar = () => {
    if (typeof event.createdBy === "object" && event.createdBy.picture) {
      return event.createdBy.picture;
    }
    return undefined;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatTime = (timeString: string) => {
    try {
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid time";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-100 text-green-800";
      case "DRAFT":
        return "bg-gray-100 text-gray-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "CLOSED":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "FACETOFACE":
        return "bg-blue-100 text-blue-800";
      case "ONLINE":
        return "bg-purple-100 text-purple-800";
      case "HYBRID":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Safe data access with fallbacks
  const safeEvent = {
    name: event.name || "Untitled Event",
    description: event.description || "No description available.",
    image: event.image || "/placeholder-image.jpg",
    status: event.status || "DRAFT",
    type: event.type || "FACETOFACE",
    visibility: event.visibility || "PUBLIC",
    startDate: event.startDate || { date: "", time: "" },
    endDate: event.endDate || { date: "", time: "" },
    location: event.location || {
      name: "Location not specified",
      city: "",
      country: "",
    },
    socialNetworks: event.socialNetworks || {},
    speakers: Array.isArray(event.speakers) ? event.speakers : [],
    exhibitors: Array.isArray(event.exhibitors) ? event.exhibitors : [],
    sponsors: Array.isArray(event.sponsors) ? event.sponsors : [],
    gallery: Array.isArray(event.gallery) ? event.gallery : [],
    program: event.program || "No program details available.",
    isUpComingEvent: event.isUpComingEvent || false,
  };

  const handleEdit = () => {
    navigate(EVENT_EDIT_PAGE(event._id));
  };

  const handleDeleteClick = () => {
    setOpen(true);
  };

  const handleConfirmDelete = () => {
    setIsLoading(true);
    // Add your delete logic here
    console.log("Deleting event:", event._id);
    // After deletion, you might want to navigate away or show a message
    setIsLoading(false);
    setOpen(false);
  };

  const handleCancelDelete = () => {
    setOpen(false);
  };

  // Image click handler
  const handleImageClick = (image: string) => {
    setSelectedImage(image);
  };

  // Speaker click handler
  const handleSpeakerClick = (speaker: any) => {
    setSelectedSpeaker(speaker);
  };

  // Close modal handlers
  const closeImageModal = () => setSelectedImage(null);
  const closeSpeakerModal = () => setSelectedSpeaker(null);

  useEffect(() => {
    console.log("Delete dialog open:", open);
  }, [open]);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {safeEvent.name}
            </h1>
            <div className="flex items-center space-x-2 mt-1">
              <Avatar className="h-6 w-6">
                <AvatarImage src={getOrganizerAvatar()} />
                <AvatarFallback className="text-xs">
                  {getOrganizerName()
                    .split(" ")
                    .map((n: any[]) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <p className="text-muted-foreground text-sm">
                Organized by {getOrganizerName()}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleEdit}>
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit event</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleDeleteClick}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete this Event</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Image */}
          <Card className="overflow-hidden p-0">
            <div className="aspect-video relative">
              <img
                src={safeEvent.image}
                alt={safeEvent.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://via.placeholder.com/800x400?text=Event+Image";
                }}
              />
              <div className="absolute top-4 left-4 flex space-x-2">
                <Badge className={getStatusColor(safeEvent.status)}>
                  {safeEvent.status}
                </Badge>
                <Badge className={getTypeColor(safeEvent.type)}>
                  {safeEvent.type.replace("FACETOFACE", "In-Person")}
                </Badge>
                <Badge variant="default">{safeEvent.visibility}</Badge>
              </div>
            </div>
          </Card>

          {/* Event Details Tabs */}
          <Card className="p-0">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="speakers">Speakers</TabsTrigger>
                <TabsTrigger value="program">Program</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
              </TabsList>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-6 p-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Description</h3>
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: safeEvent.description }}
                  />
                </div>

                <Separator />

                <div className="flex flex-col gap-6">
                  {/* Date & Time */}
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Date & Time
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Start:</span>
                        <span>
                          {formatDate(safeEvent.startDate.date)} at{" "}
                          {formatTime(safeEvent.startDate.time)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">End:</span>
                        <span>
                          {formatDate(safeEvent.endDate.date)} at{" "}
                          {formatTime(safeEvent.endDate.time)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <GoogleMap
                    location={safeEvent.location.location}
                    name={safeEvent.location.name}
                    address={`${safeEvent.location.name}, ${safeEvent.location.city}, ${safeEvent.location.country}`}
                    height="300px"
                  />
                </div>

                {/* Social Links */}
                {safeEvent.socialNetworks &&
                  Object.keys(safeEvent.socialNetworks).some(
                    (key) => safeEvent.socialNetworks[key]
                  ) && (
                    <>
                      <Separator />
                      <div className="space-y-4">
                        <h4 className="font-semibold flex items-center">
                          <Globe className="h-4 w-4 mr-2" />
                          Social Links
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {safeEvent.socialNetworks.website && (
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={safeEvent.socialNetworks.website}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Website
                              </a>
                            </Button>
                          )}
                          {safeEvent.socialNetworks.facebook && (
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={safeEvent.socialNetworks.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Facebook className="h-4 w-4 mr-2" />
                                Facebook
                              </a>
                            </Button>
                          )}
                          {safeEvent.socialNetworks.twitter && (
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={safeEvent.socialNetworks.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Twitter className="h-4 w-4 mr-2" />
                                Twitter
                              </a>
                            </Button>
                          )}
                          {safeEvent.socialNetworks.linkedin && (
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={safeEvent.socialNetworks.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Linkedin className="h-4 w-4 mr-2" />
                                LinkedIn
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
              </TabsContent>

              {/* Speakers Tab */}
              <TabsContent value="speakers" className="p-6">
                {safeEvent.speakers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {safeEvent.speakers.map((speaker: any) => (
                      <Card 
                        key={speaker._id} 
                        className="text-center cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105"
                        onClick={() => handleSpeakerClick(speaker)}
                      >
                        <CardContent className="pt-6">
                          <Avatar className="h-20 w-20 mx-auto mb-4">
                            <AvatarImage
                              src={speaker.picture}
                              alt={speaker.fullName}
                            />
                            <AvatarFallback>
                              {speaker.fullName
                                ?.split(" ")
                                .map((n: string) => n[0])
                                .join("") || "SP"}
                            </AvatarFallback>
                          </Avatar>
                          <h4 className="font-semibold">
                            {speaker.fullName || "Speaker"}
                          </h4>
                          {speaker.position && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {speaker.position}
                            </p>
                          )}
                          {speaker.company && (
                            <p className="text-sm text-muted-foreground">
                              {speaker.company}
                            </p>
                          )}
                          <div className="flex justify-center space-x-2 mt-3">
                            {speaker.socialNetworks?.linkedin && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                asChild
                                onClick={(e) => e.stopPropagation()}
                              >
                                <a
                                  href={speaker.socialNetworks.linkedin}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Linkedin className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                            {speaker.socialNetworks?.twitter && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                asChild
                                onClick={(e) => e.stopPropagation()}
                              >
                                <a
                                  href={speaker.socialNetworks.twitter}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Twitter className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                            {speaker.socialNetworks?.website && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                asChild
                                onClick={(e) => e.stopPropagation()}
                              >
                                <a
                                  href={speaker.socialNetworks.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No speakers announced yet.
                  </div>
                )}
              </TabsContent>

              {/* Program Tab */}
              <TabsContent value="program" className="p-6">
                <div className="bg-muted/50 rounded-lg p-6">
                  <div className="w-full">
                    <p className="text-sm flex w-full h-[100px] wrap-break-word flex-wrap line-clamp-3">
                    {safeEvent.program || "No program details available."}
                    </p>
                   
                  </div>
                </div>
              </TabsContent>

              {/* Gallery Tab */}
              <TabsContent value="gallery" className="p-6">
                {safeEvent.gallery.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {safeEvent.gallery.map((image: string, index: number) => (
                      <div
                        key={index}
                        className="aspect-square overflow-hidden rounded-lg cursor-pointer group"
                        onClick={() => handleImageClick(image)}
                      >
                        <img
                          src={image}
                          alt={`Event gallery ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://via.placeholder.com/300x300?text=Image+Not+Found";
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No gallery images available.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Event Info */}
          <Card>
            <CardHeader>
              <CardTitle>Event Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  <div className="font-medium">Date</div>
                  <div className="text-muted-foreground">
                    {formatDate(safeEvent.startDate.date)}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  <div className="font-medium">Time</div>
                  <div className="text-muted-foreground">
                    {formatTime(safeEvent.startDate.time)} -{" "}
                    {formatTime(safeEvent.endDate.time)}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  <div className="font-medium">Venue</div>
                  <div className="text-muted-foreground">
                    {safeEvent.location.name}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  <div className="font-medium">Event Type</div>
                  <div className="text-muted-foreground">
                    {safeEvent.type === "FACETOFACE"
                      ? "In-Person"
                      : safeEvent.type === "ONLINE"
                      ? "Online"
                      : "Hybrid"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exhibitors */}
          {safeEvent.exhibitors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Exhibitors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {safeEvent.exhibitors.map((exhibitor: any) => (
                  <div
                    key={exhibitor._id}
                    className="flex items-center space-x-3"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={exhibitor.picture}
                        alt={exhibitor.fullName}
                      />
                      <AvatarFallback>
                        {exhibitor.fullName
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("") || "EX"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <div className="font-medium">
                        {exhibitor.fullName || "Exhibitor"}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Sponsors */}
          {safeEvent.sponsors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Sponsors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {safeEvent.sponsors.map((sponsor: any) => (
                  <div
                    key={sponsor._id}
                    className="flex items-center space-x-3"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={sponsor.logo} alt={sponsor.name} />
                      <AvatarFallback>
                        {sponsor.name
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("") || "SP"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <div className="font-medium">
                        {sponsor.name || "Sponsor"}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this event?
            </AlertDialogTitle>
            <AlertDialogDescription className="flex flex-wrap max-w-full">
              This action cannot be undone. The event{" "}
              <span className="font-semibold">"{safeEvent.name}"</span> will be
              permanently deleted from your organization.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleConfirmDelete}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Preview Modal */}
      <Dialog open={!!selectedImage} onOpenChange={closeImageModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-3 bg-transparent border-none backdrop-blur-xl">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-2 -right-2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-md"
              onClick={closeImageModal}
            >
              <X className="h-4 w-4" />
            </Button>
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Event gallery preview"
                className="w-full h-auto max-h-[80vh] object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://via.placeholder.com/800x600?text=Image+Not+Found";
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Speaker Detail Modal */}
      <Dialog open={!!selectedSpeaker} onOpenChange={closeSpeakerModal}>
        <DialogContent className="max-w-2xl border-slate-300">
          <DialogHeader>
            <DialogTitle>Speaker Details</DialogTitle>
          </DialogHeader>
          {selectedSpeaker && (
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
                <AvatarImage
                  src={selectedSpeaker.picture}
                  alt={selectedSpeaker.fullName}
                />
                <AvatarFallback className="text-lg">
                  {selectedSpeaker.fullName
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("") || "SP"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedSpeaker.fullName || "Speaker"}
                  </h3>
                  {selectedSpeaker.position && (
                    <p className="text-muted-foreground font-medium">
                      {selectedSpeaker.position}
                    </p>
                  )}
                  {selectedSpeaker.company && (
                    <p className="text-muted-foreground">
                      {selectedSpeaker.company}
                    </p>
                  )}
                </div>
                
                {selectedSpeaker.bio && (
                  <div>
                    <h4 className="font-semibold mb-2">About</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedSpeaker.bio}
                    </p>
                  </div>
                )}

                <div className="flex space-x-3 pt-2">
                  {selectedSpeaker.socialNetworks?.linkedin && (
                    <Button variant="outline" size="icon" asChild>
                      <a
                        href={selectedSpeaker.socialNetworks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {selectedSpeaker.socialNetworks?.twitter && (
                    <Button variant="outline" size="icon" asChild>
                      <a
                        href={selectedSpeaker.socialNetworks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Twitter className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {selectedSpeaker.socialNetworks?.website && (
                    <Button variant="outline" size="icon" asChild>
                      <a
                        href={selectedSpeaker.socialNetworks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventDetails;