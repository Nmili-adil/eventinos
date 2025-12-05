import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import CategoryDetailsPopup from './CategoryDetailsPopup'
import { Eye, Edit, Trash2, Folder } from 'lucide-react'
import DeleteConfirmationDialog from '@/components/shared/DeleteConfirmationDialog'

interface Category {
  _id: string
  name: string
  description: string
  icon: string
  createdAt?: string
  updatedAt?: string
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

interface CategoriesTableProps {
  data: Category[]
  pagination?: PaginationInfo
  onPageChange?: (page: number) => void
  onEdit?: (category: Category) => void
  onDelete?: (category: Category) => void
}

const CategoriesTable = ({ data, pagination, onPageChange, onEdit, onDelete }: CategoriesTableProps) => {
  const { t } = useTranslation()
  const [categories, setCategories] = useState<Category[]>(data)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleView = (category: Category) => {
    setSelectedCategory(category)
    setIsPopupOpen(true)
  }

  const handleEdit = (category: Category) => {
    console.log('Edit category:', category)
    onEdit?.(category)
  }

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return

    setIsDeleting(true)
    try {
      // Call the parent's delete handler
      await onDelete?.(categoryToDelete)
      
      // Remove from local state
      setCategories(categories.filter(cat => cat._id !== categoryToDelete._id))
      
      // Close dialog
      setIsDeleteDialogOpen(false)
      setCategoryToDelete(null)
    } catch (error) {
      console.error('Error deleting category:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false)
    setCategoryToDelete(null)
  }

  const handleClosePopup = () => {
    setIsPopupOpen(false)
    setSelectedCategory(null)
  }

  // Generate pagination items (same as badges)
  const generatePaginationItems = () => {
    if (!pagination) return null

    const { currentPage, totalPages } = pagination
    const items = []

    // Always show first page
    items.push(
      <PaginationItem key={1}>
        <PaginationLink
          isActive={currentPage === 1}
          onClick={() => onPageChange?.(1)}
        >
          1
        </PaginationLink>
      </PaginationItem>
    )

    // Show ellipsis if needed before current page
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>
      )
    }

    // Show pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i !== 1 && i !== totalPages) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={currentPage === i}
              onClick={() => onPageChange?.(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        )
      }
    }

    // Show ellipsis if needed after current page
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>
      )
    }

    // Always show last page if there is more than one page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            isActive={currentPage === totalPages}
            onClick={() => onPageChange?.(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      )
    }

    return items
  }

  return (
    <>
      <div className="space-y-4">
        <div className="border rounded-lg border-slate-300">
          <Table className='divide-slate-300'>
            <TableHeader>
              <TableRow>
                <TableHead>{t('categories.table.id')}</TableHead>
                <TableHead>{t('categories.table.icon')}</TableHead>
                <TableHead>{t('categories.table.name')}</TableHead>
                <TableHead>{t('categories.table.description')}</TableHead>
                <TableHead className="text-right">{t('categories.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className='divide-slate-300  max-h-[calc(70vh-300px)] overflow-y-auto'>
              
              {categories.map((category) => (
                <TableRow key={category._id}>
                  <TableCell>
                    <span className="text-xs text-gray-500 font-mono">{category._id.slice(-8)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-2xl">{category.icon}</span>
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                      {category.description}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleView(category)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteClick(category)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {t('categories.table.showing', {
                from: ((pagination.currentPage - 1) * pagination.pageSize) + 1,
                to: Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems),
                total: pagination.totalItems
              })}
            </div>
            
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => onPageChange?.(pagination.currentPage - 1)}
                    className={!pagination.hasPreviousPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {generatePaginationItems()}
                
                <PaginationItem>
                  <PaginationNext
                    onClick={() => onPageChange?.(pagination.currentPage + 1)}
                    className={!pagination.hasNextPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* Category Details Popup */}
      <CategoryDetailsPopup
        category={selectedCategory}
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        onEdit={onEdit}
        onDelete={handleDeleteClick}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={t('categories.deleteDialog.title')}
        description={t('categories.deleteDialog.description')}
        itemName={categoryToDelete?.name || ''}
        isLoading={isDeleting}
      />
    </>
  )
}

export default CategoriesTable