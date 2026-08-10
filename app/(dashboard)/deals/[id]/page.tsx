'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Pencil, Trash2, Calendar, X, Video } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { ActivityFeed } from '@/components/crm/ActivityFeed'
import { DealForm } from '@/components/crm/DealForm'
import { formatCOP, formatDate, formatRelativeDate, buildWhatsAppLink } from '@/lib/utils'
import { DEAL_STAGES } from '@/lib/constants'

export const dynamic = 'force-dynamic'

function CalendarButton({ dealId, contactEmail }: { dealId: string; contactEmail?: string }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '10:00',
    endTime: '11:00',
  })
  const [creating, setCreating] = useState(false)
  const [created, setCreated] = useState<{
    htmlLink: string
    meetLink: string | null
  } | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)

    const startDateTime = `${form.date}T${form.startTime}:00`
    const endDateTime = `${form.date}T${form.endTime}:00`

    const res = await fetch(`/api/deals/${dealId}/calendar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        startDateTime,
        endDateTime,
      }),
    })

    const data = await res.json()

    if (res.ok) {
      setCreated({
        htmlLink: data.htmlLink,
        meetLink: data.meetLink,
      })
      setOpen(false)
    } else if (data.error === 'Google Calendar no conectado') {
      window.location.href = `/api/auth/google?dealId=${dealId}`
    }
    setCreating(false)
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm bg-slate-900 border border-slate-800 text-slate-500 hover:text-white px-3 py-2 rounded-lg transition-colors"
      >
        <Calendar size={16} /> Agendar reunión
      </button>

      {created && (
        <div className="flex gap-2 flex-wrap">
          <a
            href={created.htmlLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm bg-green-500/10 border border-green-500/30 text-green-400 px-3 py-2 rounded-lg"
          >
            <Calendar size={16} /> Ver en Calendar
          </a>
          {created.meetLink && (
            <a
              href={created.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm bg-blue-500/10 border border-blue-500/30 text-blue-400 px-3 py-2 rounded-lg"
            >
              <Video size={16} /> Unirse a Meet
            </a>
          )}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-lg w-full max-w-sm">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <h3 className="text-white font-semibold text-sm">Nueva reunión en Google Calendar</h3>
              <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-4 space-y-3">
              <input
                required
                placeholder="Título de la reunión"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm"
              />
              <textarea
                placeholder="Descripción (opcional)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm resize-none"
              />
              <div>
                <label className="text-slate-500 text-xs">Fecha</label>
                <input
                  required
                  type="date"
                  min={today}
                  value={form.date}
                  onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm mt-1 cursor-pointer"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 text-xs">Hora inicio</label>
                  <input
                    required
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="text-slate-500 text-xs">Hora fin</label>
                  <input
                    required
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm mt-1"
                  />
                </div>
              </div>
              <p className="text-slate-500 text-xs">
                Si es la primera vez, te va a pedir conectar tu cuenta de Google.
                {contactEmail && ` Se invitará automáticamente a ${contactEmail}.`}
              </p>
              <button
                type="submit"
                disabled={creating}
                className="w-full bg-brand-accent text-white font-semibold py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
              >
                {creating ? 'Creando...' : 'Crear evento en Google Calendar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default function DealDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [deal, setDeal] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)

  const loadDeal = useCallback(async () => {
    const res = await fetch(`/api/deals/${id}/detail`)
    if (!res.ok) { router.push('/pipeline'); return }
    setDeal(await res.json())
    setLoading(false)
  }, [id, router])

  useEffect(() => { loadDeal() }, [loadDeal])

  async function handleDelete() {
    if (!confirm('¿Eliminar este deal? Esta acción no se puede deshacer.')) return
    await fetch(`/api/deals/${id}`, { method: 'DELETE' })
    router.push('/pipeline')
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-slate-500 text-sm">Cargando...</p>
    </div>
  )

  if (!deal) return null

  const stage = DEAL_STAGES.find((s) => s.id === deal.stage)

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="text-slate-500 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{deal.title}</h1>
          <p className="text-slate-500 text-sm">{deal.contact.name} · {deal.contact.company || '—'}</p>
        </div>
        <div className="flex gap-2">
          {deal.contact.phone && (
            <a
              href={buildWhatsAppLink(deal.contact.phone, `Hola ${deal.contact.name}, te escribo sobre ${deal.title}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm bg-slate-900 border border-slate-800 text-slate-500 hover:text-green-500 hover:border-green-500 px-3 py-2 rounded-lg transition-colors"
            >
              <FaWhatsapp size={16} /> WhatsApp
            </a>
          )}
          <CalendarButton
            dealId={id}
            contactEmail={deal.contact.email || undefined}
          />
          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-2 text-sm bg-slate-900 border border-slate-800 text-slate-500 hover:text-white px-3 py-2 rounded-lg transition-colors"
          >
            <Pencil size={16} /> Editar
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 text-sm bg-slate-900 border border-slate-800 text-slate-500 hover:text-brand-accent hover:border-brand-accent px-3 py-2 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Columna izquierda — Info del deal */}
        <div className="col-span-1 space-y-4">
          {/* Etapa */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <p className="text-slate-500 text-xs mb-2">Etapa actual</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stage?.color }} />
              <span className="text-white font-semibold text-sm">{stage?.label || deal.stage}</span>
            </div>
          </div>

          {/* Valor */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <p className="text-slate-500 text-xs mb-1">Valor del deal</p>
            <p className="text-brand-accent text-2xl font-bold">{formatCOP(deal.valueCop)}</p>
          </div>

          {/* Info del servicio */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
            <div>
              <p className="text-slate-500 text-xs mb-1">Servicio</p>
              <p className="text-white text-sm">{deal.service}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">Nivel</p>
              <p className="text-white text-sm">{deal.level}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">Creado</p>
              <p className="text-white text-sm">{formatDate(deal.createdAt)}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">Última actualización</p>
              <p className="text-white text-sm">{formatRelativeDate(deal.updatedAt)}</p>
            </div>
          </div>

          {/* Próximo seguimiento */}
          {deal.nextFollowUp && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={14} className="text-slate-500" />
                <p className="text-slate-500 text-xs">Próximo seguimiento</p>
              </div>
              <p className="text-white text-sm font-semibold">{formatDate(deal.nextFollowUp)}</p>
            </div>
          )}

          {/* Contacto */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2">
            <p className="text-slate-500 text-xs mb-2">Contacto</p>
            <p className="text-white text-sm font-semibold">{deal.contact.name}</p>
            {deal.contact.company && <p className="text-slate-500 text-xs">{deal.contact.company}</p>}
            {deal.contact.email && <p className="text-slate-500 text-xs">{deal.contact.email}</p>}
            {deal.contact.phone && <p className="text-slate-500 text-xs">{deal.contact.phone}</p>}
            <p className="text-slate-500 text-xs">Fuente: {deal.contact.source}</p>
          </div>

          {/* Notas */}
          {deal.notes && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <p className="text-slate-500 text-xs mb-2">Notas</p>
              <p className="text-white text-sm leading-relaxed">{deal.notes}</p>
            </div>
          )}
        </div>

        {/* Columna derecha — Historial */}
        <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-6">
          <ActivityFeed
            dealId={id}
            activities={deal.activities}
            onActivityAdded={loadDeal}
          />
        </div>
      </div>

      {editOpen && (
        <DealForm
          deal={deal}
          onClose={() => setEditOpen(false)}
          onSaved={() => { setEditOpen(false); loadDeal() }}
        />
      )}
    </div>
  )
}
