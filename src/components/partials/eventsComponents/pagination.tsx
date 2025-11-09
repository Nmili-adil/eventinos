import { Button } from '@/components/ui/button'
import type { PaginationProps } from '@/types/eventsTypes'
import { ChevronLeft, ChevronRight } from 'lucide-react'


export function EventsPagination({ pagination, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(pagination.totalItems / pagination.pageSize)
  
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        {pagination.totalItems} événement{pagination.totalItems !== 1 ? 's' : ''} trouvé{pagination.totalItems !== 1 ? 's' : ''}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={page === pagination.currentPage ? "default" : "outline"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === totalPages}
          className=''
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}