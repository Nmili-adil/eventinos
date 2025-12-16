import { Search } from 'lucide-react'
import type { MembersFilters } from '@/lib/members-utils'
import { t } from 'i18next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

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
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('members.memberSearchPlaceholder')}
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Select */}
          <Select
            value={filters.status}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="min-w-[140px]">
              <SelectValue placeholder={t('members.status.all')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('members.status.all')}</SelectItem>
              <SelectItem value="active">{t('members.status.active')}</SelectItem>
              <SelectItem value="inactive">{t('members.status.inactive')}</SelectItem>
            </SelectContent>
          </Select>

          {/* Registration Select */}
          <Select
            value={filters.registrationStatus}
            onValueChange={handleRegistrationChange}
          >
            <SelectTrigger className="min-w-[140px]">
              <SelectValue placeholder={t('members.registration.all')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('members.registration.all')}</SelectItem>
              <SelectItem value="completed">{t('members.registration.completed')}</SelectItem>
              <SelectItem value="pending">{t('members.registration.pending')}</SelectItem>
            </SelectContent>
          </Select>

          {/* Gender Select */}
          <Select
            value={filters.gender}
            onValueChange={handleGenderChange}
          >
            <SelectTrigger className="min-w-[140px]">
              <SelectValue placeholder={t('members.gender.all')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('members.gender.all')}</SelectItem>
              <SelectItem value="MALE">{t('members.gender.male')}</SelectItem>
              <SelectItem value="FEMALE">{t('members.gender.female')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}