import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useTranslation } from 'react-i18next'

interface CityData {
  name: string
  users: number
  percentage: number
  color: string
}

interface CityDistributionBarChartProps {
  data: any[]
  isLoading: boolean
  dateRangeLabel?: string
}

const CustomTooltip = ({ active, payload }: any) => {
  const { t } = useTranslation()
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
        <p className="font-semibold text-gray-900">{data.name}</p>
        <p className="text-sm text-gray-600">
          {data.users.toLocaleString()} {t('dashboard.cityChart.users')}
        </p>
        <p className="text-sm text-gray-600">
          {data.percentage}{t('dashboard.cityChart.ofTotal')}
        </p>
      </div>
    )
  }
  return null
}

export default function CityDistributionBarChart({ data, isLoading, dateRangeLabel }: CityDistributionBarChartProps) {
  const { t } = useTranslation()
  const [cityData, setCityData] = useState<CityData[]>([])
  
  useEffect(() => {
    console.log('City Chart - Received data:', data)
    if (data && Array.isArray(data)) {
      // Ensure the data has the correct structure
      const formattedData = data.map((city: any) => ({
        name: city.name || city.city,
        users: city.users || city.count,
        percentage: city.percentage || 0,
        color: city.color || '#0088FE'
      }))
      console.log('City Chart - Formatted data:', formattedData)
      setCityData(formattedData)
    } else {
      console.log('City Chart - No valid data')
    }
  }, [data])

  if (isLoading) {
    return (
      <Card className="w-full border-slate-200">
        <CardContent className="h-80 flex items-center justify-center">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p>{t('dashboard.cityChart.loading')}</p>
        </CardContent>
      </Card>
    )
  }

  const totalUsers = cityData.reduce((acc, city) => acc + city.users, 0)
  const averageUsers = cityData.length > 0 ? Math.round(totalUsers / cityData.length) : 0

  return (
    <Card className="w-full border-slate-200">
      <CardHeader className="pb-4 space-y-2">
        <CardTitle className="text-lg font-semibold">{t('dashboard.cityChart.title')}</CardTitle>
        <CardDescription>
          {t('dashboard.cityChart.description')}
        </CardDescription>
        {dateRangeLabel && (
          <Badge variant="outline" className="w-fit">
            {dateRangeLabel}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {cityData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={cityData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  label={{ 
                    value: t('dashboard.cityChart.users'), 
                    angle: -90, 
                    position: 'insideLeft',
                    offset: -10,
                    style: { textAnchor: 'middle' }
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="users" 
                  radius={[4, 4, 0, 0]}
                >
                  {cityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">{t('dashboard.cityChart.noData')}</p>
            </div>
          )}
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {totalUsers.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">{t('dashboard.cityChart.totalUsers')}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {cityData.length}
            </p>
            <p className="text-sm text-gray-600">{t('dashboard.cityChart.activeCities')}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {averageUsers.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">{t('dashboard.cityChart.averagePerCity')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}