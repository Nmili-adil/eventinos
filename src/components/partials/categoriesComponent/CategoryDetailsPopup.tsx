import { Folder, Calendar, FileText, Hash, X } from "lucide-react"
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
  
  if (!category || !isOpen) return null

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-400">
          <div className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-green-500" />
            <h2 className="text-lg font-semibold">
              {t('categories.categoryDetails.title', 'Category Details')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
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
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {t('categories.categoryDetails.badges.category', 'Category')}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-gray-800 border border-gray-300">
                    {t('categories.categoryDetails.badges.id', 'ID: {{id}}', { id: category._id.slice(-8) })}
                  </span>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Information */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  {t('categories.categoryDetails.sections.basicInfo', 'Basic Information')}
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      {t('categories.categoryDetails.header.name', 'Category Name')}
                    </label>
                    <p className="text-gray-900">{category.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      {t('categories.categoryDetails.header.icon', 'Icon')}
                    </label>
                    <p className="text-gray-900 text-2xl">{category.icon}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      {t('categories.categoryDetails.header.categoryId', 'Category ID')}
                    </label>
                    <p className="text-gray-900 font-mono text-sm break-all">{category._id}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Hash className="h-4 w-4 text-gray-500" />
                  {t('categories.categoryDetails.sections.description', 'Description')}
                </h4>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    {t('categories.categoryDetails.labels.fullDescription', 'Full Description')}
                  </label>
                  <p className="text-gray-900 text-sm mt-1 bg-gray-50 p-3 rounded-md whitespace-normal break-words">
                    {category.description}
                  </p>
                </div>
              </div>

              {/* Timestamps */}
              {(category.createdAt || category.updatedAt) && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    {t('categories.categoryDetails.sections.timestamps', 'Timestamps')}
                  </h4>
                  <div className="space-y-2">
                    {category.createdAt && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          {t('categories.categoryDetails.labels.created', 'Created')}
                        </label>
                        <p className="text-gray-900 text-sm">{formatDate(category.createdAt)}</p>
                      </div>
                    )}
                    {category.updatedAt && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          {t('categories.categoryDetails.labels.lastUpdated', 'Last Updated')}
                        </label>
                        <p className="text-gray-900 text-sm">{formatDate(category.updatedAt)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Additional Information */}
            <div className="border-t border-slate-400 pt-4">
              <h4 className="font-medium text-gray-900 mb-2">
                {t('categories.categoryDetails.sections.usage', 'Category Usage')}
              </h4>
              <div className="text-gray-600 text-sm whitespace-normal break-words leading-relaxed max-w-full overflow-auto flex flex-wrap word-break-words w-full h-[120px]">
                {t('categories.categoryDetails.usageDescription')}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center p-6 border-t border-slate-400">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            {t('categories.categoryDetails.actions.close', 'Close')}
          </button>
          
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={handleEdit}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                {t('categories.categoryDetails.actions.editCategory', 'Edit Category')}
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                {t('categories.categoryDetails.actions.deleteCategory', 'Delete Category')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoryDetailsPopup