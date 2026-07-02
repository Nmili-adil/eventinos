import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Award, Plus, Search, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import PageHead from '@/components/shared/page-head'
import SponsorCategoriesTable from '@/components/partials/sponsorCategoriesComponent/SponsorCategoriesTable'
import SponsorCategoryAddDialog from '@/components/partials/sponsorCategoriesComponent/SponsorCategoryAddDialog'
import SponsorCategoryEditDialog from '@/components/partials/sponsorCategoriesComponent/SponsorCategoryEditDialog'
import { handleAsyncError } from '@/hooks/useGlobalErrorHandler'
import type { RootState } from '@/store/app/rootReducer'
import type { AppDispatch } from '@/store/app/store'
import type { SponsorCategory } from '@/types/sponsorCategoriesTypes'
import {
  fetchSponsorCategoriesRequest,
  createSponsorCategoryRequest,
  updateSponsorCategoryRequest,
  deleteSponsorCategoryRequest,
} from '@/store/features/sponsorCategories/sponsorCategories.actions'
import { exportSponsorCategoriesApi } from '@/api/sponsorCategoriesApi'

const SponsorCategoriesPage = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { sponsorCategories, pagination, isLoading, isCreating, isUpdating } = useSelector(
    (state: RootState) => state.sponsorCategories
  )

  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [categoryToEdit, setCategoryToEdit] = useState<SponsorCategory | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    dispatch(fetchSponsorCategoriesRequest(currentPage, 10, undefined, search || undefined))
  }, [dispatch, currentPage, search])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handleCreate = async (data: { name: string }) => {
    try {
      await dispatch(createSponsorCategoryRequest(data))
      toast.success(t('sponsorCategories.createdSuccessfully', 'Sponsor category created successfully'))
    } catch (error) {
      handleAsyncError(error, t('sponsorCategories.createFailed', 'Failed to create sponsor category'))
      throw error
    }
  }

  const handleEditClick = (category: SponsorCategory) => {
    setCategoryToEdit(category)
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async (id: string, data: { name: string }) => {
    try {
      await dispatch(updateSponsorCategoryRequest(id, data))
      toast.success(t('sponsorCategories.updatedSuccessfully', 'Sponsor category updated successfully'))
    } catch (error) {
      handleAsyncError(error, t('sponsorCategories.updateFailed', 'Failed to update sponsor category'))
      throw error
    }
  }

  const handleDelete = async (category: SponsorCategory) => {
    try {
      await dispatch(deleteSponsorCategoryRequest(category._id))
      toast.success(t('sponsorCategories.deletedSuccessfully', 'Sponsor category deleted successfully'))
    } catch (error) {
      handleAsyncError(error, t('sponsorCategories.deleteFailed', 'Failed to delete sponsor category'))
      throw error
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await exportSponsorCategoriesApi()
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'categories_sponsor.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      handleAsyncError(error, t('sponsorCategories.exportFailed', 'Failed to export sponsor categories'))
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div>
      <PageHead
        title={t('sponsorCategories.title', 'Sponsor Categories')}
        icon={Award}
        description={t('sponsorCategories.manageCategories', 'Manage your organizer sponsor categories')}
        total={pagination?.totalItems || 0}
      />

      <Card className="border-slate-300">
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pl-9"
                value={search}
                onChange={(e) => {
                  setCurrentPage(1)
                  setSearch(e.target.value)
                }}
                placeholder={t('sponsorCategories.searchPlaceholder', 'Search sponsor categories by name')}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport} disabled={isExporting}>
                <Download className="h-4 w-4 mr-2" />
                {isExporting
                  ? t('sponsorCategories.buttons.exporting', 'Exporting...')
                  : t('sponsorCategories.buttons.export', 'Export')}
              </Button>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('sponsorCategories.addCategory', 'Add Category')}
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-sm text-gray-500">
              {t('sponsorCategories.loading', 'Loading sponsor categories...')}
            </div>
          ) : sponsorCategories.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500">
              {t('sponsorCategories.noCategoriesFound', 'No sponsor categories found')}
            </div>
          ) : (
            <SponsorCategoriesTable
              data={sponsorCategories}
              pagination={pagination}
              onPageChange={handlePageChange}
              onEdit={handleEditClick}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      <SponsorCategoryAddDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={handleCreate}
        isLoading={isCreating}
      />

      <SponsorCategoryEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        category={categoryToEdit}
        onSave={handleUpdate}
        isLoading={isUpdating}
      />
    </div>
  )
}

export default SponsorCategoriesPage
