import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "@/store/app/rootReducer"
import { fetchRightsRequest } from "@/store/features/rights/rights.actions"
import type { AppDispatch } from "@/store/app/store"
import PermissionsDialog from "@/components/partials/usersComponents/PermissionsDialog"
import { Shield } from "lucide-react"

interface Role {
  _id: string
  name: string
  rights: string[]
  systemRole?: boolean
}

interface RoleEditDialogProps {
  role: Role | null
  isOpen: boolean
  onClose: () => void
  onSave: (roleId: string, data: Partial<Role>) => Promise<void>
  isLoading?: boolean
}

interface RoleFormData {
  name: string
  rights: string[]
}

const RoleEditDialog = ({
  role,
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}: RoleEditDialogProps) => {
  const dispatch = useDispatch<AppDispatch>()
  const { rights } = useSelector((state: RootState) => state.rights)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RoleFormData>({
    defaultValues: {
      name: '',
      rights: [],
    },
  })

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchRightsRequest())
    }
  }, [isOpen, dispatch])

  useEffect(() => {
    if (role && isOpen) {
      reset({
        name: role.name || '',
        rights: role.rights || [],
      })
      setSelectedPermissions(role.rights || [])
    }
  }, [role, isOpen, reset])

  const handleSavePermissions = async (permissions: string[]) => {
    setSelectedPermissions(permissions)
    setPermissionsDialogOpen(false)
  }

  const onSubmit = async (data: RoleFormData) => {
    if (!role) return
    
    try {
      const submitData = {
        name: data.name,
        rights: selectedPermissions,
      }
      await onSave(role._id, submitData)
      onClose()
    } catch (error) {
      console.error('Failed to update role:', error)
    }
  }

  if (!role) return null

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl border-slate-300 max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit Role</DialogTitle>
            <DialogDescription>
              Update role information and permissions.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <ScrollArea className="max-h-[calc(90vh-200px)] pr-4 overflow-y-auto">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Role Name *</Label>
                    <Input
                      id="name"
                      {...register('name', { required: 'Role name is required' })}
                      placeholder="Enter role name"
                      disabled={role.systemRole}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                    {role.systemRole && (
                      <p className="text-xs text-muted-foreground">
                        System roles cannot be renamed
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-semibold">Permissions</Label>
                      <p className="text-sm text-muted-foreground">
                        Select the permissions to assign to this role
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPermissionsDialogOpen(true)}
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Manage Permissions
                    </Button>
                  </div>

                  {selectedPermissions.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {selectedPermissions.map((permissionId) => {
                          const permission = rights.find(r => r._id === permissionId)
                          return permission ? (
                            <Badge key={permissionId} variant="secondary">
                              {permission.name.replaceAll('_', ' ')}
                            </Badge>
                          ) : null
                        })}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {selectedPermissions.length} permission{selectedPermissions.length !== 1 ? 's' : ''} selected
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-dashed rounded-lg">
                      <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No permissions selected. Click "Manage Permissions" to add permissions.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>

            <div className="flex justify-end gap-2 pt-4 border-t mt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || selectedPermissions.length === 0}>
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <PermissionsDialog
        isOpen={permissionsDialogOpen}
        onClose={() => setPermissionsDialogOpen(false)}
        onSave={handleSavePermissions}
        initialPermissions={selectedPermissions}
        isLoading={false}
      />
    </>
  )
}

export default RoleEditDialog

