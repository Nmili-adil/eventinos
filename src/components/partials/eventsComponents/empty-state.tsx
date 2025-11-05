import { Button } from "@/components/ui/button"
import type { EmptyStateProps } from "@/types/eventsTypes"



export function EmptyState({ onResetFilters }: EmptyStateProps) {
  return (
    <div className="text-center py-12 border-t">
      <div className="text-muted-foreground mb-4">
        Aucun événement trouvé
      </div>
      <Button variant="outline" onClick={onResetFilters}>
        Réinitialiser les filtres
      </Button>
    </div>
  )
}