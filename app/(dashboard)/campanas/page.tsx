'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Send, Users, MessageSquare } from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'
import type { CampaignData, CampaignStatus } from '@/types/campaign'

export const dynamic = 'force-dynamic'

const STATUS_LABELS: Record<CampaignStatus, string> = {
  DRAFT: 'Borrador',
  SENDING: 'Enviando',
  COMPLETED: 'Completada',
}

const STATUS_STYLES: Record<CampaignStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  SENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400',
  COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
}

const SEGMENT_LABELS: Record<string, string> = {
  ALL: 'Todos los leads',
  LEAD: 'Solo Lead',
  EN_PROCESO: 'Solo En proceso',
  CERRADO: 'Solo Cerrado',
  PERDIDO: 'Solo Perdido',
}

export default function CampanasPage() {
  const [campaigns, setCampaigns] = useState<CampaignData[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [previewId, setPreviewId] = useState<string | null>(null)

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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Campañas WhatsApp</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 max-w-xl">
            Creá y enviá campañas masivas a tus leads según en qué etapa estén
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
        <p className="text-slate-500 text-sm">Cargando...</p>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-brand-light dark:border-slate-700 rounded-lg">
          <p className="text-slate-900 dark:text-white font-medium mb-1">No hay campañas todavía</p>
          <p className="text-slate-500 text-sm">Creá la primera con el botón &quot;Nueva campaña&quot;.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              onMouseEnter={() => setPreviewId(campaign.id)}
              onMouseLeave={() => setPreviewId((id) => (id === campaign.id ? null : id))}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-start gap-2 mb-2">
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white truncate">{campaign.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{formatRelativeDate(campaign.createdAt)}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${STATUS_STYLES[campaign.status]}`}>
                  {STATUS_LABELS[campaign.status]}
                </span>
              </div>

              <p className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 mb-3">
                <Users size={14} /> {SEGMENT_LABELS[campaign.segment] ?? campaign.segment}
              </p>

              {previewId === campaign.id ? (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 mb-3 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-24 overflow-y-auto">
                  <p className="flex items-center gap-1 text-slate-400 mb-1"><MessageSquare size={12} /> Vista previa</p>
                  {campaign.message}
                </div>
              ) : (
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-3">
                  <span>{campaign.sentCount} enviados</span>
                  {campaign.failedCount > 0 && <span className="text-red-600 dark:text-red-400">{campaign.failedCount} fallidos</span>}
                </div>
              )}

              {campaign.status === 'DRAFT' && (
                <button
                  onClick={() => handleSend(campaign.id)}
                  disabled={sendingId === campaign.id}
                  className="flex items-center gap-1.5 text-xs text-brand-primary hover:text-brand-accent font-medium disabled:opacity-50 border-t border-slate-100 dark:border-slate-800 pt-3 w-full"
                >
                  <Send size={14} /> {sendingId === campaign.id ? 'Enviando...' : 'Enviar ahora'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
