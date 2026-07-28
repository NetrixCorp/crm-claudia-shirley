'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DragDropContext, Droppable, type DropResult } from '@hello-pangea/dnd'
import { CircleDot, Send, Handshake, CheckCircle2, XCircle, Plus } from 'lucide-react'
import { DEAL_STAGES } from '@/lib/constants'
import { formatCOP } from '@/lib/utils'
import { trackEvent } from '@/lib/analytics'
import { DealCard } from './DealCard'
import { DealForm } from './DealForm'

const STAGE_ICONS: Record<string, any> = {
  Lead: CircleDot,
  Propuesta_Enviada: Send,
  Negociacion: Handshake,
  Cerrado: CheckCircle2,
  Perdido: XCircle,
}

export function Pipeline() {
  const router = useRouter()
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [defaultStage, setDefaultStage] = useState('Lead')

  async function loadDeals() {
    setLoading(true)
    const res = await fetch('/api/deals')
    setDeals(await res.json())
    setLoading(false)
  }

  useEffect(() => { loadDeals() }, [])

  async function handleDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId) return

    const newStage = destination.droppableId
    setDeals((prev) => prev.map((d) => (d.id === draggableId ? { ...d, stage: newStage } : d)))

    await fetch(`/api/deals/${draggableId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: newStage }),
    })

    trackEvent('move_deal_stage', { from: source.droppableId, to: newStage })
  }

  function dealsByStage(stageId: string) {
    return deals.filter((d) => d.stage === stageId)
  }

  function stageTotal(stageId: string) {
    return dealsByStage(stageId).reduce((sum, d) => sum + Number(d.valueCop), 0)
  }

  if (loading) return <p className="text-brand-gray-mid text-sm">Cargando pipeline...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Pipeline</h1>
          <p className="text-brand-gray-mid text-sm">{deals.length} deals en total</p>
          <p className="text-brand-gray-mid text-xs mt-1 max-w-xl">
            Arrastrá las cards entre columnas para avanzar cada oportunidad. Hacé click en
            una card para ver el detalle completo y registrar actividades. Recibirás un
            email automático en cada cambio de etapa.
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setDefaultStage('Lead'); setFormOpen(true) }}
          className="flex items-center gap-2 bg-brand-red text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> Nuevo deal
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-5 gap-3">
          {DEAL_STAGES.map((stage) => (
            <Droppable droppableId={stage.id} key={stage.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-brand-black-soft border border-brand-gray-dark rounded-lg p-3 min-h-[400px]"
                >
                  <div className="flex items-center gap-2 mb-1">
                    {(() => {
                      const Icon = STAGE_ICONS[stage.id]
                      return Icon ? <Icon size={14} style={{ color: stage.color }} /> : null
                    })()}
                    <p className="text-white text-sm font-medium">{stage.label}</p>
                  </div>
                  <p className="text-brand-gray-mid text-xs mb-3">
                    {dealsByStage(stage.id).length} · {formatCOP(stageTotal(stage.id))}
                  </p>
                  {dealsByStage(stage.id).map((deal, index) => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      index={index}
                      onClick={() => router.push(`/deals/${deal.id}`)}
                    />
                  ))}
                  {dealsByStage(stage.id).length === 0 && (
                    <p className="text-brand-gray-mid text-xs text-center py-4 px-2">
                      {stage.id === 'Lead'
                        ? 'Usá "Nuevo deal" para agregar tu primera oportunidad'
                        : `Sin deals en ${stage.label}`}
                    </p>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {formOpen && (
        <DealForm
          deal={editing}
          defaultStage={defaultStage}
          onClose={() => setFormOpen(false)}
          onSaved={() => { setFormOpen(false); loadDeals() }}
        />
      )}
    </div>
  )
}
