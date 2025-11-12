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
import { Folder, Calendar, FileText, Hash } from "lucide-react"

interface Category {
  _id: string
  name: string
  description: string
  icon: string
  createdAt?: string
  updatedAt?: string
}

interface CategoryDetailsPopupProps {
  category: Category | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (category: Category) => void
  onDelete?: (category: Category) => void
}

const CategoryDetailsPopup = ({ 
  category, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete 
}: CategoryDetailsPopupProps) => {
  if (!category) return null

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
    onEdit?.(category)
    onClose()
  }

  const handleDelete = () => {
    onDelete?.(category)
    // Don't close the popup immediately, let the user confirm in the dialog
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-green-500" />
            Category Details
          </DialogTitle>
          <DialogDescription>
            Detailed information about the category
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center border text-3xl">
                  {category.icon}
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">{category.name}</h3>
                <p className="text-gray-600 mt-1">{category.description}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">Category</Badge>
                  <Badge variant="outline">ID: {category._id.slice(-8)}</Badge>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Information */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  Basic Information
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Category Name</label>
                    <p className="text-gray-900">{category.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Icon</label>
                    <p className="text-gray-900 text-2xl">{category.icon}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Category ID</label>
                    <p className="text-gray-900 font-mono text-sm">{category._id}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Hash className="h-4 w-4 text-gray-500" />
                  Description
                </h4>
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Description</label>
                  <p className="text-gray-900 text-sm mt-1 bg-gray-50 p-3 rounded-md">
                    {category.description}
                  </p>
                </div>
              </div>

              {/* Timestamps */}
              {(category.createdAt || category.updatedAt) && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    Timestamps
                  </h4>
                  <div className="space-y-2">
                    {category.createdAt && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Created</label>
                        <p className="text-gray-900 text-sm">{formatDate(category.createdAt)}</p>
                      </div>
                    )}
                    {category.updatedAt && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Last Updated</label>
                        <p className="text-gray-900 text-sm">{formatDate(category.updatedAt)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Additional Information */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Category Usage</h4>
              <p className="text-gray-600 text-sm">
                This category is used to organize and classify events within the platform.
                Events assigned to this category will be grouped together for better organization.
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
                Edit Category
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" onClick={handleDelete}>
                Delete Category
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CategoryDetailsPopup