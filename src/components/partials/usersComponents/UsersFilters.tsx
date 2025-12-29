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
        <div className="flex flex-col md:flex-row gap-4">
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
              <Select value={filters.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="pl-10 relative" >
                  <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <SelectValue placeholder={t('accounts.filters.status.all', 'All Status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('accounts.filters.status.all', 'All Status')}
                  </SelectItem>
                  <SelectItem value="active">
                    {t('accounts.filters.status.active', 'Active')}
                  </SelectItem>
                  <SelectItem value="inactive">
                    {t('accounts.filters.status.inactive', 'Inactive')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* REGISTRATION STATUS FILTER */}
            <div className="flex-1">
              <Select value={filters.registrationStatus} onValueChange={handleRegistrationChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t('accounts.filters.registration.all', 'All Registration')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('accounts.filters.registration.all', 'All Registration')}
                  </SelectItem>
                  <SelectItem value="completed">
                    {t('accounts.filters.registration.completed', 'Completed')}
                  </SelectItem>
                  <SelectItem value="pending">
                    {t('accounts.filters.registration.pending', 'Pending')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* GENDER FILTER */}
            <div className="flex-1">
              <Select value={filters.gender} onValueChange={handleGenderChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t('accounts.filters.gender.all', 'All Gender')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('accounts.filters.gender.all', 'All Gender')}
                  </SelectItem>
                  <SelectItem value="MALE">
                    {t('accounts.filters.gender.male', 'Male')}
                  </SelectItem>
                  <SelectItem value="FEMALE">
                    {t('accounts.filters.gender.female', 'Female')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* USER TYPE FILTER */}
            <div className="flex-1">
              <Select value={filters.userType} onValueChange={handleUserTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t('accounts.filters.userType.all', 'All Types')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('accounts.filters.userType.all', 'All Types')}
                  </SelectItem>
                  <SelectItem value="Organizer">
                    {t('accounts.filters.userType.organizer', 'Organizer')}
                  </SelectItem>
                  <SelectItem value="Admin">
                    {t('accounts.filters.userType.admin', 'Admin')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}