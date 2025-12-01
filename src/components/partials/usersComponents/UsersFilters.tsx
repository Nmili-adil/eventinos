import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Filter } from 'lucide-react'
import type { UsersFilters } from '@/lib/users-utils'
import { useTranslation } from 'react-i18next'

interface UsersFiltersProps {
  filters: UsersFilters
  onFiltersChange: (filters: UsersFilters) => void
}

export function UsersFilters({ filters, onFiltersChange }: UsersFiltersProps) {
  const { t } = useTranslation()

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value })
  }

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, status: value as UsersFilters['status'] })
  }

  const handleRegistrationChange = (value: string) => {
    onFiltersChange({ ...filters, registrationStatus: value as UsersFilters['registrationStatus'] })
  }

  const handleGenderChange = (value: string) => {
    onFiltersChange({ ...filters, gender: value as UsersFilters['gender'] })
  }

  const handleUserTypeChange = (value: string) => {
    onFiltersChange({ ...filters, userType: value as UsersFilters['userType'] })
  }

  return (
    <Card>
      <CardContent className="">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('accounts.filters.searchPlaceholder', 'Search users by name, email, phone, location, or company...')}
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Options */}
          <div className="flex flex-col sm:flex-row gap-4">

            {/* STATUS FILTER */}
            <div className="flex-1">
              <div className="relative">
                <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <select
                  value={filters.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-slate-500"
                >
                  <option value="all">
                    {t('accounts.filters.status.all', 'All Status')}
                  </option>
                  <option value="active">
                    {t('accounts.filters.status.active', 'Active')}
                  </option>
                  <option value="inactive">
                    {t('accounts.filters.status.inactive', 'Inactive')}
                  </option>
                </select>
              </div>
            </div>

            {/* REGISTRATION STATUS FILTER */}
            <div className="flex-1">
              <select
                value={filters.registrationStatus}
                onChange={(e) => handleRegistrationChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-slate-500"
              >
                <option value="all">
                  {t('accounts.filters.registration.all', 'All Registration')}
                </option>
                <option value="completed">
                  {t('accounts.filters.registration.completed', 'Completed')}
                </option>
                <option value="pending">
                  {t('accounts.filters.registration.pending', 'Pending')}
                </option>
              </select>
            </div>

            {/* GENDER FILTER */}
            <div className="flex-1">
              <select
                value={filters.gender}
                onChange={(e) => handleGenderChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-slate-500"
              >
                <option value="all">
                  {t('accounts.filters.gender.all', 'All Gender')}
                </option>
                <option value="MALE">
                  {t('accounts.filters.gender.male', 'Male')}
                </option>
                <option value="FEMALE">
                  {t('accounts.filters.gender.female', 'Female')}
                </option>
              </select>
            </div>

            {/* USER TYPE FILTER */}
            <div className="flex-1">
              <select
                value={filters.userType}
                onChange={(e) => handleUserTypeChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-slate-500"
              >
                <option value="all">
                  {t('accounts.filters.userType.all', 'All Types')}
                </option>
                <option value="Organizer">
                  {t('accounts.filters.userType.organizer', 'Organizer')}
                </option>
                <option value="Admin">
                  {t('accounts.filters.userType.admin', 'Admin')}
                </option>
              </select>
            </div>

          </div>

        </div>
      </CardContent>
    </Card>
  )
}