import type { LucideIcon } from "lucide-react"
import type { EventStatus } from "@/constants/eventStatuses"

export interface StatCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

export interface Event {
  _id: string
  status: EventStatus
  createdBy?: {
    _id: string
    firstName: string
    lastName: string
  }
  [key: string]: unknown
}