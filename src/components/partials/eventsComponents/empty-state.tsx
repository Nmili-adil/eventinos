import { Button } from "@/components/ui/button"
import type { EmptyStateProps } from "@/types/eventsTypes"
import { useTranslation } from "react-i18next"



export function EmptyState({ onResetFilters }: EmptyStateProps) {
  const { t } = useTranslation()
  const reloadPage = () => {
    window.location.reload()
  }
  return (
    <div className="text-center py-12 border-t">
      <div className="text-muted-foreground mb-4">
        {t('events.noEventsFound')}
      </div>
      <Button variant="outline" onClick={onResetFilters}>
        {t('events.resetFilters')}
      </Button>
      <Button variant="outline" onClick={reloadPage} className="ml-2">
        {t('events.reloadPage')}
      </Button>
    </div>
  )
}