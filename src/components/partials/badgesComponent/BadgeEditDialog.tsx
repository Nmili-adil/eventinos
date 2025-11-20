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
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTranslation } from "react-i18next"
import { FileUpload } from "@/components/partials/eventsComponents/FileUpload"

interface Badge {
  _id: string
  name: string
  description: string
  design: string
  image: string
}

interface BadgeEditDialogProps {
  badge: Badge | null
  isOpen: boolean
  onClose: () => void
  onSave: (badgeId: string, data: Partial<Badge>) => Promise<void>
  isLoading?: boolean
}

interface BadgeFormData {
  name: string
  description: string
  design: string
  image: string
}

const BadgeEditDialog = ({
  badge,
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}: BadgeEditDialogProps) => {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<BadgeFormData>({
    defaultValues: {
      name: '',
      description: '',
      design: '',
      image: '',
    },
  })

  const design = watch('design')

  useEffect(() => {
    if (badge && isOpen) {
      reset({
        name: badge.name || '',
        description: badge.description || '',
        design: badge.design || '',
        image: badge.image || '',
      })
    }
  }, [badge, isOpen, reset])

  const onSubmit = async (data: BadgeFormData) => {
    if (!badge) return
    
    try {
      await onSave(badge._id, data)
      onClose()
    } catch (error) {
      console.error('Failed to update badge:', error)
    }
  }

  if (!badge) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{t('badges.editBadge')}</DialogTitle>
          <DialogDescription>
            {t('badges.editDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('badges.fields.name')} *</Label>
                  <Input
                    id="name"
                    {...register('name', { required: t('badges.validation.nameRequired') })}
                    placeholder={t('badges.fields.namePlaceholder')}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t('badges.fields.description')} *</Label>
                  <Textarea
                    id="description"
                    {...register('description', { required: t('badges.validation.descriptionRequired') })}
                    placeholder={t('badges.fields.descriptionPlaceholder')}
                    className="min-h-[100px]"
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="design">{t('badges.fields.design')} *</Label>
                  <Select
                    value={design}
                    onValueChange={(value) => setValue('design', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('badges.fields.designPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gold">{t('badges.designOptions.gold')}</SelectItem>
                      <SelectItem value="silver">{t('badges.designOptions.silver')}</SelectItem>
                      <SelectItem value="bronze">{t('badges.designOptions.bronze')}</SelectItem>
                      <SelectItem value="platinum">{t('badges.designOptions.platinum')}</SelectItem>
                      <SelectItem value="diamond">{t('badges.designOptions.diamond')}</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.design && (
                    <p className="text-sm text-destructive">{errors.design.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">{t('badges.fields.image')}</Label>
                  <FileUpload
                    onUploadComplete={(url) => setValue('image', url, { shouldDirty: true })}
                    currentUrl={watch('image')}
                    label={t('badges.fields.uploadLabel')}
                    accept="image/*"
                    disabled={isLoading}
                  />
                  <Input
                    id="image"
                    type="url"
                    {...register('image')}
                    placeholder={t('badges.fields.imagePlaceholder')}
                  />
                  {errors.image && (
                    <p className="text-sm text-destructive">{errors.image.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {t('badges.fields.imageHint')}
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
                  {t('badges.buttons.saving')}
                </>
              ) : (
                t('badges.buttons.save')
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default BadgeEditDialog

