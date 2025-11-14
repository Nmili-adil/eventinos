import { useState, useEffect } from "react"
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

interface CategoryAddDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => Promise<void>
  isLoading?: boolean
}

interface CategoryFormData {
  name: string
  description: string
  icon: string
}

const CategoryAddDialog = ({
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}: CategoryAddDialogProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CategoryFormData>({
    defaultValues: {
      name: '',
      description: '',
      icon: '',
    },
  })

  useEffect(() => {
    if (isOpen) {
      reset({
        name: '',
        description: '',
        icon: '',
      })
    }
  }, [isOpen, reset])

  const onSubmit = async (data: CategoryFormData) => {
    try {
      await onSave(data)
      reset()
      onClose()
    } catch (error) {
      console.error('Failed to create category:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Category</DialogTitle>
          <DialogDescription>
            Add a new category to organize your content. All fields are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name *</Label>
                  <Input
                    id="name"
                    {...register('name', { required: 'Category name is required' })}
                    placeholder="Enter category name"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    {...register('description', { required: 'Description is required' })}
                    placeholder="Enter category description"
                    className="min-h-[100px]"
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon">Icon (Emoji) *</Label>
                  <Input
                    id="icon"
                    {...register('icon', { required: 'Icon is required' })}
                    placeholder="Enter emoji icon (e.g., 📁, 🎉, ⭐)"
                    maxLength={2}
                  />
                  {errors.icon && (
                    <p className="text-sm text-destructive">{errors.icon.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Use a single emoji character to represent this category
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Category'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CategoryAddDialog

