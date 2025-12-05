import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { Folder, Calendar, FileText, Hash, Sparkles, Info } from "lucide-react"
import { useTranslation } from "react-i18next"

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
  const { t } = useTranslation()
  
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
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] border-slate-300 p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-br from-slate-50 via-white to-slate-50">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl blur opacity-20"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <Folder className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                {t('categories.categoryDetails.title', 'Category Details')}
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-600 mt-1">
                {t('categories.categoryDetails.description', 'Detailed information about the category')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)] px-6">
          <div className="space-y-6 pb-6">
            {/* Hero Section */}
            <Card className="border-2 border-slate-200 bg-gradient-to-br from-white via-slate-50 to-white shadow-sm overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl blur-sm opacity-30 animate-pulse"></div>
                    <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 flex items-center justify-center border-2 border-white shadow-xl text-5xl">
                      {category.icon}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                      {category.name}
                      <Sparkles className="h-5 w-5 text-yellow-500" />
                    </h3>
                    <p className="text-slate-600 leading-relaxed mb-3">
                      {category.description}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary" className="gap-1.5 px-3 py-1 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 border border-slate-300">
                        <Folder className="h-3 w-3" />
                        {t('categories.categoryDetails.badges.category', 'Category')}
                      </Badge>
                      <Badge variant="outline" className="gap-1.5 px-3 py-1 font-mono text-xs bg-white">
                        <Hash className="h-3 w-3" />
                        {category._id.slice(-8)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Basic Information Card */}
              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-slate-900">
                      {t('categories.categoryDetails.sections.basicInfo', 'Basic Information')}
                    </h4>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                        {t('categories.categoryDetails.header.name', 'Category Name')}
                      </label>
                      <p className="text-slate-900 font-medium">{category.name}</p>
                    </div>
                    <Separator />
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                        {t('categories.categoryDetails.header.icon', 'Icon')}
                      </label>
                      <p className="text-4xl">{category.icon}</p>
                    </div>
                    <Separator />
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                        {t('categories.categoryDetails.header.categoryId', 'Category ID')}
                      </label>
                      <p className="text-slate-900 font-mono text-xs bg-slate-100 px-2 py-1.5 rounded border border-slate-200 break-all">
                        {category._id}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description Card */}
              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                      <Hash className="h-4 w-4 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-slate-900">
                      {t('categories.categoryDetails.sections.description', 'Description')}
                    </h4>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      {t('categories.categoryDetails.labels.fullDescription', 'Full Description')}
                    </label>
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-lg border border-slate-200">
                      <p className="text-slate-700 text-sm leading-relaxed">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timestamps Card */}
              {(category.createdAt || category.updatedAt) && (
                <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-slate-900">
                        {t('categories.categoryDetails.sections.timestamps', 'Timestamps')}
                      </h4>
                    </div>
                    <div className="space-y-4">
                      {category.createdAt && (
                        <>
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                              {t('categories.categoryDetails.labels.created', 'Created')}
                            </label>
                            <p className="text-slate-900 text-sm font-medium">{formatDate(category.createdAt)}</p>
                          </div>
                          {category.updatedAt && <Separator />}
                        </>
                      )}
                      {category.updatedAt && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                            {t('categories.categoryDetails.labels.lastUpdated', 'Last Updated')}
                          </label>
                          <p className="text-slate-900 text-sm font-medium">{formatDate(category.updatedAt)}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Usage Information Card */}
              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 lg:col-span-2">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                      <Info className="h-4 w-4 text-amber-600" />
                    </div>
                    <h4 className="font-semibold text-slate-900">
                      {t('categories.categoryDetails.sections.usage', 'Category Usage')}
                    </h4>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 rounded-lg border border-slate-200">
                    <p className="text-slate-700 text-sm leading-relaxed">
                      {t('categories.categoryDetails.usageDescription')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </ScrollArea>

        {/* Actions Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-slate-200 bg-slate-50">
          <Button
            variant="outline"
            onClick={onClose}
            className="gap-2"
          >
            {t('categories.categoryDetails.actions.close', 'Close')}
          </Button>
          
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="outline"
                onClick={handleEdit}
                className="gap-2"
              >
                {t('categories.categoryDetails.actions.editCategory', 'Edit Category')}
              </Button>
            )}
            {onDelete && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="gap-2"
              >
                {t('categories.categoryDetails.actions.deleteCategory', 'Delete Category')}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CategoryDetailsPopup