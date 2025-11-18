// components/events/table-row.tsx
import { TableRow, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit,  Eye, Trash2, Pen } from 'lucide-react'
import { getStatusColor, transformEventForTable } from '@/lib/events-utils'
import type { Event } from '@/types/eventsTypes'
import { useTranslation } from 'react-i18next'

interface TableRowProps {
  event: Event
  onEdit: (id: string) => void
  onChangeStatus: (id: string) => void
  onPreview: (id: string) => void
  onDelete: (id: string) => void
}

export function EventTableRow({ event, onEdit, onChangeStatus, onPreview, onDelete }: TableRowProps) {
  const tableEvent = transformEventForTable(event)
  const { t } = useTranslation()
  return (
    <TableRow className='border-slate-400'>
      <TableCell className="font-medium">{tableEvent.name}</TableCell>
      <TableCell>{tableEvent.type}</TableCell>
      <TableCell>{tableEvent.website}</TableCell>
      <TableCell>{tableEvent.location}</TableCell>
      <TableCell>{tableEvent.startDate}</TableCell>
      <TableCell>{tableEvent.endDate}</TableCell>
      <TableCell>
        <Badge variant="outline" className={getStatusColor(tableEvent.status)}>
          {tableEvent.status}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="border-slate-400" align="end">
            <DropdownMenuItem onClick={() => onEdit(event._id)}>
              <Edit className="h-4 w-4 mr-2" />
              {t('events.table.editEvent')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onChangeStatus(event._id)}>
              <Pen className="h-4 w-4 mr-2" />
              {t('events.table.changeStatus')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onPreview(event._id)}>
              <Eye className="h-4 w-4 mr-2" />
              {t('events.table.previewEvent')}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(event._id)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('events.table.deleteEvent')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}