import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Filter } from 'lucide-react'
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
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('members.memberSearchPlaceholder')}
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Options */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select value={filters.status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('members.status.all')}</SelectItem>
                  <SelectItem value="active">{t('members.status.active')}</SelectItem>
                  <SelectItem value="inactive">{t('members.status.inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Select value={filters.registrationStatus} onValueChange={handleRegistrationChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Registration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('members.registration.all')}</SelectItem>
                  <SelectItem value="completed">{t('members.registration.completed')}</SelectItem>
                  <SelectItem value="pending">{t('members.registration.pending')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Select value={filters.gender} onValueChange={handleGenderChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('members.gender.all')}</SelectItem>
                  <SelectItem value="MALE">{t('members.gender.male')}</SelectItem>
                  <SelectItem value="FEMALE">{t('members.gender.female')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

