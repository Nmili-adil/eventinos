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
import { useTranslation } from 'react-i18next'

interface StatusChangeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentStatus: EventStatus
  onConfirm: (newStatus: EventStatus) => void
  isLoading?: boolean
  eventName?: string
}

export const StatusChangeDialog: React.FC<StatusChangeDialogProps> = ({
  open,
  onOpenChange,
  currentStatus,
  onConfirm,
  isLoading = false,
  eventName,
}) => {
  const { t } = useTranslation()
  const [selectedStatus, setSelectedStatus] = React.useState<EventStatus>(currentStatus)

  React.useEffect(() => {
    setSelectedStatus(currentStatus)
  }, [currentStatus, open])

  // Get status options based on current language
  const statusOptions: { value: EventStatus; label: string; description: string }[] = [
    { 
      value: 'PENDING', 
      label: t('events.statusChangeDialog.statusOptions.pending.label', 'Pending'), 
      description: t('events.statusChangeDialog.statusOptions.pending.description', 'Event is awaiting approval') 
    },
    { 
      value: 'ACCEPTED', 
      label: t('events.statusChangeDialog.statusOptions.accepted.label', 'Accepted'), 
      description: t('events.statusChangeDialog.statusOptions.accepted.description', 'Event has been approved') 
    },
    { 
      value: 'REFUSED', 
      label: t('events.statusChangeDialog.statusOptions.refused.label', 'Rejected'), 
      description: t('events.statusChangeDialog.statusOptions.refused.description', 'Event has been rejected') 
    },
    { 
      value: 'CLOSED', 
      label: t('events.statusChangeDialog.statusOptions.closed.label', 'Closed'), 
      description: t('events.statusChangeDialog.statusOptions.closed.description', 'Event has been closed') 
    },
  ]

  const handleConfirm = () => {
    if (selectedStatus !== currentStatus) {
      onConfirm(selectedStatus)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] border-slate-300">
        <DialogHeader>
          <DialogTitle>
            {t('events.statusChangeDialog.title', 'Change Event Status')}
          </DialogTitle>
          <DialogDescription>
            {eventName && (
              <span className="block mb-2">
                {t('events.statusChangeDialog.eventLabel', 'Event:')} <strong>{eventName}</strong>
              </span>
            )}
            {t('events.statusChangeDialog.description', 'Select the new status for this event.')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="status">
              {t('events.statusChangeDialog.statusLabel', 'Status')}
            </Label>
            <Select
              value={selectedStatus}
              onValueChange={(value) => setSelectedStatus(value as EventStatus)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full" id="status">
                <SelectValue 
                  placeholder={t('events.statusChangeDialog.selectStatus', 'Select status')} 
                  className="w-full" 
                />
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
                {t('events.statusChangeDialog.currentStatus', 'Current status')}:{' '}
                <strong>{statusOptions.find(s => s.value === currentStatus)?.label}</strong>
                {' → '}
                {t('events.statusChangeDialog.newStatus', 'New status')}:{' '}
                <strong>{statusOptions.find(s => s.value === selectedStatus)?.label}</strong>
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
            {t('events.statusChangeDialog.buttons.cancel', 'Cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || selectedStatus === currentStatus}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('events.statusChangeDialog.buttons.updating', 'Updating...')}
              </>
            ) : (
              t('events.statusChangeDialog.buttons.update', 'Update Status')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}