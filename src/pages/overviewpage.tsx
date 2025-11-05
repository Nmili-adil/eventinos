import StatCard from '@/components/partials/dashboardComponents/StatCard'
import { fetchEventsRequest } from '@/store/features/events/events.actions'
import { Calendar, CheckCircle, XCircle, Clock, Users } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch } from '@/store/app/store'
import type { RootState } from '@/store/app/rootReducer'
import type { Event } from '@/types/stateCard'
import { fetchUsersRequest } from '@/store/features/users/users.actions'
import CityDistributionBarChart from '@/components/charts/CityDistributionChart'
import GenderDistributionPieChart from '@/components/charts/GenderDistributionPieChart'
import EventsByDayBarChart from '@/components/charts/EventsByDayBarChart '



const Overviewpage = () => {
  const { events, count } = useSelector((state: RootState) => state.events)
  const { usersCount } = useSelector((state: RootState) => state.users)

  

  // Calculate real statistics from events data
  const stats = useMemo(() => {
    const acceptedEvents = events.filter((event: Event) => event.status === 'ACCEPTED').length
    const refusedEvents = events.filter((event: Event) => event.status === 'CLOSED').length
    const pendingEvents = events.filter((event: Event) => event.status === 'PENDING').length

  
    return {
      totalEvents: count,
      acceptedEvents,
      refusedEvents,
      pendingEvents,
      totalUsers: usersCount,
    }
  }, [events, count, usersCount])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Statistiques</h1>
        <p className="text-gray-600 mt-2">
          Vue d'ensemble de vos événements et utilisateurs
        </p>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {/* Total Events Card */}
        <StatCard
          title="Total Événements"
          value={stats.totalEvents}
          icon={Calendar}
          description="Tous les événements"
          variant="default"
        />

        {/* Accepted Events Card */}
        <StatCard
          title="Événements Acceptés"
          value={stats.acceptedEvents}
          icon={CheckCircle}
          description={stats.totalEvents > 0 ? `${((stats.acceptedEvents / stats.totalEvents) * 100).toFixed(1)}% du total` : 'Aucun événement'}
          variant="success"
        />

        {/* Refused Events Card */}
        <StatCard
          title="Événements Refusés"
          value={stats.refusedEvents}
          icon={XCircle}
          description={stats.totalEvents > 0 ? `${((stats.refusedEvents / stats.totalEvents) * 100).toFixed(1)}% du total` : 'Aucun événement'}
          variant="danger"
        />

        {/* Pending Events Card */}
        <StatCard
          title="Événements en Attente"
          value={stats.pendingEvents}
          icon={Clock}
          description={stats.totalEvents > 0 ? `${((stats.pendingEvents / stats.totalEvents) * 100).toFixed(1)}% du total` : 'Aucun événement'}
          variant="warning"
        />

        {/* Total Users Card */}
        <StatCard
          title="Utilisateurs"
          value={stats.totalUsers}
          icon={Users}
          description={stats.totalUsers > 0 ? `${stats.totalUsers} créateur${stats.totalUsers > 1 ? 's' : ''} d'événements` : 'Aucun utilisateur'}
          variant="info"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
          <CityDistributionBarChart />
          <GenderDistributionPieChart />
        
      </div>
      <div>
        <EventsByDayBarChart />
      </div>
    </div>
  )
}

export default Overviewpage