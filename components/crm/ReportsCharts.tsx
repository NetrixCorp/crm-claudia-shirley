'use client'

import { useEffect, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { formatCOP } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus, Target, Users, DollarSign, CheckCircle2 } from 'lucide-react'
import { COLORS, STAGE_COLORS_HEX, DEAL_STAGES } from '@/lib/constants'

const SOURCE_COLORS = [COLORS.accent, '#3B82F6', '#F59E0B', '#10B981', '#F97316', '#8B5CF6']

interface Kpis {
  dealsCreatedThisMonth: number
  dealsCreatedChange: number | null
  revenuePipeline: number
  revenuePipelineChange: number | null
  conversionRate: number
  conversionRateChange: number | null
  dealsCerradosThisMonth: number
  dealsCerradosChange: number | null
}

interface ReportData {
  revenueChart: { mes: string; revenue: number; deals: number }[]
  conversionByMonth: { mes: string; rate: number }[]
  sourcesChart: { source: string; count: number }[]
  stagesChart: { stage: string; count: number; value: number }[]
  topDeals: { id: string; title: string; contactName: string; valueCop: number; stage: string }[]
  kpis: Kpis
  summary: { total: number; cerrados: number; perdidos: number; conversionRate: number }
}

function stageLabel(stageId: string): string {
  return DEAL_STAGES.find((s) => s.id === stageId)?.label ?? stageId
}

function ChangeBadge({ change }: { change: number | null }) {
  if (change === null) {
    return <span className="text-xs text-slate-400 flex items-center gap-1"><Minus size={12} /> sin datos del mes anterior</span>
  }
  if (change > 0) {
    return <span className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1"><TrendingUp size={12} /> +{change}% vs mes anterior</span>
  }
  if (change < 0) {
    return <span className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1"><TrendingDown size={12} /> {change}% vs mes anterior</span>
  }
  return <span className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1"><Minus size={12} /> sin cambios</span>
}

function KpiCard({ icon: Icon, label, value, change }: { icon: any; label: string; value: string; change: number | null }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className="text-slate-400" />
        <p className="text-slate-500 dark:text-slate-400 text-xs">{label}</p>
      </div>
      <p className="text-slate-900 dark:text-white text-2xl font-bold">{value}</p>
      <div className="mt-1"><ChangeBadge change={change} /></div>
    </div>
  )
}

function CustomTooltipRevenue({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-xs shadow-sm">
      <p className="text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      <p className="text-brand-accent font-semibold">{formatCOP(payload[0]?.value || 0)}</p>
      <p className="text-slate-500 dark:text-slate-400">{payload[1]?.value || 0} deals</p>
    </div>
  )
}

function CustomTooltipBar({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-xs shadow-sm">
      <p className="text-slate-900 dark:text-white mb-1">{label}</p>
      <p className="text-slate-500 dark:text-slate-400">{payload[0]?.value} deals</p>
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
      <p className="text-slate-500 text-sm">Cargando reportes...</p>
    </div>
  )

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard icon={Target} label="Deals creados este mes" value={String(data.kpis.dealsCreatedThisMonth)} change={data.kpis.dealsCreatedChange} />
        <KpiCard icon={DollarSign} label="Revenue pipeline" value={formatCOP(data.kpis.revenuePipeline)} change={data.kpis.revenuePipelineChange} />
        <KpiCard icon={Users} label="Tasa de conversión (mes)" value={`${data.kpis.conversionRate}%`} change={data.kpis.conversionRateChange} />
        <KpiCard icon={CheckCircle2} label="Deals cerrados este mes" value={String(data.kpis.dealsCerradosThisMonth)} change={data.kpis.dealsCerradosChange} />
      </div>

      {/* Gráficas principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
          <h3 className="text-slate-900 dark:text-white font-semibold mb-4">Deals por etapa</h3>
          {data.stagesChart.length === 0 ? (
            <p className="text-slate-500 text-sm">Sin datos todavía</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.stagesChart} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                <XAxis type="number" tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="stage" type="category" tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} width={90}
                  tickFormatter={(v) => stageLabel(v)} />
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

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
          <h3 className="text-slate-900 dark:text-white font-semibold mb-4">Revenue pipeline por etapa</h3>
          {data.stagesChart.length === 0 ? (
            <p className="text-slate-500 text-sm">Sin datos todavía</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.stagesChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="stage" tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => stageLabel(v)} />
                <YAxis tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(v) => formatCOP(Number(v))} labelFormatter={(v) => stageLabel(String(v))} />
                <Line type="monotone" dataKey="value" stroke={COLORS.accent} strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
          <h3 className="text-slate-900 dark:text-white font-semibold mb-4">Tasa de conversión por mes</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.conversionByMonth}>
              <defs>
                <linearGradient id="conversionGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="mes" tick={{ fill: COLORS.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Area type="monotone" dataKey="rate" stroke={COLORS.accent} strokeWidth={2} fill="url(#conversionGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
          <h3 className="text-slate-900 dark:text-white font-semibold mb-4">Top 5 deals por valor</h3>
          {data.topDeals.length === 0 ? (
            <p className="text-slate-500 text-sm">Sin datos todavía</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.topDeals} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                <XAxis type="number" tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
                <YAxis dataKey="title" type="category" tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                <Tooltip formatter={(v) => formatCOP(Number(v))} />
                <Bar dataKey="valueCop" fill={COLORS.accent} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Gráficas complementarias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
          <h3 className="text-slate-900 dark:text-white font-semibold mb-4">Revenue cerrado por mes</h3>
          <ResponsiveContainer width="100%" height={200}>
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
          <p className="text-slate-500 text-xs mt-2">Línea azul oscuro: revenue — Línea azul claro: cantidad de deals</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
          <h3 className="text-slate-900 dark:text-white font-semibold mb-4">Fuentes de leads</h3>
          {data.sourcesChart.length === 0 ? (
            <p className="text-slate-500 text-sm">Sin datos todavía</p>
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
