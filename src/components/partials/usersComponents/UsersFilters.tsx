import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Filter } from 'lucide-react'
import type { UsersFilters } from '@/lib/users-utils'

interface UsersFiltersProps {
  filters: UsersFilters
  onFiltersChange: (filters: UsersFilters) => void
}

export function UsersFilters({ filters, onFiltersChange }: UsersFiltersProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value })
  }

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, status: value as UsersFilters['status'] })
  }

  const handleRegistrationChange = (value: string) => {
    onFiltersChange({ ...filters, registrationStatus: value as UsersFilters['registrationStatus'] })
  }

  const handleGenderChange = (value: string) => {
    onFiltersChange({ ...filters, gender: value as UsersFilters['gender'] })
  }

  const handleUserTypeChange = (value: string) => {
    onFiltersChange({ ...filters, userType: value as UsersFilters['userType'] })
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name, email, phone, location, or company..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Options */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select value={filters.status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Select value={filters.registrationStatus} onValueChange={handleRegistrationChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Registration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Registration</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Select value={filters.gender} onValueChange={handleGenderChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Gender" />  
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Gender</SelectItem>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Select value={filters.userType} onValueChange={handleUserTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="User Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Organizer">Organizer</SelectItem>
                  <SelectItem value="Member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

