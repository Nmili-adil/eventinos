import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { useTranslation } from 'react-i18next'

interface GenderData {
  [key: string]: any;
  name: string
  value: number
  percentage: number
  color: string
  translatedName: string
}

interface GenderDistributionPieChartProps {
  data: any[]
  isLoading: boolean
  dateRangeLabel?: string
}

type CanonicalGender = 'Male' | 'Female' | 'Other' | 'Unknown'

// The backend has sent enums (MALE), English and French labels (Homme), and null.
const GENDER_ALIASES: Record<string, CanonicalGender> = {
  male: 'Male',
  homme: 'Male',
  m: 'Male',
  female: 'Female',
  femme: 'Female',
  f: 'Female',
  other: 'Other',
  autre: 'Other',
}

const toCanonicalGender = (value: unknown): CanonicalGender | null => {
  if (value === null || value === undefined || String(value).trim() === '') return 'Unknown'
  return GENDER_ALIASES[String(value).trim().toLowerCase()] ?? null
}

// Gender colors - consistent across languages
const GENDER_COLORS: Record<CanonicalGender, string> = {
  Male: '#0088FE', // Blue
  Female: '#FF69B4', // Pink
  Other: '#FFBB28', // Yellow for other genders
  Unknown: '#94A3B8', // Slate
}

const DEFAULT_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

interface TooltipProps {
  active?: boolean
  payload?: any[]
}

// Custom Tooltip Component with i18n
const CustomTooltip = ({ active, payload }: TooltipProps) => {
  const { t } = useTranslation()
  
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm z-50">
        <p className="font-semibold text-gray-900">{data.translatedName}</p>
        <p className="text-sm text-gray-600">
          {data.value.toLocaleString()} {t('dashboard.genderChart.users')}
        </p>
        <p className="text-sm text-gray-600">
          {data.percentage}% {t('dashboard.genderChart.ofTotal')}
        </p>
      </div>
    )
  }
  return null
}

interface LegendProps {
  payload?: readonly any[]
}

// Legend component with i18n
const RenderLegend = (props: LegendProps) => {
  const { t } = useTranslation()
  const { payload } = props

  if (!payload) return null

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={`legend-${index}`} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-600">{entry.payload.translatedName}</span>
          <span className="text-sm font-medium text-gray-900">
            {entry.payload.percentage}%
          </span>
        </div>
      ))}
    </div>
  )
}

export default function GenderDistributionPieChart({ 
  data, 
  isLoading,
  dateRangeLabel,
}: GenderDistributionPieChartProps) {
  const [genderData, setGenderData] = useState<GenderData[]>([])
  const { t, i18n } = useTranslation()
  
  useEffect(() => {
    if (data && Array.isArray(data)) {
      const counts = data.map((item: any) => Number(item?.count) || 0)
      const totalCount = counts.reduce((sum, count) => sum + count, 0)

      const formattedData = data.map((item: any, index: number) => {
        const rawGender = item?.gender
        const canonical = toCanonicalGender(rawGender)
        const count = counts[index]
        const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0
        const translatedName = canonical
          ? t(`dashboard.genderChart.genderNames.${canonical}`, { defaultValue: canonical })
          : String(rawGender)

        return {
          name: canonical ?? String(rawGender),
          value: count,
          percentage: percentage,
          color: (canonical && GENDER_COLORS[canonical]) || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
          translatedName: translatedName
        }
      })
      
      setGenderData(formattedData)
    }
  }, [data, t, i18n.language]) // Re-run when language changes

  if (isLoading) {
    return (
      <Card className="w-full border-slate-200">
        <CardContent className="h-80 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">{t('dashboard.genderChart.loading')}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalUsers = genderData.reduce((acc, gender) => acc + gender.value, 0)

  return (
    <Card className="w-full border-slate-200">
      <CardHeader className="pb-4 space-y-2">
        <CardTitle className="text-lg font-semibold">
          {t('dashboard.genderChart.title')}
        </CardTitle>
        <CardDescription>
          {t('dashboard.genderChart.description')}
        </CardDescription>
        {dateRangeLabel && (
          <Badge variant="outline" className="w-fit">
            {dateRangeLabel}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-72 min-h-[288px]">
          {genderData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" minHeight={288} initialDimension={{ width: 1, height: 288 }}>
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
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
                <Legend content={RenderLegend} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">{t('dashboard.genderChart.noData')}</p>
            </div>
          )}
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {totalUsers.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">{t('dashboard.genderChart.totalUsers')}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {genderData.length}
            </p>
            <p className="text-sm text-gray-600">{t('dashboard.genderChart.genders')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}