'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import type { DashboardMonthlyRevenue } from '@/types'

const NL_MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mrt',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Okt',
  'Nov',
  'Dec',
] as const

function getLast6Months(): Array<{ maand: string; maand_kort: string }> {
  const months: Array<{ maand: string; maand_kort: string }> = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const maand = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const maand_kort = NL_MONTHS_SHORT[date.getMonth()]
    months.push({ maand, maand_kort })
  }
  return months
}

interface RevenueChartProps {
  data: DashboardMonthlyRevenue[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  const chartData = useMemo(() => {
    const omzetByMaand = new Map<string, number>()
    for (const row of data) {
      omzetByMaand.set(row.maand, Number(row.omzet) || 0)
    }
    return getLast6Months().map(({ maand, maand_kort }) => ({
      maand,
      maand_kort,
      omzet: omzetByMaand.get(maand) ?? 0,
    }))
  }, [data])

  return (
    <section className="rounded-card shadow-card bg-invora-surface p-5 md:p-6">
      <h2 className="text-invora-text mb-4 text-base font-semibold">
        Omzet afgelopen 6 maanden
      </h2>
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="invora-bar-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7B9E87" stopOpacity={1} />
                <stop offset="100%" stopColor="#5E8A6E" stopOpacity={1} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="maand_kort"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <YAxis hide />
            <Tooltip
              cursor={{ fill: 'rgba(123, 158, 135, 0.08)' }}
              content={<CustomTooltip />}
            />
            <Bar
              dataKey="omzet"
              fill="url(#invora-bar-gradient)"
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; payload: { maand_kort: string } }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-md bg-white p-3 text-sm shadow-card">
      <p className="text-invora-text font-medium">{label}</p>
      <p className="text-invora-primary">{formatCurrency(payload[0].value)}</p>
    </div>
  )
}
