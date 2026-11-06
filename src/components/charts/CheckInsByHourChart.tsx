import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CheckInsByHourChartProps {
  data: { hour: string; count: number }[]
}

const ChartTooltip = ({ active, payload, label }: any) => {
  const { t } = useTranslation()
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
      <p className="font-semibold text-gray-900">{label}</p>
      <p className="text-sm text-gray-600">
        {t('events.attendance.chartTooltip', { count: payload[0].value })}
      </p>
    </div>
  )
}

export default function CheckInsByHourChart({ data }: CheckInsByHourChartProps) {
  const { t } = useTranslation()

  return (
    <Card className="w-full border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{t('events.attendance.chartTitle')}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {t('events.attendance.chartEmpty')}
          </p>
        ) : (
          <>
            <div className="h-64" aria-hidden="true">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="hour" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickMargin={8} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f1f5f9' }} />
                  <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <table className="sr-only">
              <caption>{t('events.attendance.chartTitle')}</caption>
              <tbody>
                {data.map(({ hour, count }) => (
                  <tr key={hour}>
                    <th scope="row">{hour}</th>
                    <td>{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </CardContent>
    </Card>
  )
}
