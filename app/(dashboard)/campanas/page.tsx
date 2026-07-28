'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Send } from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'
import type { CampaignData, CampaignStatus } from '@/types/campaign'

export const dynamic = 'force-dynamic'

const STATUS_LABELS: Record<CampaignStatus, string> = {
  DRAFT: 'Borrador',
  SENDING: 'Enviando',
  COMPLETED: 'Completada',
}

const STATUS_STYLES: Record<CampaignStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SENDING: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-700',
}

const SEGMENT_LABELS: Record<string, string> = {
  ALL: 'Todos los leads',
  Lead: 'Solo Lead',
  Negociacion: 'Solo Negociación',
  Cerrado: 'Solo Cerrado',
  Perdido: 'Solo Perdido',
}

export default function CampanasPage() {
  const [campaigns, setCampaigns] = useState<CampaignData[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingId, setSendingId] = useState<string | null>(null)

  async function loadCampaigns() {
    setLoading(true)
    const res = await fetch('/api/campaigns')
    const data: CampaignData[] = await res.json()
    setCampaigns(data)
    setLoading(false)
  }

  useEffect(() => {
    loadCampaigns()
  }, [])

  async function handleSend(id: string) {
    if (!confirm('¿Enviar esta campaña ahora?')) return
    setSendingId(id)
    await fetch(`/api/campaigns/${id}/send`, { method: 'POST' })
    setSendingId(null)
    loadCampaigns()
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">Campañas de WhatsApp</h1>
          <p className="text-brand-muted text-sm mt-1 max-w-xl">
            Enviá un mismo mensaje a un grupo de contactos según en qué etapa estén
            (por ejemplo, todos los leads nuevos o los clientes ya cerrados).
          </p>
        </div>
        <Link
          href="/campanas/nueva"
          className="flex items-center gap-2 bg-brand-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand-accent transition-colors flex-shrink-0"
        >
          <Plus size={16} /> Nueva campaña
        </Link>
      </div>

      {loading ? (
        <p className="text-brand-muted text-sm">Cargando...</p>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 bg-white border border-brand-light rounded-lg">
          <p className="text-brand-text font-medium mb-1">No hay campañas todavía</p>
          <p className="text-brand-muted text-sm">Creá la primera con el botón &quot;Nueva campaña&quot;.</p>
        </div>
      ) : (
        <div className="bg-white border border-brand-light rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-brand-light text-brand-muted text-left text-xs uppercase tracking-wide">
                  <th className="p-3">Nombre</th>
                  <th className="p-3">Segmento</th>
                  <th className="p-3">Enviados</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Fecha</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-brand-light last:border-0">
                    <td className="p-3 text-brand-text font-medium">{campaign.name}</td>
                    <td className="p-3 text-brand-muted">
                      {SEGMENT_LABELS[campaign.segment] ?? campaign.segment}
                    </td>
                    <td className="p-3 text-brand-muted">{campaign.sentCount}</td>
                    <td className="p-3">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${STATUS_STYLES[campaign.status]}`}
                      >
                        {STATUS_LABELS[campaign.status]}
                      </span>
                    </td>
                    <td className="p-3 text-brand-muted">{formatRelativeDate(campaign.createdAt)}</td>
                    <td className="p-3 text-right">
                      {campaign.status === 'DRAFT' && (
                        <button
                          onClick={() => handleSend(campaign.id)}
                          disabled={sendingId === campaign.id}
                          className="flex items-center gap-1.5 text-xs text-brand-primary hover:text-brand-accent font-medium disabled:opacity-50 ml-auto"
                        >
                          <Send size={14} /> Enviar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
