import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { RootState } from '@/store/app/rootReducer'
import type { AppDispatch } from '@/store/app/store'
import { fetchAnalyticsRequest } from '@/store/features/analytics/analytics.actions'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface EventByDayData {
  date: string
  count: number
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const dayMap: { [key: string]: string } = {
      'lu': 'Lundi',
      'ma': 'Mardi', 
      'me': 'Mercredi',
      'je': 'Jeudi',
      've': 'Vendredi',
      'sa': 'Samedi',
      'di': 'Dimanche'
    }
    const dayAbbreviation = data.date.split('.')[0]
    const fullDayName = dayMap[dayAbbreviation] || data.date
    
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
        <p className="font-semibold text-gray-900">{fullDayName}</p>
        <p className="text-sm text-gray-600">
          {data.count} événements
        </p>
      </div>
    )
  }
  return null
}

export default function EventsByDayBarChart() {
  const [eventsData, setEventsData] = useState<EventByDayData[]>([])
  const { statistics, isLoading } = useSelector((state: RootState) => state.analytics)
  const dispatch = useDispatch<AppDispatch>()
  
  useEffect(() => {
    dispatch(fetchAnalyticsRequest())
  }, [dispatch])

  useEffect(() => {
    if (statistics.byDates && Array.isArray(statistics.byDates)) {
      setEventsData(statistics.byDates)
    }
  }, [statistics.byDates])

  if (isLoading) {
    return (
      <Card className="w-full border-slate-200">
        <CardContent className="h-64 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 text-sm">Chargement...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalEvents = eventsData.reduce((acc, day) => acc + day.count, 0)

  return (
    <Card className="w-full border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Nombre d'événements</CardTitle>
        <CardDescription>
          Semaine
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={eventsData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="count" 
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Simple total */}
        <div className="text-center mt-4 pt-4 border-t border-gray-100">
          <p className="text-2xl font-bold text-blue-600">
            {totalEvents.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">Événements cette semaine</p>
        </div>
      </CardContent>
    </Card>
  )
}