import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Eye, Edit, Trash2, Award } from 'lucide-react'
import DeleteConfirmationDialog from '@/components/shared/DeleteConfirmationDialog'
import BadgeDetailsPopup from './badgeDetailsPopup'

interface Badge {
  _id: string
  name: string
  description: string
  design: string
  image: string
  createdAt?: string
  updatedAt?: string
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

interface BadgesTableProps {
  data: Badge[]
  pagination?: PaginationInfo
  onPageChange?: (page: number) => void
  onEdit?: (badge: Badge) => void
  onDelete?: (badge: Badge) => void
}

const BadgesTable = ({ data, pagination, onPageChange, onEdit, onDelete }: BadgesTableProps) => {
  const { t } = useTranslation()
  const [badges, setBadges] = useState<Badge[]>(data)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)
  const [badgeToDelete, setBadgeToDelete] = useState<Badge | null>(null)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleView = (badge: Badge) => {
    setSelectedBadge(badge)
    setIsPopupOpen(true)
  }

  const handleEdit = (badge: Badge) => {
    console.log('Edit badge:', badge)
    onEdit?.(badge)
  }

  const handleDeleteClick = (badge: Badge) => {
    setBadgeToDelete(badge)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!badgeToDelete) return

    setIsDeleting(true)
    try {
      // Call the parent's delete handler
      await onDelete?.(badgeToDelete)
      
      // Remove from local state
      setBadges(badges.filter(b => b._id !== badgeToDelete._id))
      
      // Close dialog
      setIsDeleteDialogOpen(false)
      setBadgeToDelete(null)
    } catch (error) {
      console.error('Error deleting badge:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false)
    setBadgeToDelete(null)
  }

  const handleClosePopup = () => {
    setIsPopupOpen(false)
    setSelectedBadge(null)
  }

  const handleImageError = (badgeId: string) => {
    setImageErrors(prev => new Set(prev).add(badgeId))
  }

  const isInvalidImage = (badge: Badge) => {
    return !badge.image || 
           imageErrors.has(badge._id) || 
           badge.image.includes('example.com') ||
           badge.image === 'null' ||
           badge.image === 'undefined'
  }

  const getFallbackContent = (badge: Badge) => {
    if (isInvalidImage(badge)) {
      return (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center border">
          <Award className="h-5 w-5 text-blue-500" />
        </div>
      )
    }
    
    return (
      <img 
        src={badge.image} 
        alt={badge.name}
        className="w-10 h-10 rounded-full object-cover border"
        onError={() => handleImageError(badge._id)}
        loading="lazy"
      />
    )
  }

  // ... (pagination functions remain the same)

  return (
    <>
      <div className="space-y-4">
        <div className="border rounded-lg border-slate-300">
          <Table className='divide-slate-300'>
            <TableHeader>
              <TableRow>
                <TableHead>{t('badges.table.id')}</TableHead>
                <TableHead>{t('badges.table.image')}</TableHead>
                <TableHead>{t('badges.table.name')}</TableHead>
                <TableHead>{t('badges.table.description')}</TableHead>
                <TableHead>{t('badges.table.design')}</TableHead>
                <TableHead className="text-right">{t('badges.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className='divide-slate-300'>
              {badges.map((badge) => (
                <TableRow key={badge._id}>
                  <TableCell>
                    <span className="text-xs text-gray-500 font-mono">{badge._id.slice(-8)}</span>
                  </TableCell>
                  <TableCell>
                    {getFallbackContent(badge)}
                  </TableCell>
                  <TableCell className="font-medium">{badge.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      {badge.description}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {badge.design}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleView(badge)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(badge)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteClick(badge)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination (same as before) */}
      </div>

      {/* Badge Details Popup */}
      <BadgeDetailsPopup
        badge={selectedBadge}
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        onEdit={onEdit}
        onDelete={handleDeleteClick}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={t('badges.table.deleteTitle')}
        description={t('badges.table.deleteDescription')}
        itemName={badgeToDelete?.name || ''}
        isLoading={isDeleting}
      />
    </>
  )
}

export default BadgesTable