import { useEffect } from "react"
import { useForm } from "react-hook-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslation } from "react-i18next"

interface SponsorCategoryAddDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { name: string }) => Promise<void>
  isLoading?: boolean
}

interface SponsorCategoryFormData {
  name: string
}

const SponsorCategoryAddDialog = ({
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}: SponsorCategoryAddDialogProps) => {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SponsorCategoryFormData>({
    defaultValues: { name: '' },
  })

  useEffect(() => {
    if (isOpen) {
      reset({ name: '' })
    }
  }, [isOpen, reset])

  const onSubmit = async (data: SponsorCategoryFormData) => {
    await onSave(data)
    reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-slate-300">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {t('sponsorCategories.addCategory', 'Add Sponsor Category')}
          </DialogTitle>
          <DialogDescription>
            {t('sponsorCategories.addDescription', 'Create a new sponsor category for your events.')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="name">
              {t('sponsorCategories.categoryName', 'Category Name')} *
            </Label>
            <Input
              id="name"
              {...register('name', {
                required: t('sponsorCategories.categoryNameRequired', 'Category name is required'),
              })}
              placeholder={t('sponsorCategories.enterCategoryName', 'Enter category name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              {t('sponsorCategories.buttons.cancel', 'Cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {t('sponsorCategories.buttons.creating', 'Creating...')}
                </>
              ) : (
                t('sponsorCategories.buttons.create', 'Create Category')
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default SponsorCategoryAddDialog
