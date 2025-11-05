import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { FiltersProps } from '@/types/eventsTypes'
import { Search } from 'lucide-react'


export function Filters({ filters, onFiltersChange }: FiltersProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value })
  }

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, status: value })
  }

  const handleTypeChange = (value: string) => {
    onFiltersChange({ ...filters, type: value })
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un événement..."
          className="pl-10"
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Select value={filters.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="ACCEPTED">Accepté</SelectItem>
            <SelectItem value="PENDING">En attente</SelectItem>
            <SelectItem value="REJECTED">Rejeté</SelectItem>
            <SelectItem value="CANCELLED">Annulé</SelectItem>
            <SelectItem value="CLOSED">Terminé</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filters.type} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="FACETOFACE">Présentiel</SelectItem>
            <SelectItem value="VIRTUEL">En ligne</SelectItem>
            <SelectItem value="HYBRID">Hybride</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}