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

interface AddAccountDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => Promise<void>
  isLoading?: boolean
}

interface AccountFormData {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  city: string
  country: string
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  password: string
  user: 'Organizer' | 'Member'
  isActive: boolean
  company?: {
    name: string
    jobTitle: string
    size: string
    industry: string
  }
}

const AddAccountDialog = ({
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}: AddAccountDialogProps) => {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<AccountFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      city: '',
      country: '',
      gender: 'MALE',
      password: '',
      user: 'Member',
      isActive: true,
      company: {
        name: '',
        jobTitle: '',
        size: '',
        industry: '',
      },
    },
  })

  const userType = watch('user')
  const isOrganizer = userType === 'Organizer'

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
        user: 'Member',
        isActive: true,
        company: {
          name: '',
          jobTitle: '',
          size: '',
          industry: '',
        },
      })
    }
  }, [isOpen, reset])

  const onSubmit = async (data: AccountFormData) => {
    console.log();
    
    try {
      const submitData: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber || undefined,
        city: data.city || undefined,
        country: data.country || undefined,
        gender: data.gender,
        password: data.password,
        user: data.user,
        isActive: data.isActive,
      }

      // Only include company if user is Organizer
      if (isOrganizer && data.company) {
        submitData.company = {
          name: data.company.name || undefined,
          jobTitle: data.company.jobTitle || undefined,
          size: data.company.size || undefined,
          industry: data.company.industry || undefined,
        }
      }

      await onSave(submitData)
      reset()
      onClose()
    } catch (error) {
      console.error('Failed to create account:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl border-slate-300 max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Add New Account
          </DialogTitle>
          <DialogDescription>
            Create a new user account. All required fields must be filled.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <ScrollArea className="max-h-[calc(90vh-200px)] pr-4 overflow-y-auto">
            <div className="space-y-6">
              {/* Account Type */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">
                  Account Type
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="user">
                      User Type *
                    </Label>
                    <Select
                      value={userType}
                      onValueChange={(value) => setValue('user', value as 'Organizer' | 'Member')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select user type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Organizer">Organizer</SelectItem>
                        <SelectItem value="Member">Member</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="isActive">
                      Account Status
                    </Label>
                    <Select
                      value={watch('isActive') ? 'active' : 'inactive'}
                      onValueChange={(value) => setValue('isActive', value === 'active')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Personal Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      {...register('firstName', { 
                        required: 'This field is required' 
                      })}
                      placeholder="Enter first name"
                    />
                    {errors.firstName && (
                      <p className="text-sm text-destructive">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      {...register('lastName', { 
                        required: 'This field is required' 
                      })}
                      placeholder="Enter last name"
                    />
                    {errors.lastName && (
                      <p className="text-sm text-destructive">{errors.lastName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">
                      Gender
                    </Label>
                    <Select
                      value={watch('gender')}
                      onValueChange={(value) => setValue('gender', value as 'MALE' | 'FEMALE' | 'OTHER')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Contact Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email', {
                        required: 'This field is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      placeholder="Enter email address"
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">
                      Phone Number
                    </Label>
                    <Input
                      id="phoneNumber"
                      {...register('phoneNumber')}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Location Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">
                  Location Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">
                      City
                    </Label>
                    <Input
                      id="city"
                      {...register('city')}
                      placeholder="Enter city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">
                      Country
                    </Label>
                    <Input
                      id="country"
                      {...register('country')}
                      placeholder="Enter country"
                    />
                  </div>
                </div>
              </div>

              {/* Company Information - Only for Organizers */}
              {isOrganizer && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">
                      Company Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">
                          Company Name
                        </Label>
                        <Input
                          id="companyName"
                          {...register('company.name')}
                          placeholder="Enter company name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="jobTitle">
                          Job Title
                        </Label>
                        <Input
                          id="jobTitle"
                          {...register('company.jobTitle')}
                          placeholder="Enter job title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companySize">
                          Company Size
                        </Label>
                        <Select
                          value={watch('company.size')}
                          onValueChange={(value) => setValue('company.size', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select company size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-10">1-10</SelectItem>
                            <SelectItem value="11-50">11-50</SelectItem>
                            <SelectItem value="51-200">51-200</SelectItem>
                            <SelectItem value="201-500">201-500</SelectItem>
                            <SelectItem value="501-1000">501-1000</SelectItem>
                            <SelectItem value="1000+">1000+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="industry">
                          Industry
                        </Label>
                        <Input
                          id="industry"
                          {...register('company.industry')}
                          placeholder="Enter industry"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Account Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">
                  Account Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Password *
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      {...register('password', {
                        required: 'This field is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters',
                        },
                      })}
                      placeholder="Enter password"
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Actions */}
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
                'Create Account'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddAccountDialog

