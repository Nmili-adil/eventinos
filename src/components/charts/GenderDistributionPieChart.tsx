import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface GenderData {
  name: string
  value: number
  percentage: number
  color: string
}

interface GenderDistributionPieChartProps {
  data: any[]
  isLoading: boolean
}

// Gender colors - you can customize these
const GENDER_COLORS: { [key: string]: string } = {
  'Homme': '#0088FE', // Blue
  'Femme': '#FF69B4', // Pink
  'homme': '#0088FE',
  'femme': '#FF69B4',
  'Male': '#0088FE',
  'Female': '#FF69B4',
  'Autre': '#FFBB28', // Yellow for other genders
  'autre': '#FFBB28',
  'Other': '#FFBB28'
}

const DEFAULT_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
        <p className="font-semibold text-gray-900">{data.name}</p>
        <p className="text-sm text-gray-600">
          {data.value.toLocaleString()} utilisateurs
        </p>
        <p className="text-sm text-gray-600">
          {data.percentage}% du total
        </p>
      </div>
    )
  }
  return null
}

const renderLegend = (props: any) => {
  const { payload } = props

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={`legend-${index}`} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-600">{entry.value}</span>
          <span className="text-sm font-medium text-gray-900">
            {entry.payload.percentage}%
          </span>
        </div>
      ))}
    </div>
  )
}

export default function GenderDistributionPieChart({ data, isLoading }: GenderDistributionPieChartProps) {
  const [genderData, setGenderData] = useState<GenderData[]>([])
  
  useEffect(() => {
    console.log('Gender Chart - Received data:', data)
    if (data && Array.isArray(data)) {
      const totalCount = data.reduce((sum: number, item: any) => sum + item.count, 0)
      
      const formattedData = data.map((item: any, index: number) => {
        const genderName = item.gender
        const percentage = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0
        
        return {
          name: genderName,
          value: item.count,
          percentage: percentage,
          color: GENDER_COLORS[genderName] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
        }
      })
      
      console.log('Gender Chart - Formatted data:', formattedData)
      setGenderData(formattedData)
    } else {
      console.log('Gender Chart - No valid data')
    }
  }, [data])

  if (isLoading) {
    return (
      <Card className="w-full border-slate-200">
        <CardContent className="h-80 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Chargement des données...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalUsers = genderData.reduce((acc, gender) => acc + gender.value, 0)

  return (
    <Card className="w-full border-slate-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Répartition par genre</CardTitle>
        <CardDescription>
          Distribution des utilisateurs par genre
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          {genderData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" className="my-4">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                //   label={({ percentage }) => `${percentage}%`}
                  outerRadius={120}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
          
                >
                  {genderData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={renderLegend} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">Aucune donnée disponible</p>
            </div>
          )}
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {totalUsers.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Total utilisateurs</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {genderData.length}
            </p>
            <p className="text-sm text-gray-600">Genres</p>
          </div>
        </div>

        {/* Detailed breakdown */}
        {/* <div className="mt-6 space-y-3">
          <h4 className="font-semibold text-gray-900 text-center mb-4">Détail par genre</h4>
          <div className="space-y-2">
            {genderData.map((gender) => (
              <div 
                key={gender.name}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: gender.color }}
                  />
                  <span className="text-sm font-medium text-gray-900">
                    {gender.name}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {gender.value.toLocaleString()} <span className="text-gray-500">({gender.percentage}%)</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div> */}
      </CardContent>
    </Card>
  )
}