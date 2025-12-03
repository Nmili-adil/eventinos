import { useState } from 'react'
import { MapPin, Search, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import * as Dialog from '@radix-ui/react-dialog'
import { MapLocationSelector, type LocationValue } from './MapLocationSelector'

interface LocationPickerProps {
  value?: LocationValue
  onChange: (value: LocationValue) => void
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  description?: string
}

export const LocationPicker = ({
  value,
  onChange,
  label = 'Location',
  placeholder = 'Select a location',
  disabled = false,
  required = false,
  description,
}: LocationPickerProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const displayText = value?.name
    ? `${value.name}${value.city ? `, ${value.city}` : ''}`
    : value?.address
      ? value.address.split(',').slice(0, 2).join(',').trim()
      : placeholder

  const handleLocationChange = (newValue: LocationValue) => {
    onChange(newValue)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <div className="space-y-2">
      {label && (
        <Label className="font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Trigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className="w-full justify-between text-left font-normal"
          >
            <span className="flex items-center gap-2 truncate flex-1">
              <MapPin className="h-4 w-4 flex-shrink-0 text-blue-500" />
              <span className="truncate text-sm">
                {displayText}
              </span>
            </span>
            <ChevronDown className="h-4 w-4 flex-shrink-0 opacity-50" />
          </Button>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 animate-fade-in" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-4xl max-h-[90vh] translate-x-[-50%] translate-y-[-50%] border border-slate-200 bg-white shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="border-b border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Dialog.Title className="text-lg font-semibold text-slate-900">
                      Select Location
                    </Dialog.Title>
                    <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                      Click on the map, search for a location, or use your current location
                    </Dialog.Description>
                  </div>
                  <Dialog.Close className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.5L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31318L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.5L11.7816 4.03157Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Dialog.Close>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <MapLocationSelector
                  value={value}
                  onChange={handleLocationChange}
                  height="500px"
                  enableSearch
                  enableGeolocation
                />
              </div>

              {/* Footer */}
              <div className="border-t border-slate-200 bg-slate-50 p-4 flex justify-end gap-3">
                <Dialog.Close asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Dialog.Close>
                <Dialog.Close asChild>
                  <Button
                    type="button"
                    disabled={!value?.location}
                  >
                    Confirm Location
                  </Button>
                </Dialog.Close>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {value?.address && (
        <div className="text-xs text-muted-foreground bg-blue-50 border border-blue-200 rounded p-2 flex items-start gap-2">
          <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0 text-blue-600" />
          <div>
            {value.name && <div className="font-medium text-slate-700">{value.name}</div>}
            <div>{value.address}</div>
            {value.city && <div className="text-slate-600">{value.city}, {value.country}</div>}
          </div>
        </div>
      )}
    </div>
  )
}
