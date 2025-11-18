// components/events/table-header.tsx
import { TableHead, TableRow, TableHeader as UITableHeader } from '@/components/ui/table'
import type { SortDirection, SortField } from '@/types/eventsTypes'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface TableHeaderProps {
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
}



export function TableHeader({ sortField, sortDirection, onSort }: TableHeaderProps) {
  const { t } = useTranslation()
  const headers: { key: SortField; label: string }[] = [
    { key: 'name', label: t('events.table.title') },
    { key: 'type', label: t('events.table.type')  },
    { key: 'visibility', label: t('events.table.visibility')  },
    { key: 'location', label: t('events.table.location') },
    { key: 'startDate', label: t('events.table.startDate')  },
    { key: 'endDate', label: t('events.table.endDate')  },
    { key: 'status', label: t('events.table.status')  },
  ]

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  return (
    <UITableHeader>
      <TableRow>
        {headers.map((header) => (
          <TableHead 
            key={header.key}
            className="cursor-pointer hover:bg-muted/50 divide-slate-400"
            onClick={() => onSort(header.key)}
          >
            <div className="flex items-center gap-1">
              {header.label}
              {getSortIcon(header.key)}
            </div>
          </TableHead>
        ))}
        <TableHead className="text-right">{t('events.table.actions')}</TableHead>
      </TableRow>
    </UITableHeader>
  )
}