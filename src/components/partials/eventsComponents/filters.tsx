import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { FiltersProps } from '@/types/eventsTypes'
import { Calendar as CalendarIcon, Search, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

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

  const handleDateChange = (key: 'startDate' | 'endDate', date?: Date) => {
    onFiltersChange({
      ...filters,
      [key]: date ? date.toISOString() : null,
    })
  }

  const clearDates = () => {
    onFiltersChange({ ...filters, startDate: null, endDate: null })
  }

  const parsedStartDate = filters.startDate ? new Date(filters.startDate) : undefined
  const parsedEndDate = filters.endDate ? new Date(filters.endDate) : undefined

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-evenly gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('events.searchPlaceholder')}
            className="pl-10"
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        
         <div className="flex flex-wrap gap-2 justify-evenly ">
        <Popover>
          <PopoverTrigger asChild className="flex-1">
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal min-w-[200px]",
                !parsedStartDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {parsedStartDate
                ? format(parsedStartDate, "PPP")
                : t('events.filters.startDatePlaceholder', 'Select start date')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={parsedStartDate}
              onSelect={(date) => handleDateChange('startDate', date ?? undefined)}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild className="flex-1">
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal min-w-[200px]",
                !parsedEndDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {parsedEndDate
                ? format(parsedEndDate, "PPP")
                : t('events.filters.endDatePlaceholder', 'Select end date')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={parsedEndDate}
              onSelect={(date) => handleDateChange('endDate', date ?? undefined)}
              disabled={(date) => (parsedStartDate ? date < parsedStartDate : false)}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {(parsedStartDate || parsedEndDate) && (
          <Button variant="ghost" size="sm" className="gap-2" onClick={clearDates}>
            <X className="h-3.5 w-3.5" />
            {t('events.filters.clearDates', 'Clear dates')}
          </Button>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <Select value={filters.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-[140px]">
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
            <SelectTrigger className="w-full sm:w-[140px]">
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

     
    </div>
  )
}
