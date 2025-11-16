import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { FiltersProps } from '@/types/eventsTypes'
import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'


export function Filters({ filters, onFiltersChange }: FiltersProps) {
  const { t } = useTranslation()
  
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value })
  }

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, status: value })
  }

  const handleTypeChange = (value: string) => {
    onFiltersChange({ ...filters, type: value })
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('events.searchPlaceholder')}
          className="pl-10"
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Select value={filters.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={t('common.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('events.allStatuses')}</SelectItem>
            <SelectItem value="ACCEPTED">{t('events.statusAccepted')}</SelectItem>
            <SelectItem value="PENDING">{t('events.statusPending')}</SelectItem>
            <SelectItem value="REJECTED">{t('events.statusRejected')}</SelectItem>
            <SelectItem value="CANCELLED">{t('events.statusCancelled')}</SelectItem>
            <SelectItem value="CLOSED">{t('events.statusClosed')}</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filters.type} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={t('common.type')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('events.allTypes')}</SelectItem>
            <SelectItem value="FACETOFACE">{t('events.faceToFace')}</SelectItem>
            <SelectItem value="VIRTUEL">{t('events.virtual')}</SelectItem>
            <SelectItem value="HYBRID">{t('events.hybrid')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}