// components/events/table-header.tsx
import { TableHead, TableRow, TableHeader as UITableHeader } from '@/components/ui/table'
import type { SortDirection, SortField } from '@/types/eventsTypes'
import { ChevronUp, ChevronDown } from 'lucide-react'

interface TableHeaderProps {
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
}

const headers: { key: SortField; label: string }[] = [
  { key: 'name', label: 'Nom' },
  { key: 'type', label: 'Type' },
  { key: 'visibility', label: 'Website' },
  { key: 'location', label: 'Location*' },
  { key: 'startDate', label: 'Date début' },
  { key: 'endDate', label: 'Date fin' },
  { key: 'status', label: 'Status' },
]

export function TableHeader({ sortField, sortDirection, onSort }: TableHeaderProps) {
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
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </UITableHeader>
  )
}