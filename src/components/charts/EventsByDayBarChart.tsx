import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Label } from 'recharts'
import { useTranslation } from 'react-i18next'
import { TrendingUp } from 'lucide-react'

interface EventByDayData {
  date: string
  fullDate?: string
  count: number
}

interface EventsByDayBarChartProps {
  data: any[]
  isLoading: boolean
}

const CustomTooltip = ({ active, payload }: any) => {
  const { t } = useTranslation()
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const dayMap: { [key: string]: string } = {
      'lu': t('dashboard.eventsByDayChart.days.lu'),
      'ma': t('dashboard.eventsByDayChart.days.ma'), 
      'me': t('dashboard.eventsByDayChart.days.me'),
      'je': t('dashboard.eventsByDayChart.days.je'),
      've': t('dashboard.eventsByDayChart.days.ve'),
      'sa': t('dashboard.eventsByDayChart.days.sa'),
      'di': t('dashboard.eventsByDayChart.days.di')
    }
    const dayAbbreviation = data.date.split('.')[0]
    const fullDayName = dayMap[dayAbbreviation] || data.date
    
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900">{fullDayName}</p>
        {data.fullDate && (
          <p className="text-xs text-gray-500 mb-1">{data.fullDate}</p>
        )}
        <p className="text-sm text-blue-600 font-medium">
          {data.count} {t('dashboard.eventsByDayChart.events')}
        </p>
      </div>
    )
  }
  return null
}

export default function EventsByDayBarChart({ data, isLoading }: EventsByDayBarChartProps) {
  const { t } = useTranslation()
  const [eventsData, setEventsData] = useState<EventByDayData[]>([])
  
  useEffect(() => {
    if (data && Array.isArray(data)) {
      setEventsData(data)
    }
  }, [data])

  if (isLoading) {
    return (
      <Card className="w-full border-slate-200">
        <CardContent className="h-64 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 text-sm">{t('dashboard.eventsByDayChart.loading')}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalEvents = eventsData.reduce((acc, day) => acc + day.count, 0)
  const avgEvents = eventsData.length > 0 ? (totalEvents / eventsData.length).toFixed(1) : 0

  return (
    <Card className="w-full border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          {t('dashboard.eventsByDayChart.title')}
          <TrendingUp className="w-4 h-4 text-blue-600" />
        </CardTitle>
        <CardDescription>
          {t('dashboard.eventsByDayChart.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 min-h-[320px]">
          <ResponsiveContainer width="100%" height="100%" minHeight={320}>
            <LineChart
              data={eventsData}
              margin={{ top: 20, right: 30, left: 0, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickMargin={10}
              >
                <Label 
                  value={t('dashboard.eventsByDayChart.xAxisLabel', 'Days')} 
                  offset={-10} 
                  position="insideBottom" 
                  style={{ fontSize: 12, fill: '#666' }}
                />
              </XAxis>
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickMargin={10}
              >
                <Label 
                  value={t('dashboard.eventsByDayChart.yAxisLabel', 'Events')} 
                  angle={-90} 
                  position="insideLeft" 
                  style={{ fontSize: 12, fill: '#666', textAnchor: 'middle' }}
                />
              </YAxis>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={36}
                iconType="line"
                wrapperStyle={{ fontSize: 12 }}
              />
              <Line 
                type="monotone"
                dataKey="count" 
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6', r: 4 }}
                activeDot={{ r: 6, fill: '#2563EB' }}
                name={t('dashboard.eventsByDayChart.eventsLabel', 'Events')}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Statistics Summary */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {totalEvents.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">{t('dashboard.eventsByDayChart.totalEvents', 'Total Events')}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {avgEvents}
            </p>
            <p className="text-sm text-gray-600">{t('dashboard.eventsByDayChart.avgPerDay', 'Avg per Day')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}