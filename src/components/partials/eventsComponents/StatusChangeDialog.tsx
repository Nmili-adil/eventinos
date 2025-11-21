import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import type { EventStatus } from '@/types/eventsTypes'

interface StatusChangeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentStatus: EventStatus
  onConfirm: (newStatus: EventStatus) => void
  isLoading?: boolean
  eventName?: string
}

const statusOptions: { value: EventStatus; label: string; description: string }[] = [
  { value: 'PENDING', label: 'Pending', description: 'Event is awaiting approval' },
  { value: 'ACCEPTED', label: 'Accepted', description: 'Event has been approved' },
  { value: 'REFUSED', label: 'Rejected', description: 'Event has been rejected' },
  { value: 'CLOSED', label: 'Closed', description: 'Event has been close' },
]

export const StatusChangeDialog: React.FC<StatusChangeDialogProps> = ({
  open,
  onOpenChange,
  currentStatus,
  onConfirm,
  isLoading = false,
  eventName,
}) => {
  const [selectedStatus, setSelectedStatus] = React.useState<EventStatus>(currentStatus)

  React.useEffect(() => {
    setSelectedStatus(currentStatus)
  }, [currentStatus, open])

  const handleConfirm = () => {
    if (selectedStatus !== currentStatus) {
      onConfirm(selectedStatus)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Event Status</DialogTitle>
          <DialogDescription>
            {eventName && (
              <span className="block mb-2">
                Event: <strong>{eventName}</strong>
              </span>
            )}
            Select the new status for this event.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={selectedStatus}
              onValueChange={(value) => setSelectedStatus(value as EventStatus)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full" id="status">
                <SelectValue placeholder="Select status" className="w-full" />
              </SelectTrigger>
              <SelectContent className="w-full">
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="flex flex-row justify-between">
                    <span>{option.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedStatus !== currentStatus && (
              <p className="text-sm text-muted-foreground mt-2">
                Current status: <strong>{statusOptions.find(s => s.value === currentStatus)?.label}</strong>
                {' → '}
                New status: <strong>{statusOptions.find(s => s.value === selectedStatus)?.label}</strong>
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || selectedStatus === currentStatus}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Status'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

