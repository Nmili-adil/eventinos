// components/events/table-row.tsx
import { TableRow, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit, Download, Eye, Trash2 } from 'lucide-react'
import { getStatusColor, getStatusText, transformEventForTable } from '@/lib/events-utils'
import type { Event } from '@/types/eventsTypes'

interface TableRowProps {
  event: Event
  onEdit: (id: string) => void
  onChangeStatus: (id: string) => void
  onPreview: (id: string) => void
  onDelete: (id: string) => void
}

export function EventTableRow({ event, onEdit, onChangeStatus, onPreview, onDelete }: TableRowProps) {
  const tableEvent = transformEventForTable(event)

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
          {getStatusText(tableEvent.status)}
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
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onChangeStatus(event._id)}>
              <Download className="h-4 w-4 mr-2" />
              Change Status
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onPreview(event._id)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(event._id)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}