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
import { Edit, Trash2 } from 'lucide-react'
import DeleteConfirmationDialog from '@/components/shared/DeleteConfirmationDialog'
import type { SponsorCategory, SponsorCategoryPagination } from '@/types/sponsorCategoriesTypes'
import { MembersPagination } from '@/components/partials/membersComponents/MembersPagination'

interface SponsorCategoriesTableProps {
  data: SponsorCategory[]
  pagination?: SponsorCategoryPagination | null
  onPageChange?: (page: number) => void
  onEdit?: (category: SponsorCategory) => void
  onDelete?: (category: SponsorCategory) => Promise<void>
}

const SponsorCategoriesTable = ({ data, pagination, onPageChange, onEdit, onDelete }: SponsorCategoriesTableProps) => {
  const { t } = useTranslation()
  const [categoryToDelete, setCategoryToDelete] = useState<SponsorCategory | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteClick = (category: SponsorCategory) => {
    setCategoryToDelete(category)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return
    setIsDeleting(true)
    try {
      await onDelete?.(categoryToDelete)
      setIsDeleteDialogOpen(false)
      setCategoryToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false)
    setCategoryToDelete(null)
  }

  return (
    <>
      <div className="space-y-4">
        <div className="border rounded-lg border-slate-300">
          <Table className="divide-slate-300">
            <TableHeader>
              <TableRow>
                <TableHead>{t('sponsorCategories.table.id', 'ID')}</TableHead>
                <TableHead>{t('sponsorCategories.table.name', 'Name')}</TableHead>
                <TableHead className="text-right">{t('sponsorCategories.table.actions', 'Actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-slate-300">
              {data.map((category) => (
                <TableRow key={category._id}>
                  <TableCell>
                    <span className="text-xs text-gray-500 font-mono">{category._id.slice(-8)}</span>
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit?.(category)}
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

        <MembersPagination
          pagination={pagination ?? null}
          onPageChange={(page) => onPageChange?.(page)}
          entityLabel={t('sponsorCategories.title', 'sponsor categories')}
        />
      </div>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={t('sponsorCategories.deleteDialog.title', 'Delete Sponsor Category')}
        description={t('sponsorCategories.deleteDialog.description', 'Are you sure you want to delete this sponsor category? This will permanently remove it.')}
        itemName={categoryToDelete?.name || ''}
        isLoading={isDeleting}
      />
    </>
  )
}

export default SponsorCategoriesTable
