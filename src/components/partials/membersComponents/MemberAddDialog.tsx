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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useTranslation } from "react-i18next"

interface MemberAddDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => Promise<void>
  isLoading?: boolean
}

interface MemberFormData {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  city: string
  country: string
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  password: string
  isActive: boolean
}

const MemberAddDialog = ({
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}: MemberAddDialogProps) => {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<MemberFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      city: '',
      country: '',
      gender: 'MALE',
      password: '',
      isActive: true,
    },
  })

  const isActive = watch('isActive')

  useEffect(() => {
    if (isOpen) {
      reset({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        city: '',
        country: '',
        gender: 'MALE',
        password: '',
        isActive: true,
      })
    }
  }, [isOpen, reset])

  const onSubmit = async (data: MemberFormData) => {
    try {
      await onSave(data)
      reset()
      onClose()
    } catch (error) {
      console.error('Failed to create member:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl border-slate-300 max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {t('members.addDialog.title', 'Add New Member')}
          </DialogTitle>
          <DialogDescription>
            {t('members.addDialog.description', 'Create a new member account. All required fields must be filled.')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">
                  {t('members.addDialog.sections.personalInfo', 'Personal Information')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      {t('members.addDialog.fields.firstName', 'First Name')} *
                    </Label>
                    <Input
                      id="firstName"
                      {...register('firstName', { 
                        required: t('members.addDialog.validation.required', 'This field is required') 
                      })}
                      placeholder={t('members.addDialog.placeholders.enterFirstName', 'Enter first name')}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-destructive">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      {t('members.addDialog.fields.lastName', 'Last Name')} *
                    </Label>
                    <Input
                      id="lastName"
                      {...register('lastName', { 
                        required: t('members.addDialog.validation.required', 'This field is required') 
                      })}
                      placeholder={t('members.addDialog.placeholders.enterLastName', 'Enter last name')}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-destructive">{errors.lastName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">
                      {t('members.addDialog.fields.gender', 'Gender')}
                    </Label>
                    <Select
                      value={watch('gender')}
                      onValueChange={(value) => setValue('gender', value as 'MALE' | 'FEMALE' | 'OTHER')}
                    >
                      <SelectTrigger>
                        <SelectValue 
                          placeholder={t('members.addDialog.placeholders.selectGender', 'Select gender')} 
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">
                          {t('members.addDialog.genderOptions.male', 'Male')}
                        </SelectItem>
                        <SelectItem value="FEMALE">
                          {t('members.addDialog.genderOptions.female', 'Female')}
                        </SelectItem>
                        <SelectItem value="OTHER">
                          {t('members.addDialog.genderOptions.other', 'Other')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Contact Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">
                  {t('members.addDialog.sections.contactInfo', 'Contact Information')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      {t('members.addDialog.fields.email', 'Email Address')} *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email', {
                        required: t('members.addDialog.validation.required', 'This field is required'),
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: t('members.addDialog.validation.invalidEmail', 'Invalid email address'),
                        },
                      })}
                      placeholder={t('members.addDialog.placeholders.enterEmail', 'Enter email address')}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">
                      {t('members.addDialog.fields.phoneNumber', 'Phone Number')}
                    </Label>
                    <Input
                      id="phoneNumber"
                      {...register('phoneNumber')}
                      placeholder={t('members.addDialog.placeholders.enterPhone', 'Enter phone number')}
                    />
                    {errors.phoneNumber && (
                      <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Location Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">
                  {t('members.addDialog.sections.locationInfo', 'Location Information')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">
                      {t('members.addDialog.fields.city', 'City')}
                    </Label>
                    <Input
                      id="city"
                      {...register('city')}
                      placeholder={t('members.addDialog.placeholders.enterCity', 'Enter city')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">
                      {t('members.addDialog.fields.country', 'Country')}
                    </Label>
                    <Input
                      id="country"
                      {...register('country')}
                      placeholder={t('members.addDialog.placeholders.enterCountry', 'Enter country')}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Account Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">
                  {t('members.addDialog.sections.accountInfo', 'Account Information')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      {t('members.addDialog.fields.password', 'Password')} *
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      {...register('password', {
                        required: t('members.addDialog.validation.required', 'This field is required'),
                        minLength: {
                          value: 6,
                          message: t('members.addDialog.validation.passwordMinLength', 'Password must be at least 6 characters'),
                        },
                      })}
                      placeholder={t('members.addDialog.placeholders.enterPassword', 'Enter password')}
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="isActive">
                      {t('members.addDialog.fields.accountStatus', 'Account Status')}
                    </Label>
                    <Select
                      value={isActive ? 'active' : 'inactive'}
                      onValueChange={(value) => setValue('isActive', value === 'active')}
                    >
                      <SelectTrigger>
                        <SelectValue 
                          placeholder={t('members.addDialog.placeholders.selectStatus', 'Select status')} 
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">
                          {t('members.addDialog.statusOptions.active', 'Active')}
                        </SelectItem>
                        <SelectItem value="inactive">
                          {t('members.addDialog.statusOptions.inactive', 'Inactive')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              {t('members.addDialog.buttons.cancel', 'Cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {t('members.addDialog.buttons.creating', 'Creating...')}
                </>
              ) : (
                t('members.addDialog.buttons.create', 'Create Member')
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default MemberAddDialog