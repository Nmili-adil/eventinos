import { Trash2, AlertTriangle, X } from "lucide-react"
import { useTranslation } from "react-i18next"

interface DeleteConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  itemName: string
  isLoading?: boolean
}

const DeleteConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  isLoading = false
}: DeleteConfirmationDialogProps) => {
  const { t } = useTranslation()
  
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">

        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-slate-300">
          <div className="rounded-full bg-red-100 p-2 flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 flex-1">
            {title}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">

          {/* FIXED WRAPPING */}
          <div className="w-full block">
            <p className="text-gray-600 mb-4 break-words whitespace-normal overflow-wrap-anywhere max-w-full">
              {description}
            </p>
          </div>

          <div className="flex flex-col space-y-2">
            <span className="font-semibold text-gray-900 text-sm">
              {itemName}
            </span>
            <p className="text-red-600 text-sm">
              {t('deleteConfirmation.cannotUndo', 'This action cannot be undone.')}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-slate-300">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('deleteConfirmation.cancel', 'Cancel')}
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {t('deleteConfirmation.deleting', 'Deleting...')}
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                {t('deleteConfirmation.delete', 'Delete')}
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  )
}

export default DeleteConfirmationDialog
