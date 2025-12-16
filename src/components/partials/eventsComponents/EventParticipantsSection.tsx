import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchEventParticipantsApi } from "@/api/guestsApi"
import { deleteMemberApi } from "@/api/membersApi"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"
import { Trash2, Mail, Phone, MapPin, User } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface EventParticipant {
  _id?: string
  firstName?: string
  lastName?: string
  email?: string
  phoneNumber?: string
  city?: string
  gender?: string
  status?: string
}

interface EventParticipantsSectionProps {
  eventId?: string
  className?: string
  layout?: "default" | "compact"
  onStatsChange?: (stats: { count: number; isLoading: boolean; error?: string | null }) => void
}

export const EventParticipantsSection = ({
  eventId,
  className,
  // layout = "default",
  onStatsChange,
}: EventParticipantsSectionProps) => {
  const { t } = useTranslation()
  const [participants, setParticipants] = useState<EventParticipant[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<EventParticipant | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadParticipants = async () => {
    if (!eventId) return
    setIsLoading(true)
    setError(null)
    onStatsChange?.({ count: 0, isLoading: true, error: null })
    try {
      const response = await fetchEventParticipantsApi(eventId)
      const data = Array.isArray(response?.data?.data)
        ? response.data.data
        : Array.isArray(response?.data)
          ? response.data
          : []
      setParticipants(data)
      onStatsChange?.({ count: data.length, isLoading: false, error: null })
    } catch (err: any) {
      console.error("Failed to load participants:", err)
      setError(err?.response?.data?.message || err?.message || "Unable to load participants.")
      onStatsChange?.({
        count: 0,
        isLoading: false,
        error: err?.response?.data?.message || err?.message || "Unable to load participants.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadParticipants()
  }, [eventId])

  const handleDeleteClick = (member: EventParticipant) => {
    setSelectedMember(member)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedMember?._id) return

    setIsDeleting(true)
    try {
      await deleteMemberApi(selectedMember._id)
      toast.success(t('members.messages.deleteSuccess', 'Member deleted successfully'))
      setDeleteDialogOpen(false)
      setSelectedMember(null)
      // Reload participants
      await loadParticipants()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('members.messages.deleteError', 'Failed to delete member'))
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-9 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive", className)}>
        {error}
      </div>
    )
  }

  if (participants.length === 0) {
    return (
      <div className={cn("rounded-md border border-dashed border-muted-foreground/40 p-8 text-center", className)}>
        <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          {t('members.emptyState.noMembers', 'No members registered for this event yet.')}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
        {participants.map((member) => (
          <Card key={member._id} className="hover:shadow-md transition-shadow relative p-2">
            <CardContent className="p-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">
                      {member.firstName} {member.lastName}
                    </h4>
                    {member.status && (
                      <Badge variant={member.status === 'CONFIRMED' ? 'default' : 'secondary'} className="text-xs mt-1">
                        {member.status}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 absolute top-2 right-2"
                  onClick={() => handleDeleteClick(member)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2 text-xs text-muted-foreground w-full">
                {member.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{member.email}</span>
                  </div>
                )}
                {member.phoneNumber && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    <span>{member.phoneNumber}</span>
                  </div>
                )}
                {member.city && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    <span>{member.city}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('members.deleteDialog.title', 'Delete Member')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'members.deleteDialog.description',
                'Are you sure you want to remove this member from the event? This action cannot be undone.',
                { name: `${selectedMember?.firstName} ${selectedMember?.lastName}` }
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t('common.cancel', 'Cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? t('common.deleting', 'Deleting...') : t('common.delete', 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default EventParticipantsSection
