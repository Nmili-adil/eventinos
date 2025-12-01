import { Search } from 'lucide-react'
import type { MembersFilters } from '@/lib/members-utils'
import { t } from 'i18next'

interface MembersFiltersProps {
  filters: MembersFilters
  onFiltersChange: (filters: MembersFilters) => void
}

export function MembersFilters({ filters, onFiltersChange }: MembersFiltersProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value })
  }

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, status: value as MembersFilters['status'] })
  }

  const handleRegistrationChange = (value: string) => {
    onFiltersChange({ ...filters, registrationStatus: value as MembersFilters['registrationStatus'] })
  }

  const handleGenderChange = (value: string) => {
    onFiltersChange({ ...filters, gender: value as MembersFilters['gender'] })
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px] p-1 overflow-hidden">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('members.memberSearchPlaceholder')}
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-transparent focus:border focus:border-slate-500"
          />
        </div>

        {/* Status Select */}
        <select
          value={filters.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="px-4 h-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer min-w-[140px]"
        >
          <option value="all">{t('members.status.all')}</option>
          <option value="active">{t('members.status.active')}</option>
          <option value="inactive">{t('members.status.inactive')}</option>
        </select>

        {/* Registration Select */}
        <select
          value={filters.registrationStatus}
          onChange={(e) => handleRegistrationChange(e.target.value)}
          className="px-4 h-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer min-w-[140px]"
        >
          <option value="all">{t('members.registration.all')}</option>
          <option value="completed">{t('members.registration.completed')}</option>
          <option value="pending">{t('members.registration.pending')}</option>
        </select>

        {/* Gender Select */}
        <select
          value={filters.gender}
          onChange={(e) => handleGenderChange(e.target.value)}
          className="px-4 h-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer min-w-[140px]"
        >
          <option value="all">{t('members.gender.all')}</option>
          <option value="MALE">{t('members.gender.male')}</option>
          <option value="FEMALE">{t('members.gender.female')}</option>
        </select>
      </div>
    </div>
  )
}
