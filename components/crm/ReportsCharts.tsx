'use client'

import { useEffect, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { formatCOP } from '@/lib/utils'
import { TrendingUp, Target, Users, DollarSign } from 'lucide-react'
import { COLORS, STAGE_COLORS_HEX } from '@/lib/constants'

const SOURCE_COLORS = [COLORS.accent, '#3B82F6', '#F59E0B', '#10B981', '#F97316', '#8B5CF6']

interface ReportData {
  revenueChart: { mes: string; revenue: number; deals: number }[]
  sourcesChart: { source: string; count: number }[]
  stagesChart: { stage: string; count: number; value: number }[]
  summary: { total: number; cerrados: number; perdidos: number; conversionRate: number }
}

function CustomTooltipRevenue({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-brand-light rounded-lg p-3 text-xs shadow-sm">
      <p className="text-brand-muted mb-1">{label}</p>
      <p className="text-brand-accent font-semibold">{formatCOP(payload[0]?.value || 0)}</p>
      <p className="text-brand-muted">{payload[1]?.value || 0} deals</p>
    </div>
  )
}

function CustomTooltipBar({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-brand-light rounded-lg p-3 text-xs shadow-sm">
      <p className="text-brand-text mb-1">{label}</p>
      <p className="text-brand-muted">{payload[0]?.value} deals</p>
      <p className="text-brand-accent">{formatCOP(payload[0]?.payload?.value || 0)}</p>
    </div>
  )
}

export function ReportsCharts() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/reports')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-brand-muted text-sm">Cargando reportes...</p>
    </div>
  )

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-brand-light rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Target size={14} className="text-brand-muted" />
            <p className="text-brand-muted text-xs">Total deals</p>
          </div>
          <p className="text-brand-text text-2xl font-bold">{data.summary.total}</p>
        </div>
        <div className="bg-white border border-brand-light rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-green-600" />
            <p className="text-brand-muted text-xs">Tasa de cierre</p>
          </div>
          <p className="text-brand-text text-2xl font-bold">{data.summary.conversionRate}%</p>
        </div>
        <div className="bg-white border border-brand-light rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={14} className="text-brand-accent" />
            <p className="text-brand-muted text-xs">Cerrados</p>
          </div>
          <p className="text-brand-text text-2xl font-bold">{data.summary.cerrados}</p>
        </div>
        <div className="bg-white border border-brand-light rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users size={14} className="text-brand-muted" />
            <p className="text-brand-muted text-xs">Perdidos</p>
          </div>
          <p className="text-brand-text text-2xl font-bold">{data.summary.perdidos}</p>
        </div>
      </div>

      {/* Revenue por mes */}
      <div className="bg-white border border-brand-light rounded-lg p-6">
        <h3 className="text-brand-text font-semibold mb-4">Revenue cerrado por mes</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data.revenueChart}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="mes" tick={{ fill: COLORS.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
            <Tooltip content={<CustomTooltipRevenue />} />
            <Area type="monotone" dataKey="revenue" stroke={COLORS.accent} strokeWidth={2} fill="url(#revenueGrad)" />
            <Area type="monotone" dataKey="deals" stroke="#3B82F6" strokeWidth={1.5} fill="transparent" strokeDasharray="4 4" />
          </AreaChart>
        </ResponsiveContainer>
        <p className="text-brand-muted text-xs mt-2">Línea azul oscuro: revenue — Línea azul claro: cantidad de deals</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Distribución por etapa */}
        <div className="bg-white border border-brand-light rounded-lg p-6">
          <h3 className="text-brand-text font-semibold mb-4">Deals por etapa</h3>
          {data.stagesChart.length === 0 ? (
            <p className="text-brand-muted text-sm">Sin datos todavía</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.stagesChart} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                <XAxis type="number" tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="stage" type="category" tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} width={100}
                  tickFormatter={(v) => v.replace('_', ' ')} />
                <Tooltip content={<CustomTooltipBar />} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {data.stagesChart.map((entry, index) => (
                    <Cell key={index} fill={STAGE_COLORS_HEX[entry.stage] || COLORS.muted} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Fuentes de leads */}
        <div className="bg-white border border-brand-light rounded-lg p-6">
          <h3 className="text-brand-text font-semibold mb-4">Fuentes de leads</h3>
          {data.sourcesChart.length === 0 ? (
            <p className="text-brand-muted text-sm">Sin datos todavía</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data.sourcesChart}
                  dataKey="count"
                  nameKey="source"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={3}
                >
                  {data.sourcesChart.map((_, index) => (
                    <Cell key={index} fill={SOURCE_COLORS[index % SOURCE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: COLORS.text }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span style={{ color: COLORS.muted, fontSize: '12px' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
