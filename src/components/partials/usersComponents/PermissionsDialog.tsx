import { useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "@/store/app/rootReducer"
import { fetchRightsRequest } from "@/store/features/rights/rights.actions"
import type { AppDispatch } from "@/store/app/store"
import { Skeleton } from "@/components/ui/skeleton"
import type { Right } from "@/store/features/rights/rights.types"

interface PermissionsDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (selectedPermissions: string[]) => Promise<void>
  initialPermissions?: string[]
  isLoading?: boolean
}

const PermissionsDialog = ({
  isOpen,
  onClose,
  onSave,
  initialPermissions = [],
  isLoading = false,
}: PermissionsDialogProps) => {
  const dispatch = useDispatch<AppDispatch>()
  const { rights, loading: rightsLoading } = useSelector((state: RootState) => state.rights)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(initialPermissions)
  const hasInitializedRef = useRef(false)

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchRightsRequest())
      hasInitializedRef.current = false
      // Reset to initial permissions when dialog opens
      setSelectedPermissions(initialPermissions)
      if (initialPermissions.length > 0) {
        hasInitializedRef.current = true
      }
    } else {
      hasInitializedRef.current = false
    }
  }, [isOpen, dispatch])

  // Update selected permissions when initialPermissions changes (e.g., when role is loaded asynchronously)
  useEffect(() => {
    if (isOpen && !hasInitializedRef.current && initialPermissions.length > 0) {
      // Only update if we haven't initialized yet and we have permissions
      setSelectedPermissions(initialPermissions)
      hasInitializedRef.current = true
    }
  }, [initialPermissions, isOpen])

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId)
      } else {
        return [...prev, permissionId]
      }
    })
  }

  const toggleAllInGroup = (groupRights: Right[]) => {
    const groupIds = groupRights.map(r => r._id)
    const allSelected = groupIds.every(id => selectedPermissions.includes(id))
    
    if (allSelected) {
      // Deselect all in group
      setSelectedPermissions(prev => prev.filter(id => !groupIds.includes(id)))
    } else {
      // Select all in group
      setSelectedPermissions(prev => {
        const newSelection = [...prev]
        groupIds.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id)
          }
        })
        return newSelection
      })
    }
  }

  const handleSelectAll = () => {
    if (selectedPermissions.length === rights.length) {
      setSelectedPermissions([])
    } else {
      setSelectedPermissions(rights.map(r => r._id))
    }
  }

  const handleSubmit = async () => {
    try {
      await onSave(selectedPermissions)
      onClose()
    } catch (error) {
      console.error('Failed to save permissions:', error)
    }
  }

  // Group rights by group
  const groupedRights = rights.reduce((acc, right) => {
    if (!acc[right.group]) {
      acc[right.group] = []
    }
    acc[right.group].push(right)
    return acc
  }, {} as Record<string, Right[]>)

  const allSelected = rights.length > 0 && selectedPermissions.length === rights.length

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl border-slate-300 max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Assign Permissions
          </DialogTitle>
          <DialogDescription>
            Select the permissions to assign to this user. Permissions are grouped by category.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Select All */}
          <div className="flex items-center justify-between pb-2 border-b">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
              />
              <Label className="text-sm font-medium">
                Select All ({selectedPermissions.length} of {rights.length} selected)
              </Label>
            </div>
          </div>

          <ScrollArea className="max-h-[calc(90vh-350px)] overflow-y-auto">
            {rightsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ))}
              </div>
            ) : Object.keys(groupedRights).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(groupedRights).map(([group, groupRights]) => {
                  const groupSelected = groupRights.every(r => selectedPermissions.includes(r._id))

                  return (
                    <div key={group} className="space-y-3">
                      <div className="flex items-center justify-between pb-2 ">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={groupSelected}
                            onCheckedChange={() => toggleAllInGroup(groupRights)}
                          />
                          <Label className="text-sm font-semibold capitalize">
                            {group.replaceAll('_', ' ')}
                          </Label>
                          <Badge variant="secondary" className="ml-2">
                            {groupRights.filter(r => selectedPermissions.includes(r._id)).length} / {groupRights.length}
                          </Badge>
                        </div>
                      </div>
                      
                      <Table>
                        <TableBody className="divide-slate-300">
                          {groupRights.map((right) => (
                            <TableRow key={right._id}>
                              <TableCell className="w-12">
                                <Checkbox
                                  checked={selectedPermissions.includes(right._id)}
                                  onCheckedChange={() => togglePermission(right._id)}
                                />
                              </TableCell>
                              <TableCell className="w-full">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-gray-700">{right.name.replaceAll('_', ' ')}</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No permissions available</p>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t my-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              `Save Permissions (${selectedPermissions.length})`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PermissionsDialog

