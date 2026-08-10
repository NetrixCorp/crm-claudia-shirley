'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowUpDown, Download } from 'lucide-react'
import { formatCOP, formatDate } from '@/lib/utils'
import { DEAL_STAGES } from '@/lib/constants'

interface DealRow {
  id: string
  title: string
  valueCop: number
  stage: string
  createdAt: string
  contact: { name: string } | null
}

type SortKey = 'title' | 'contact' | 'valueCop' | 'stage' | 'createdAt'

function stageLabel(stageId: string): string {
  return DEAL_STAGES.find((s) => s.id === stageId)?.label ?? stageId
}

function toCsvValue(value: string | number): string {
  const str = String(value)
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
}

export function ReportsTable() {
  const [deals, setDeals] = useState<DealRow[]>([])
  const [loading, setLoading] = useState(true)
  const [stageFilter, setStageFilter] = useState('ALL')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetch('/api/deals')
      .then((r) => r.json())
      .then((data) => { setDeals(data); setLoading(false) })
  }, [])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const filtered = useMemo(() => {
    return deals.filter((d) => {
      if (stageFilter !== 'ALL' && d.stage !== stageFilter) return false
      if (dateFrom && d.createdAt.slice(0, 10) < dateFrom) return false
      if (dateTo && d.createdAt.slice(0, 10) > dateTo) return false
      return true
    })
  }, [deals, stageFilter, dateFrom, dateTo])

  const sorted = useMemo(() => {
    const rows = [...filtered]
    const dir = sortDir === 'asc' ? 1 : -1
    rows.sort((a, b) => {
      switch (sortKey) {
        case 'title':
          return a.title.localeCompare(b.title) * dir
        case 'contact':
          return (a.contact?.name ?? '').localeCompare(b.contact?.name ?? '') * dir
        case 'valueCop':
          return (a.valueCop - b.valueCop) * dir
        case 'stage':
          return stageLabel(a.stage).localeCompare(stageLabel(b.stage)) * dir
        case 'createdAt':
          return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir
        default:
          return 0
      }
    })
    return rows
  }, [filtered, sortKey, sortDir])

  function exportCsv() {
    const header = ['Nombre', 'Contacto', 'Valor', 'Etapa', 'Fecha']
    const rows = sorted.map((d) => [
      d.title,
      d.contact?.name ?? '—',
      d.valueCop,
      stageLabel(d.stage),
      formatDate(d.createdAt),
    ])
    const csv = [header, ...rows].map((row) => row.map(toCsvValue).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `deals-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const COLUMNS: { key: SortKey; label: string }[] = [
    { key: 'title', label: 'Nombre' },
    { key: 'contact', label: 'Contacto' },
    { key: 'valueCop', label: 'Valor' },
    { key: 'stage', label: 'Etapa' },
    { key: 'createdAt', label: 'Fecha' },
  ]

  return (
    <div className="border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-md"
          >
            <option value="ALL">Todas las etapas</option>
            {DEAL_STAGES.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            title="Desde"
            className="px-3 py-1.5 text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
          <span className="text-slate-500 text-sm">a</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            title="Hasta"
            className="px-3 py-1.5 text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
        </div>
        <button
          onClick={exportCsv}
          disabled={sorted.length === 0}
          className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
        >
          <Download size={14} /> Exportar CSV
        </button>
      </div>

      {loading ? (
        <p className="text-slate-500 text-sm p-4">Cargando...</p>
      ) : sorted.length === 0 ? (
        <p className="text-slate-500 text-sm p-4">No hay deals que coincidan con el filtro.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 font-semibold text-slate-900 dark:text-white text-left">
                {COLUMNS.map((col) => (
                  <th key={col.key} className="p-3">
                    <button
                      onClick={() => toggleSort(col.key)}
                      className="flex items-center gap-1 hover:text-brand-accent transition-colors"
                    >
                      {col.label}
                      <ArrowUpDown size={12} className={sortKey === col.key ? 'opacity-100' : 'opacity-30'} />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((d) => (
                <tr
                  key={d.id}
                  className="border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <td className="p-3 font-medium">{d.title}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{d.contact?.name ?? '—'}</td>
                  <td className="p-3 text-brand-accent font-semibold">{formatCOP(d.valueCop)}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{stageLabel(d.stage)}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{formatDate(d.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
