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
import { useTranslation } from "react-i18next"

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

  if (!member) return null

  const formatDate = (dateInput: any): string => {
    try {
      if (!dateInput) return t('members.detailsDialog.notAvailable', 'N/A')
      
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
        return t('members.detailsDialog.notAvailable', 'N/A')
      }
      
      return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch (error) {
      console.error('Error formatting date:', error)
      return t('members.detailsDialog.notAvailable', 'N/A')
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
      <DialogContent className="max-w-3xl max-h-[90vh] border-slate-300">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            {t('members.detailsDialog.title', 'Member Details')}
          </DialogTitle>
          <DialogDescription>
            {t('members.detailsDialog.description', 'Complete information about the member')}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-start gap-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-slate-400">
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
                        {t('members.detailsDialog.status.active', 'Active')}
                      </>
                    ) : (
                      <>
                        <UserX className="w-3 h-3 mr-1" />
                        {t('members.detailsDialog.status.inactive', 'Inactive')}
                      </>
                    )}
                  </Badge>
                  <Badge 
                    variant={member.registrationCompleted ? "default" : "outline"}
                    className="text-sm px-3 py-1"
                  >
                    {member.registrationCompleted ? 
                      t('members.detailsDialog.status.registrationComplete', 'Registration Complete') : 
                      t('members.detailsDialog.status.registrationPending', 'Registration Pending')
                    }
                  </Badge>
                  {member.gender && (
                    <Badge variant="outline" className="text-sm px-3 py-1">
                      {member.gender}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 font-mono">
                  {t('members.detailsDialog.fields.memberId', 'ID')}: {member._id.toString().slice(-12)}
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2 text-gray-900">
                <Mail className="h-5 w-5 text-blue-500" />
                {t('members.detailsDialog.sections.contactInfo', 'Contact Information')}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">
                    {t('members.detailsDialog.fields.email', 'Email Address')}
                  </label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <p className="text-gray-900">{member.email || t('members.detailsDialog.notAvailable', 'N/A')}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">
                    {t('members.detailsDialog.fields.phone', 'Phone Number')}
                  </label>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <p className="text-gray-900">{member.phoneNumber || t('members.detailsDialog.notAvailable', 'N/A')}</p>
                  </div>
                </div>
                {(member.city || member.country) && (
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">
                      {t('members.detailsDialog.fields.location', 'Location')}
                    </label>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <p className="text-gray-900">
                        {[member.city, member.country].filter(Boolean).join(', ') || t('members.detailsDialog.notAvailable', 'N/A')}
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
                {t('members.detailsDialog.sections.personalInfo', 'Personal Information')}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">
                    {t('members.detailsDialog.fields.firstName', 'First Name')}
                  </label>
                  <p className="text-gray-900">{member.firstName || t('members.detailsDialog.notAvailable', 'N/A')}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">
                    {t('members.detailsDialog.fields.lastName', 'Last Name')}
                  </label>
                  <p className="text-gray-900">{member.lastName || t('members.detailsDialog.notAvailable', 'N/A')}</p>
                </div>
                {member.gender && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">
                      {t('members.detailsDialog.fields.gender', 'Gender')}
                    </label>
                    <p className="text-gray-900">{member.gender}</p>
                  </div>
                )}
                {member.birthday && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">
                      {t('members.detailsDialog.fields.birthday', 'Birthday')}
                    </label>
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
                {t('members.detailsDialog.sections.accountInfo', 'Account Information')}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">
                    {t('members.detailsDialog.fields.accountStatus', 'Account Status')}
                  </label>
                  <p className="text-gray-900">
                    {member.isActive ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <UserCheck className="w-4 h-4" />
                        {t('members.detailsDialog.status.active', 'Active')}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-600">
                        <UserX className="w-4 h-4" />
                        {t('members.detailsDialog.status.inactive', 'Inactive')}
                      </span>
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">
                    {t('members.detailsDialog.fields.registrationStatus', 'Registration Status')}
                  </label>
                  <p className="text-gray-900">
                    {member.registrationCompleted ? (
                      <span className="text-green-600">
                        {t('members.detailsDialog.status.completed', 'Completed')}
                      </span>
                    ) : (
                      <span className="text-yellow-600">
                        {t('members.detailsDialog.status.pending', 'Pending')}
                      </span>
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">
                    {t('members.detailsDialog.fields.userId', 'User ID')}
                  </label>
                  <p className="text-gray-900 font-mono text-sm">{member.user || t('members.detailsDialog.notAvailable', 'N/A')}</p>
                </div>
                {member.role && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">
                      {t('members.detailsDialog.fields.roleId', 'Role ID')}
                    </label>
                    <p className="text-gray-900 font-mono text-sm">{member.role.$oid || t('members.detailsDialog.notAvailable', 'N/A')}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Timestamps */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2 text-gray-900">
                <Calendar className="h-5 w-5 text-orange-500" />
                {t('members.detailsDialog.sections.timestamps', 'Timestamps')}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">
                    {t('members.detailsDialog.fields.joinedDate', 'Joined Date')}
                  </label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <p className="text-gray-900">{formatDate(member.createdAt)}</p>
                  </div>
                </div>
                {member.updatedAt && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">
                      {t('members.detailsDialog.fields.lastUpdated', 'Last Updated')}
                    </label>
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
            {t('members.detailsDialog.buttons.close', 'Close')}
          </Button>
          
          <div className="flex gap-2">
            {onEdit && (
              <Button onClick={handleEdit} className="gap-2">
                <Edit className="w-4 h-4" />
                {t('members.detailsDialog.buttons.editMember', 'Edit Member')}
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" onClick={handleDelete} className="gap-2 text-gray-100">
                <Trash2 className="w-4 h-4" />
                {t('members.detailsDialog.buttons.deleteMember', 'Delete Member')}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default MemberDetailsDialog