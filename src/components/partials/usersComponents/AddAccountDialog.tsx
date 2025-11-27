import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import type { Industry } from "@/types/usersType"
import { rolesApi } from "@/api/roleApi"

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
      role: '',
      isActive: true,
      company: {
        name: '',
        jobTitle: '',
        size: '',
        industry: 'IT',
      },
    },
  })

  // Fetch roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setRolesLoading(true)
        const response = await rolesApi()
        console.log('Roles API response:', response)
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
          industry: 'IT',
        },
      })
    }
  }, [isOpen, reset, roles])

  const onSubmit = async (data: AccountFormData) => {
    console.log(data);
    
    try {
      const submitData: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber || undefined,
        city: data.city || undefined,
        country: data.country || undefined,
        gender: data.gender,
        role: data.role,
        isActive: data.isActive,
      }

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
                      <label htmlFor="role" className="text-sm font-medium block">
                        {t('accounts.dialog.fields.userType', 'User Type *')}
                      </label>
                      <select
                        id="role"
                        value={selectedRoleId}
                        onChange={(e) => setValue('role', e.target.value)}
                        disabled={rolesLoading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value=""  disabled>
                          {rolesLoading 
                            ? t('accounts.dialog.loadingRoles', 'Loading roles...') 
                            : t('accounts.dialog.placeholders.userType', 'Select user type')
                          }
                        </option>
                        {roles.map((role) => (
                          <option key={role._id} value={role._id}>
                            {role.name.toLowerCase() === 'admin' ? t('accounts.dialog.options.userType.admin', 'Admin') : role.name.toLowerCase() === 'organizer' ? t('accounts.dialog.options.userType.organizer', 'Organizer') : role.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="isActive" className="text-sm font-medium block">
                        {t('accounts.dialog.fields.status', 'Account Status')}
                      </label>
                      <select
                        id="isActive"
                        value={watch('isActive') ? 'active' : 'inactive'}
                        onChange={(e) => setValue('isActive', e.target.value === 'active')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="active">{t('accounts.dialog.options.status.active', 'Active')}</option>
                        <option value="inactive">{t('accounts.dialog.options.status.inactive', 'Inactive')}</option>
                      </select>
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
                      <label htmlFor="firstName" className="text-sm font-medium block">
                        {t('accounts.dialog.fields.firstName', 'First Name *')}
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        {...register('firstName', { 
                          required: 'This field is required' 
                        })}
                        placeholder={t('accounts.dialog.placeholders.firstName', 'Enter first name')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {errors.firstName && (
                        <p className="text-xs text-red-600 mt-1">{errors.firstName.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="text-sm font-medium block">
                        {t('accounts.dialog.fields.lastName', 'Last Name *')}
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        {...register('lastName', { 
                          required: 'This field is required' 
                        })}
                        placeholder={t('accounts.dialog.placeholders.lastName', 'Enter last name')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {errors.lastName && (
                        <p className="text-xs text-red-600 mt-1">{errors.lastName.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="gender" className="text-sm font-medium block">
                        {t('accounts.dialog.fields.gender', 'Gender')}
                      </label>
                      <select
                        id="gender"
                        value={watch('gender')}
                        onChange={(e) => setValue('gender', e.target.value as 'MALE' | 'FEMALE')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="MALE">{t('accounts.dialog.options.gender.male', 'Male')}</option>
                        <option value="FEMALE">{t('accounts.dialog.options.gender.female', 'Female')}</option>
                      </select>
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
                      <label htmlFor="email" className="text-sm font-medium block">
                        {t('accounts.dialog.fields.email', 'Email Address *')}
                      </label>
                      <input
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {errors.email && (
                        <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="phoneNumber" className="text-sm font-medium block">
                        {t('accounts.dialog.fields.phone', 'Phone Number')}
                      </label>
                      <input
                        id="phoneNumber"
                        type="text"
                        {...register('phoneNumber')}
                        placeholder={t('accounts.dialog.placeholders.phone', 'Enter phone number')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      <label htmlFor="city" className="text-sm font-medium block">
                        {t('accounts.dialog.fields.city', 'City')}
                      </label>
                      <input
                        id="city"
                        type="text"
                        {...register('city')}
                        placeholder={t('accounts.dialog.placeholders.city', 'Enter city')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="country" className="text-sm font-medium block">
                        {t('accounts.dialog.fields.country', 'Country')}
                      </label>
                      <input
                        id="country"
                        type="text"
                        {...register('country')}
                        placeholder={t('accounts.dialog.placeholders.country', 'Enter country')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                          <label htmlFor="companyName" className="text-sm font-medium block">
                            {t('accounts.dialog.fields.companyName', 'Company Name')}
                          </label>
                          <input
                            id="companyName"
                            type="text"
                            {...register('company.name')}
                            placeholder={t('accounts.dialog.placeholders.companyName', 'Enter company name')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="jobTitle" className="text-sm font-medium block">
                            {t('accounts.dialog.fields.jobTitle', 'Job Title')}
                          </label>
                          <input
                            id="jobTitle"
                            type="text"
                            {...register('company.jobTitle')}
                            placeholder={t('accounts.dialog.placeholders.jobTitle', 'Enter job title')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="companySize" className="text-sm font-medium block">
                            {t('accounts.dialog.fields.companySize', 'Company Size')}
                          </label>
                          <select
                            id="companySize"
                            value={watch('company.size')}
                            onChange={(e) => setValue('company.size', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">{t('accounts.dialog.placeholders.companySize', 'Select company size')}</option>
                            <option value="1-10">1-10</option>
                            <option value="11-50">11-50</option>
                            <option value="51-200">51-200</option>
                            <option value="201-500">201-500</option>
                            <option value="501-1000">501-1000</option>
                            <option value="1000+">1000+</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="industry" className="text-sm font-medium block">
                            {t('accounts.dialog.fields.industry', 'Industry')}
                          </label>
                          <input
                            id="industry"
                            type="text"
                            {...register('company.industry')}
                            placeholder={t('accounts.dialog.placeholders.industry', 'Enter industry')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <button 
                type="button" 
                onClick={onClose} 
                disabled={isLoading}
                className="min-w-24 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button 
                type="submit" 
                disabled={isLoading}
                className="min-w-32 px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {t('accounts.dialog.buttons.creating', 'Creating...')}
                  </>
                ) : (
                  t('accounts.dialog.buttons.create', 'Create Account')
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddAccountDialog