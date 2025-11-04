import { fetchAnalyticsRequest } from '@/store/features/analytics/analytics.actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { RootState } from '@/store/app/rootReducer'
import type { AppDispatch } from '@/store/app/store'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface CityData {
  name: string
  users: number
  percentage: number
  color: string
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
        <p className="font-semibold text-gray-900">{data.name}</p>
        <p className="text-sm text-gray-600">
          {data.users.toLocaleString()} utilisateurs
        </p>
        <p className="text-sm text-gray-600">
          {data.percentage}% du total
        </p>
      </div>
    )
  }
  return null
}

export default function CityDistributionBarChart() {
  const [cityData, setCityData] = useState<CityData[]>([])
  const { statistics, isLoading } = useSelector((state: RootState) => state.analytics)
  const dispatch = useDispatch<AppDispatch>()
  
  useEffect(() => {
    dispatch(fetchAnalyticsRequest())
  }, [dispatch])

  useEffect(() => {
    if (statistics.byCity) {
      // Ensure the data has the correct structure
      const formattedData = statistics.byCity.map((city: any) => ({
        name: city.name || city.city,
        users: city.users || city.count,
        percentage: city.percentage || 0,
        color: city.color || '#0088FE'
      }))
      setCityData(formattedData)
    }
  }, [statistics.byCity])

  if (isLoading) {
    return (
      <Card className="w-full border-slate-200">
        <CardContent className="h-80 flex items-center justify-center">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p>Chargement des données...</p>
        </CardContent>
      </Card>
    )
  }

  const totalUsers = cityData.reduce((acc, city) => acc + city.users, 0)
  const averageUsers = cityData.length > 0 ? Math.round(totalUsers / cityData.length) : 0

  return (
    <Card className="w-full border-slate-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Répartition par ville</CardTitle>
        <CardDescription>
          Nombre d'utilisateurs par ville
        </CardDescription>
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
                    value: 'Utilisateurs', 
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
              <p className="text-gray-500">Aucune donnée disponible</p>
            </div>
          )}
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {totalUsers.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Total utilisateurs</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {cityData.length}
            </p>
            <p className="text-sm text-gray-600">Villes actives</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {averageUsers.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Moyenne par ville</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}