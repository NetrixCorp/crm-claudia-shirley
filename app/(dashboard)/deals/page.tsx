'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatCOP, formatRelativeDate } from '@/lib/utils'
import { DEAL_STAGES } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export default function DealsPage() {
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/deals').then((r) => r.json()).then((data) => {
      setDeals(data)
      setLoading(false)
    })
  }, [])

  const stage = (stageId: string) => DEAL_STAGES.find((s) => s.id === stageId)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Deals</h1>
        <p className="text-slate-500 text-sm">{deals.length} oportunidades en total</p>
        <p className="text-slate-500 text-xs mt-1">
          Hacé click en cualquier fila para ver el detalle completo, registrar
          actividades y ver el historial de esa oportunidad.
        </p>
      </div>

      {loading ? (
        <p className="text-slate-500 text-sm">Cargando...</p>
      ) : deals.length === 0 ? (
        <p className="text-slate-500 text-sm">No hay deals todavía. Crea uno desde el Pipeline.</p>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800 text-white font-semibold text-left">
                <th className="p-3">Deal</th>
                <th className="p-3">Contacto</th>
                <th className="p-3">Etapa</th>
                <th className="p-3">Valor</th>
                <th className="p-3">Actualizado</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((deal) => {
                const s = stage(deal.stage)
                return (
                  <tr
                    key={deal.id}
                    onClick={() => router.push(`/deals/${deal.id}`)}
                    className="border-b border-slate-800 text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <td className="p-3">
                      <p className="font-medium">{deal.title}</p>
                      <p className="text-slate-500 text-xs">{deal.service} · {deal.level}</p>
                    </td>
                    <td className="p-3 text-slate-500">{deal.contact?.name || '—'}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s?.color }} />
                        <span className="text-slate-500 text-xs">{s?.label || deal.stage}</span>
                      </div>
                    </td>
                    <td className="p-3 text-brand-accent font-semibold">{formatCOP(deal.valueCop)}</td>
                    <td className="p-3 text-slate-500">{formatRelativeDate(deal.updatedAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
