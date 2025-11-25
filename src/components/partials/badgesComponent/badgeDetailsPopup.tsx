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
import { Award, Calendar, FileText, Image as ImageIcon, X } from "lucide-react"

interface Badge {
  _id: string
  name: string
  description: string
  design: string
  image: string
  createdAt?: string
  updatedAt?: string
  // Add any additional fields your badge might have
}

interface BadgeDetailsPopupProps {
  badge: Badge | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (badge: Badge) => void
  onDelete?: (badge: Badge) => void
}

const BadgeDetailsPopup = ({ 
  badge, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete 
}: BadgeDetailsPopupProps) => {
  if (!badge) return null

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleEdit = () => {
    onEdit?.(badge)
    onClose()
  }

  const handleDelete = () => {
  onDelete?.(badge)
  // Don't close the popup immediately, let the user confirm in the dialog
}

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] border-slate-300">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-500" />
            Badge Details
          </DialogTitle>
          <DialogDescription>
            Detailed information about the badge
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {badge.image && !badge.image.includes('example.com') ? (
                  <img
                    src={badge.image}
                    alt={badge.name}
                    className="w-20 h-20 rounded-lg object-cover border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                ) : null}
                <div className={`w-20 h-20 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center border ${badge.image && !badge.image.includes('example.com') ? 'hidden' : ''}`}>
                  <Award className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">{badge.name}</h3>
                <p className="text-gray-600 mt-1">{badge.description}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">{badge.design}</Badge>
                  <Badge variant="outline">ID: {badge._id.slice(-8)}</Badge>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Design Information */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  Design Information
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Design Type</label>
                    <p className="text-gray-900">{badge.design}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Badge ID</label>
                    <p className="text-gray-900 font-mono text-sm">{badge._id}</p>
                  </div>
                </div>
              </div>

              {/* Image Information */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-gray-500" />
                  Image Information
                </h4>
                <div>
                  <label className="text-sm font-medium text-gray-500">Image URL</label>
                  <p className="text-gray-900 text-sm break-all flex flex-wrap wrap-break-word truncate">
                    {badge.image || 'No image URL provided'}
                  </p>
                </div>
              </div>

              {/* Timestamps */}
              {(badge.createdAt || badge.updatedAt) && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    Timestamps
                  </h4>
                  <div className="space-y-2">
                    {badge.createdAt && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Created</label>
                        <p className="text-gray-900 text-sm">{formatDate(badge.createdAt)}</p>
                      </div>
                    )}
                    {badge.updatedAt && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Last Updated</label>
                        <p className="text-gray-900 text-sm">{formatDate(badge.updatedAt)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Additional notes or custom fields can be added here */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Additional Information</h4>
              <p className="text-gray-600 text-sm">
                This badge represents an achievement that users can earn within the platform.
              </p>
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
              <Button variant="outline" onClick={handleEdit}>
                Edit Badge
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" onClick={handleDelete}>
                Delete Badge
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default BadgeDetailsPopup