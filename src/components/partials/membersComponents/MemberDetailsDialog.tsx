import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  UserCheck,
  UserX,
  Edit,
  Trash2,
  Cake,
  Globe,
  Shield,
} from "lucide-react"
import type { Member } from "@/types/membersType"

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
  if (!member) return null

  const formatDate = (dateInput: any): string => {
    try {
      if (!dateInput) return 'N/A'
      
      let timestamp: number
      
      if (typeof dateInput === 'string') {
        timestamp = parseInt(dateInput)
      } else if (dateInput.$date && dateInput.$date.$numberLong) {
        timestamp = parseInt(dateInput.$date.$numberLong)
      } else if (dateInput.$numberLong) {
        timestamp = parseInt(dateInput.$numberLong)
      } else if (typeof dateInput === 'number') {
        timestamp = dateInput
      } else {
        return 'N/A'
      }
      
      return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'N/A'
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  const handleEdit = () => {
    onEdit?.(member)
    onClose()
  }

  const handleDelete = () => {
    onDelete?.(member)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            Member Details
          </DialogTitle>
          <DialogDescription>
            Complete information about the member
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-start gap-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
              <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                <AvatarImage src={member.picture} alt={`${member.firstName} ${member.lastName}`} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  {getInitials(member.firstName, member.lastName)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {member.firstName} {member.lastName}
                </h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge 
                    variant={member.isActive ? "default" : "secondary"}
                    className="text-sm px-3 py-1"
                  >
                    {member.isActive ? (
                      <>
                        <UserCheck className="w-3 h-3 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <UserX className="w-3 h-3 mr-1" />
                        Inactive
                      </>
                    )}
                  </Badge>
                  <Badge 
                    variant={member.registrationCompleted ? "default" : "outline"}
                    className="text-sm px-3 py-1"
                  >
                    {member.registrationCompleted ? 'Registration Complete' : 'Registration Pending'}
                  </Badge>
                  {member.gender && (
                    <Badge variant="outline" className="text-sm px-3 py-1">
                      {member.gender}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 font-mono">
                  ID: {member._id.toString().slice(-12)}
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2 text-gray-900">
                <Mail className="h-5 w-5 text-blue-500" />
                Contact Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">Email Address</label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <p className="text-gray-900">{member.email || 'N/A'}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">Phone Number</label>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <p className="text-gray-900">{member.phoneNumber || 'N/A'}</p>
                  </div>
                </div>
                {(member.city || member.country) && (
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">Location</label>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <p className="text-gray-900">
                        {[member.city, member.country].filter(Boolean).join(', ') || 'N/A'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Personal Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2 text-gray-900">
                <User className="h-5 w-5 text-purple-500" />
                Personal Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">First Name</label>
                  <p className="text-gray-900">{member.firstName || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">Last Name</label>
                  <p className="text-gray-900">{member.lastName || 'N/A'}</p>
                </div>
                {member.gender && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">Gender</label>
                    <p className="text-gray-900">{member.gender}</p>
                  </div>
                )}
                {member.birthday && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">Birthday</label>
                    <div className="flex items-center gap-2">
                      <Cake className="w-4 h-4 text-muted-foreground" />
                      <p className="text-gray-900">{formatDate(member.birthday)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Account Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2 text-gray-900">
                <Shield className="h-5 w-5 text-green-500" />
                Account Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">Account Status</label>
                  <p className="text-gray-900">
                    {member.isActive ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <UserCheck className="w-4 h-4" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-600">
                        <UserX className="w-4 h-4" />
                        Inactive
                      </span>
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">Registration Status</label>
                  <p className="text-gray-900">
                    {member.registrationCompleted ? (
                      <span className="text-green-600">Completed</span>
                    ) : (
                      <span className="text-yellow-600">Pending</span>
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">User ID</label>
                  <p className="text-gray-900 font-mono text-sm">{member.user || 'N/A'}</p>
                </div>
                {member.role && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">Role ID</label>
                    <p className="text-gray-900 font-mono text-sm">{member.role.$oid || 'N/A'}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Timestamps */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2 text-gray-900">
                <Calendar className="h-5 w-5 text-orange-500" />
                Timestamps
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">Joined Date</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <p className="text-gray-900">{formatDate(member.createdAt)}</p>
                  </div>
                </div>
                {member.updatedAt && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <p className="text-gray-900">{formatDate(member.updatedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          
          <div className="flex gap-2">
            {onEdit && (
              <Button onClick={handleEdit} className="gap-2">
                <Edit className="w-4 h-4" />
                Edit Member
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" onClick={handleDelete} className="gap-2">
                <Trash2 className="w-4 h-4" />
                Delete Member
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default MemberDetailsDialog

