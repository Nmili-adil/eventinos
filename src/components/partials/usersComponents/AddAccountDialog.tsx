import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import type { Industry } from "@/types/usersType"
import { rolesApi } from "@/api/roleApi"
import { createOrganizerApi } from "@/api/organizerApi"
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
import { Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

interface Role {
  _id: string
  name: string
}

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
  password: string
  phoneNumber: string
  city: string
  country: string
  gender: 'MALE' | 'FEMALE'
  role: string
  isActive: boolean
  company?: {
    name: string
    jobTitle: string
    size: string
    industry: Industry
  }
  socialNetworks?: {
    facebook: string
    instagram: string
    linkedin: string
    website: string
  }
}

const AddAccountDialog = ({
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}: AddAccountDialogProps) => {
  const { t } = useTranslation()
  const [roles, setRoles] = useState<Role[]>([])
  const [rolesLoading, setRolesLoading] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [internalLoading, setInternalLoading] = useState(false)
  
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
      password: '',
      phoneNumber: '',
      city: '',
      country: '',
      gender: 'MALE',
      role: '',
      isActive: true,
      company: {
        name: '',
        jobTitle: '',
        size: '',
        industry: '' as Industry,
      },
      socialNetworks: {
        facebook: '',
        instagram: '',
        linkedin: '',
        website: '',
      },
    },
  })

  // Fetch roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setRolesLoading(true)
        const response = await rolesApi()
     
        const rolesData = Array.isArray(response?.data) 
          ? response.data 
          : Array.isArray(response?.data?.data) 
            ? response.data.data 
            : []
        
        setRoles(rolesData.filter((r: Role) => r.name.toLowerCase() !== 'user' && r.name.toLowerCase() !== 'member' && r.name.toLowerCase() !== 'moderator'))
        if (rolesData.length > 0) {
          const defaultRole = rolesData.find((r: Role) => r.name.toLowerCase() !== 'user' && r.name.toLowerCase() !== 'member' && r.name.toLowerCase() !== 'moderator') || rolesData[0]
          setValue('role', defaultRole._id)
        }
      } catch (error) {
        console.error('Failed to fetch roles:', error)
        setRoles([])
      } finally {
        setRolesLoading(false)
      }
    }
    fetchRoles()
  }, [])

  const selectedRoleId = watch('role')
  const selectedRole = Array.isArray(roles) ? roles.find(r => r._id === selectedRoleId) : undefined
  const isOrganizer = selectedRole?.name.toLowerCase() === 'organizer'

  useEffect(() => {
    if (isOpen && roles.length > 0) {
      const defaultRole = roles.find((r: Role) => r.name.toLowerCase() === 'user') || roles[0]
      reset({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phoneNumber: '',
        city: '',
        country: '',
        gender: 'MALE',
        role: defaultRole._id,
        isActive: true,
        company: {
          name: '',
          jobTitle: '',
          size: '',
          industry: '' as Industry,
        },
        socialNetworks: {
          facebook: '',
          instagram: '',
          linkedin: '',
          website: '',
        },
      })
      setShowPassword(false)
    }
  }, [isOpen, reset, roles])

  const onSubmit = async (data: AccountFormData) => {
    try {
      setInternalLoading(true)
      const submitData: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phoneNumber: data.phoneNumber || undefined,
        city: data.city || undefined,
        country: data.country || undefined,
        gender: data.gender,
        isActive: data.isActive,
        registrationCompleted: true,
      }

      if (isOrganizer) {
        // Add company info for organizers
        if (data.company) {
          submitData.company = {
            name: data.company.name || undefined,
            jobTitle: data.company.jobTitle || undefined,
            size: data.company.size || undefined,
            industry: data.company.industry || undefined,
          }
        }
        // Add social networks if provided
        if (data.socialNetworks) {
          const hasSocialNetworks = Object.values(data.socialNetworks).some(v => v)
          if (hasSocialNetworks) {
            submitData.socialNetworks = {
              facebook: data.socialNetworks.facebook || undefined,
              instagram: data.socialNetworks.instagram || undefined,
              linkedin: data.socialNetworks.linkedin || undefined,
              website: data.socialNetworks.website || undefined,
            }
          }
        }
        // Use organizer API for organizers
        const response = await createOrganizerApi(submitData)
        if (response?.status === 200 || response?.status === 201) {
          toast.success(t('accounts.messages.createSuccess', 'Account created successfully'))
        }
      } else {
        // Add role for admin and use existing API
        submitData.role = data.role
        await onSave(submitData)
      }
      
      reset()
      onClose()
    } catch (error) {
      console.error('Failed to create account:', error)
      throw error
    } finally {
      setInternalLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-hidden border border-gray-300">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 pt-6 pb-3 border-b border-gray-200">
            <h2 className="text-xl font-semibold">
              {t('accounts.dialog.title', 'Add New Account')}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {t('accounts.dialog.description', 'Create a new user account. All required fields must be filled. A default password will be set automatically.')}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col">
            {/* Scrollable Content */}
            <div className="flex-1 px-6 py-4 overflow-y-auto max-h-[60vh]">
              <div className="space-y-6 pb-4">
                {/* Account Type */}
                <div className="space-y-3">
                  <h4 className="font-medium text-base">
                    {t('accounts.dialog.sections.accountType', 'Account Type')}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="role">
                        {t('accounts.dialog.fields.userType', 'User Type *')}
                      </Label>
                      <Select
                        value={selectedRoleId}
                        onValueChange={(value) => setValue('role', value)}
                        disabled={rolesLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={
                            rolesLoading 
                              ? t('accounts.dialog.loadingRoles', 'Loading roles...') 
                              : t('accounts.dialog.placeholders.userType', 'Select user type')
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role._id} value={role._id}>
                              {role.name.toLowerCase() === 'admin' ? t('accounts.dialog.options.userType.admin', 'Admin') : role.name.toLowerCase() === 'organizer' ? t('accounts.dialog.options.userType.organizer', 'Organizer') : role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="isActive">
                        {t('accounts.dialog.fields.status', 'Account Status')}
                      </Label>
                      <Select
                        value={watch('isActive') ? 'active' : 'inactive'}
                        onValueChange={(value) => setValue('isActive', value === 'active')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">{t('accounts.dialog.options.status.active', 'Active')}</SelectItem>
                          <SelectItem value="inactive">{t('accounts.dialog.options.status.inactive', 'Inactive')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200"></div>

                {/* Personal Information */}
                <div className="space-y-3">
                  <h4 className="font-medium text-base">
                    {t('accounts.dialog.sections.personalInfo', 'Personal Information')}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">
                        {t('accounts.dialog.fields.firstName', 'First Name *')}
                      </Label>
                      <Input
                        id="firstName"
                        type="text"
                        {...register('firstName', { 
                          required: 'This field is required' 
                        })}
                        placeholder={t('accounts.dialog.placeholders.firstName', 'Enter first name')}
                      />
                      {errors.firstName && (
                        <p className="text-xs text-red-600 mt-1">{errors.firstName.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">
                        {t('accounts.dialog.fields.lastName', 'Last Name *')}
                      </Label>
                      <Input
                        id="lastName"
                        type="text"
                        {...register('lastName', { 
                          required: 'This field is required' 
                        })}
                        placeholder={t('accounts.dialog.placeholders.lastName', 'Enter last name')}
                      />
                      {errors.lastName && (
                        <p className="text-xs text-red-600 mt-1">{errors.lastName.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">
                        {t('accounts.dialog.fields.gender', 'Gender')}
                      </Label>
                      <Select
                        value={watch('gender')}
                        onValueChange={(value) => setValue('gender', value as 'MALE' | 'FEMALE')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MALE">{t('accounts.dialog.options.gender.male', 'Male')}</SelectItem>
                          <SelectItem value="FEMALE">{t('accounts.dialog.options.gender.female', 'Female')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200"></div>

                {/* Contact Information */}
                <div className="space-y-3">
                  <h4 className="font-medium text-base">
                    {t('accounts.dialog.sections.contactInfo', 'Contact Information')}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        {t('accounts.dialog.fields.email', 'Email Address *')}
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
                        placeholder={t('accounts.dialog.placeholders.email', 'Enter email address')}
                      />
                      {errors.email && (
                        <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">
                        {t('accounts.dialog.fields.password', 'Password *')}
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          {...register('password', {
                            required: 'This field is required',
                            minLength: {
                              value: 6,
                              message: 'Password must be at least 6 characters',
                            },
                          })}
                          placeholder={t('accounts.dialog.placeholders.password', 'Enter password')}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">
                        {t('accounts.dialog.fields.phone', 'Phone Number')}
                      </Label>
                      <Input
                        id="phoneNumber"
                        type="text"
                        {...register('phoneNumber')}
                        placeholder={t('accounts.dialog.placeholders.phone', 'Enter phone number')}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200"></div>

                {/* Location Information */}
                <div className="space-y-3">
                  <h4 className="font-medium text-base">
                    {t('accounts.dialog.sections.locationInfo', 'Location Information')}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="city">
                        {t('accounts.dialog.fields.city', 'City')}
                      </Label>
                      <Input
                        id="city"
                        type="text"
                        {...register('city')}
                        placeholder={t('accounts.dialog.placeholders.city', 'Enter city')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">
                        {t('accounts.dialog.fields.country', 'Country')}
                      </Label>
                      <Input
                        id="country"
                        type="text"
                        {...register('country')}
                        placeholder={t('accounts.dialog.placeholders.country', 'Enter country')}
                      />
                    </div>
                  </div>
                </div>

                {/* Company Information - Only for Organizers */}
                {isOrganizer && (
                  <>
                    <div className="border-t border-gray-200"></div>
                    <div className="space-y-3">
                      <h4 className="font-medium text-base">
                        {t('accounts.dialog.sections.companyInfo', 'Company Information')}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="companyName">
                            {t('accounts.dialog.fields.companyName', 'Company Name')}
                          </Label>
                          <Input
                            id="companyName"
                            type="text"
                            {...register('company.name')}
                            placeholder={t('accounts.dialog.placeholders.companyName', 'Enter company name')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="jobTitle">
                            {t('accounts.dialog.fields.jobTitle', 'Job Title')}
                          </Label>
                          <Input
                            id="jobTitle"
                            type="text"
                            {...register('company.jobTitle')}
                            placeholder={t('accounts.dialog.placeholders.jobTitle', 'Enter job title')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="companySize">
                            {t('accounts.dialog.fields.companySize', 'Company Size')}
                          </Label>
                          <Select
                            value={watch('company.size')}
                            onValueChange={(value) => setValue('company.size', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t('accounts.dialog.placeholders.companySize', 'Select company size')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1-10">1-10</SelectItem>
                              <SelectItem value="OTHER">{t('accounts.companySize.other', 'Other')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="industry">
                            {t('accounts.dialog.fields.industry', 'Industry')}
                          </Label>
                          <Select
                            value={watch('company.industry')}
                            onValueChange={(value) => setValue('company.industry', value as Industry)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t('accounts.dialog.placeholders.industry', 'Select industry')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="COMPANY">{t('accounts.industries.company', 'Company')}</SelectItem>
                              <SelectItem value="STARTUP">{t('accounts.industries.startup', 'Startup')}</SelectItem>
                              <SelectItem value="ASSOCIATION">{t('accounts.industries.association', 'Association')}</SelectItem>
                              <SelectItem value="SCHOOL">{t('accounts.industries.school', 'School')}</SelectItem>
                              <SelectItem value="COMMUNICATION AGENCY">{t('accounts.industries.communicationAgency', 'Communication Agency')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200"></div>

                    {/* Social Networks Section */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-base">
                        {t('accounts.dialog.sections.socialNetworks', 'Social Networks')}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="facebook">
                            {t('accounts.dialog.fields.facebook', 'Facebook')}
                          </Label>
                          <Input
                            id="facebook"
                            type="url"
                            {...register('socialNetworks.facebook')}
                            placeholder={t('accounts.dialog.placeholders.facebook', 'https://facebook.com/...')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="instagram">
                            {t('accounts.dialog.fields.instagram', 'Instagram')}
                          </Label>
                          <Input
                            id="instagram"
                            type="url"
                            {...register('socialNetworks.instagram')}
                            placeholder={t('accounts.dialog.placeholders.instagram', 'https://instagram.com/...')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="linkedin">
                            {t('accounts.dialog.fields.linkedin', 'LinkedIn')}
                          </Label>
                          <Input
                            id="linkedin"
                            type="url"
                            {...register('socialNetworks.linkedin')}
                            placeholder={t('accounts.dialog.placeholders.linkedin', 'https://linkedin.com/in/...')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website">
                            {t('accounts.dialog.fields.website', 'Website')}
                          </Label>
                          <Input
                            id="website"
                            type="url"
                            {...register('socialNetworks.website')}
                            placeholder={t('accounts.dialog.placeholders.website', 'https://...')}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 px-6 pb-6">
              <Button 
                type="button" 
                onClick={onClose} 
                disabled={isLoading || internalLoading}
                variant="outline"
              >
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || internalLoading}
              >
                {(isLoading || internalLoading) ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {t('accounts.dialog.buttons.creating', 'Creating...')}
                  </>
                ) : (
                  t('accounts.dialog.buttons.create', 'Create Account')
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddAccountDialog