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
  onDelete: (id: string, title: string) => void
}

export function EventTableRow({ event, onEdit, onChangeStatus, onPreview, onDelete }: TableRowProps) {
  const tableEvent = transformEventForTable(event)
  const { t } = useTranslation()

  // Handle table row click, but ignore clicks from dropdown
  const handleRowClick = (e: React.MouseEvent) => {
    // Check if the click came from the dropdown or its children
    const target = e.target as HTMLElement
    if (target.closest('[data-dropdown]')) {
      return
    }
    onPreview(event._id)
  }

  // Handle dropdown item clicks with event propagation stopped
  const handleDropdownAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation()
    action()
  }

  return (
    <TableRow 
      className='border-slate-400 cursor-pointer' 
      onClick={handleRowClick}
    >
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
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              data-dropdown="true"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="border-slate-400 z-50" 
            align="end"
            data-dropdown="true"
          >
            <DropdownMenuItem 
              onClick={(e) => handleDropdownAction(e, () => onEdit(event._id))}
              data-dropdown="true"
            >
              <Edit className="h-4 w-4 mr-2" />
              {t('events.table.editEvent')}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => handleDropdownAction(e, () => onChangeStatus(event._id))}
              data-dropdown="true"
            >
              <Pen className="h-4 w-4 mr-2" />
              {t('events.table.changeStatus')}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => handleDropdownAction(e, () => onPreview(event._id))}
              data-dropdown="true"
            >
              <Eye className="h-4 w-4 mr-2" />
              {t('events.table.previewEvent')}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => handleDropdownAction(e, () => onDelete(event._id, event.title))}
              className="text-red-600"
              data-dropdown="true"
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