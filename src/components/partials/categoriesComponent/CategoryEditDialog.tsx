import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useTranslation } from "react-i18next"

interface Category {
  _id: string
  name: string
  description: string
  icon: string
}

interface CategoryEditDialogProps {
  category: Category | null
  isOpen: boolean
  onClose: () => void
  onSave: (categoryId: string, data: Partial<Category>) => Promise<void>
  isLoading?: boolean
}

interface CategoryFormData {
  name: string
  description: string
  icon: string
}

const CategoryEditDialog = ({
  category,
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}: CategoryEditDialogProps) => {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CategoryFormData>({
    defaultValues: {
      name: '',
      description: '',
      icon: '',
    },
  })

  useEffect(() => {
    if (category && isOpen) {
      reset({
        name: category.name || '',
        description: category.description || '',
        icon: category.icon || '',
      })
    }
  }, [category, isOpen, reset])

  const iconValue = watch('icon')

  const emojiOptions = useMemo(
    () => ['📁', '🎉', '⭐', '🔥', '💡', '🚀', '🎯', '🛠️', '🎓', '🤝', '💼', '🏆'],
    []
  )

  const handleEmojiSelect = (emoji: string) => {
    setValue('icon', emoji, { shouldDirty: true, shouldValidate: true })
  }

  const onSubmit = async (data: CategoryFormData) => {
    if (!category) return
    
    try {
      await onSave(category._id, data)
      onClose()
    } catch (error) {
      console.error('Failed to update category:', error)
    }
  }

  if (!category) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] border-slate-300">
        <DialogHeader>
          <DialogTitle className="text-2xl">{t('categories.editCategory')}</DialogTitle>
          <DialogDescription>
            {t('categories.editDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('categories.categoryName')} *</Label>
                  <Input
                    id="name"
                    {...register('name', { required: t('categories.categoryNameRequired') })}
                    placeholder={t('categories.enterCategoryName')}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t('categories.categoryDescription')} *</Label>
                  <Textarea
                    id="description"
                    {...register('description', { required: t('categories.descriptionRequired') })}
                    placeholder={t('categories.enterDescription')}
                    className="min-h-[100px]"
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon">{t('categories.icon')} *</Label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Input
                        id="icon"
                        {...register('icon', { required: t('categories.iconRequired') })}
                        placeholder={t('categories.enterIcon')}
                        maxLength={3}
                      />
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button type="button" variant="outline" size="sm" disabled={isLoading}>
                            {t('categories.emojiPicker.button')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64">
                          <p className="text-xs text-muted-foreground mb-2">
                            {t('categories.emojiPicker.hint')}
                          </p>
                          <div className="grid grid-cols-6 gap-2">
                            {emojiOptions.map((emoji) => (
                              <button
                                type="button"
                                key={emoji}
                                onClick={() => handleEmojiSelect(emoji)}
                                className="text-xl hover:scale-110 transition-transform"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    {iconValue && (
                      <p className="text-sm">
                        {t('categories.emojiPicker.selected')}: <span className="text-xl">{iconValue}</span>
                      </p>
                    )}
                  </div>
                  {errors.icon && (
                    <p className="text-sm text-destructive">{errors.icon.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {t('categories.iconHint')}
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {t('common.updating')}
                </>
              ) : (
                t('common.save')
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CategoryEditDialog

