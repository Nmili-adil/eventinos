import React, { useEffect, useState } from "react"
import type { Member } from "@/types/membersType"
import { useTranslation } from "react-i18next"
import { fetchMemberParticipationsApi } from "@/api/guestsApi"
import { useNavigate } from "react-router-dom"
import { EVENT_DETAILS_PAGE } from "@/constants/routerConstants"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface MemberDetailsDialogProps {
  member: Member | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (member: Member) => void
  onDelete?: (member: Member) => void
}



const MemberDetailsDialog = ({
  member,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: MemberDetailsDialogProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Enhanced safe render helper
  const safeRender = (value: any, fallback: string = t('members.detailsDialog.notAvailable')): string => {
    if (value === null || value === undefined) return fallback
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value)
    }
    if (typeof value === 'object') {
      if (React.isValidElement(value)) return fallback
      if (typeof value.toString === 'function' && value.toString() !== '[object Object]') {
        return value.toString()
      }
      if (value.city || value.country || value.name) {
        return [value.city, value.country, value.name].filter(Boolean).join(', ')
      }
      return fallback
    }
    return fallback
  }

  const [memberEvents, setMemberEvents] = useState<any[]>([])
  const [eventsLoading, setEventsLoading] = useState(false)
  const [eventsError, setEventsError] = useState<string | null>(null)

  const handleViewEventDetails = (eventRecord: any) => {
    navigate(EVENT_DETAILS_PAGE(eventRecord._id))
    onClose()
  }

  const formatDate = (dateInput: any): string => {
    try {
      if (!dateInput) return t('members.detailsDialog.notAvailable', 'Not available')
      
      let timestamp: number
      
      if (typeof dateInput === 'string') {
        if (/^\d+$/.test(dateInput)) {
          timestamp = parseInt(dateInput, 10)
        } else {
          const parsed = Date.parse(dateInput)
          if (Number.isNaN(parsed)) return t('members.detailsDialog.notAvailable', 'Not available')
          timestamp = parsed
        }
      } else if (dateInput.$date && dateInput.$date.$numberLong) {
        timestamp = parseInt(dateInput.$date.$numberLong)
      } else if (dateInput.$numberLong) {
        timestamp = parseInt(dateInput.$numberLong)
      } else if (dateInput instanceof Date) {
        timestamp = dateInput.getTime()
      } else if (typeof dateInput === 'number') {
        timestamp = dateInput
      } else {
        return t('members.detailsDialog.notAvailable', 'Not available')
      }
      
      return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch (error) {
      console.error('Error formatting date:', error)
      return t('members.detailsDialog.notAvailable', 'Not available')
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  const handleEdit = () => {
    if (member) {
      onClose() // Close this dialog first
      onEdit?.(member) // Then open edit dialog
    }
  }

  const handleDelete = () => {
    if (member) onDelete?.(member)
  }

  useEffect(() => {
    const loadMemberEvents = async () => {
      if (!member?._id) return
      
      const memberId = typeof member._id === 'string' ? member._id : member._id.$oid
      if (!memberId) return
      
      setEventsLoading(true)
      setEventsError(null)
      try {
        const response = await fetchMemberParticipationsApi(memberId)
        const data = Array.isArray(response?.data?.data)
          ? response.data.data
          : Array.isArray(response?.data)
            ? response.data
            : []
        setMemberEvents(data)
      } catch (error: any) {
        console.error('Failed to load member events', error)
        setMemberEvents([])
        setEventsError(error?.response?.data?.message || error?.message || t('members.detailsDialog.events.unableToLoad'))
      } finally {
        setEventsLoading(false)
      }
    }

    if (member && isOpen) {
      loadMemberEvents()
    }
  }, [member, isOpen, t])

  if (!member || !isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={member.picture} alt={`${member.firstName} ${member.lastName}`} />
              <AvatarFallback>
                {getInitials(member.firstName, member.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-xl font-semibold">
                {safeRender(member.firstName)} {safeRender(member.lastName)}
              </div>
              <div className="text-sm text-muted-foreground">{safeRender(member.email)}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <ScrollArea className="h-[500px] pr-4">
              {/* Status Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Card className="p-4">
                  <div className="text-sm text-muted-foreground mb-1">
                    Status
                  </div>
                  <Badge className={member.isActive ? 'bg-green-500' : 'bg-red-500'}>
                    {member.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </Card>
                
                <Card className="p-4">
                  <div className="text-sm text-muted-foreground mb-1">
                    Registration
                  </div>
                  <Badge className={member.registrationCompleted ? 'bg-green-500' : 'secondary'}>
                    {member.registrationCompleted ? 'Complete' : 'Pending'}
                  </Badge>
                </Card>
              </div>

              {/* Contact Information */}
              <Card className="p-4 mb-4">
                <h3 className="text-lg font-semibold mb-4">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Email</div>
                      <div className="font-medium">{safeRender(member.email, 'Not provided')}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <div className="font-medium">{safeRender(member.phoneNumber, 'Not provided')}</div>
                    </div>
                  </div>
                  
                  {(member.city || member.country) && (
                    <>
                      <Separator />
                      <div>
                        <div className="text-sm text-muted-foreground">Location</div>
                        <div className="font-medium">
                          {[safeRender(member.city), safeRender(member.country)].filter(v => v && v !== 'Not available').join(', ') || 'Not provided'}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </Card>

              {/* Personal Information */}
              <Card className="p-4 mb-4">
                <h3 className="text-lg font-semibold mb-4">
                  Personal Details
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">First Name</div>
                      <div className="font-medium">{safeRender(member.firstName)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Last Name</div>
                      <div className="font-medium">{safeRender(member.lastName)}</div>
                    </div>
                  </div>
                  
                  {(member.gender || member.birthday) && (
                    <>
                      <Separator />
                      <div className="grid grid-cols-2 gap-4">
                        {member.gender && (
                          <div>
                            <div className="text-sm text-muted-foreground">Gender</div>
                            <div className="font-medium capitalize">{safeRender(member.gender)}</div>
                          </div>
                        )}
                        {member.birthday && (
                          <div>
                            <div className="text-sm text-muted-foreground">Birthday</div>
                            <div className="font-medium">{formatDate(member.birthday)}</div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </Card>

              {/* Account Timeline */}
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">
                  Account Timeline
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">Member since</div>
                    <div className="font-medium">{formatDate(member.createdAt)}</div>
                  </div>
                  {member.updatedAt && (
                    <>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">Last updated</div>
                        <div className="font-medium">{formatDate(member.updatedAt)}</div>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            </ScrollArea>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-4">
            <ScrollArea className="h-[500px] pr-4">
              {eventsLoading && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-muted-foreground">Loading events...</div>
                </div>
              )}
              
              {eventsError && (
                <Card className="p-4 border-destructive">
                  <div className="text-destructive">{eventsError}</div>
                </Card>
              )}
              
              {!eventsLoading && !eventsError && memberEvents.length === 0 && (
                <Card className="p-8">
                  <div className="text-center text-muted-foreground">
                    <p>No events found</p>
                    <p className="text-sm mt-1">This member hasn't participated in any events yet</p>
                  </div>
                </Card>
              )}
              
              {!eventsLoading && !eventsError && memberEvents.length > 0 && (
                <div className="space-y-3">
                  {memberEvents.map((eventRecord: any, index: number) => (
                    <Card 
                      key={eventRecord?._id || eventRecord?.eventId || index}
                      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleViewEventDetails(eventRecord)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-2">
                            {safeRender(eventRecord?.eventName || eventRecord?.name, 'Untitled Event')}
                          </h4>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Date:</span>
                              <span>{eventRecord?.date ? formatDate(eventRecord.date) : 'Not set'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Location:</span>
                              <span>{safeRender(eventRecord?.city || eventRecord?.location, 'Not set')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            <ScrollArea className="h-[500px] pr-4">
              <Card className="p-4 mb-4">
                <h3 className="text-lg font-semibold mb-4">
                  Account Activity
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-muted-foreground">Account Created</span>
                    <span className="font-medium">{formatDate(member.createdAt)}</span>
                  </div>
                  
                  {member.updatedAt && (
                    <>
                      <Separator />
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="text-muted-foreground">Last Profile Update</span>
                        <span className="font-medium">{formatDate(member.updatedAt)}</span>
                      </div>
                    </>
                  )}
                  
                  <Separator />
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-muted-foreground">Event Participations</span>
                    <span className="font-medium">{memberEvents.length} {memberEvents.length === 1 ? 'event' : 'events'}</span>
                  </div>
                </div>
              </Card>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onEdit && (
            <Button variant="default" onClick={handleEdit}>
              Edit
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default MemberDetailsDialog