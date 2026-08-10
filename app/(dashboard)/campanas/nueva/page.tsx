'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { CampaignSegment } from '@/types/campaign'

const SEGMENTS: { id: CampaignSegment; label: string }[] = [
  { id: 'ALL', label: 'Todos los leads' },
  { id: 'LEAD', label: 'Solo Lead' },
  { id: 'EN_PROCESO', label: 'Solo En proceso' },
  { id: 'CERRADO', label: 'Solo Cerrado' },
  { id: 'PERDIDO', label: 'Solo Perdido' },
]

interface PreviewResponse {
  count: number
  previewMessage: string | null
  sampleContactName: string | null
}

const TOTAL_STEPS = 5

export default function NuevaCampanaPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [segment, setSegment] = useState<CampaignSegment>('ALL')
  const [message, setMessage] = useState('')
  const [preview, setPreview] = useState<PreviewResponse | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function loadPreview() {
    setLoadingPreview(true)
    try {
      const res = await fetch('/api/campaigns/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ segment, message }),
      })
      const data: PreviewResponse = await res.json()
      setPreview(data)
    } finally {
      setLoadingPreview(false)
    }
  }

  function goToStep(next: number) {
    setError('')
    if (next === 4) loadPreview()
    setStep(next)
  }

  async function handleConfirm(sendNow: boolean) {
    setSubmitting(true)
    setError('')

    const res = await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), message: message.trim(), segment }),
    })

    if (!res.ok) {
      setSubmitting(false)
      setError('No se pudo crear la campaña. Intentá de nuevo.')
      return
    }

    const campaign: { id: string } = await res.json()

    if (sendNow) {
      await fetch(`/api/campaigns/${campaign.id}/send`, { method: 'POST' })
    }

    setSubmitting(false)
    router.push('/campanas')
  }

  const segmentLabel = SEGMENTS.find((s) => s.id === segment)?.label ?? segment
  const peopleLabel = (count: number) => (count === 1 ? 'persona' : 'personas')

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-brand-text mb-1">Nueva campaña</h1>
      <p className="text-brand-muted text-sm mb-6">Paso {step} de {TOTAL_STEPS}</p>

      {error && (
        <p className="bg-yellow-50 text-yellow-800 text-sm rounded-lg px-3 py-2 mb-4">{error}</p>
      )}

      <div className="bg-white border border-brand-light rounded-lg p-6">
        {step === 1 && (
          <div>
            <label className="text-brand-muted text-xs">Nombre de la campaña</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Promo fin de mes"
              className="w-full mt-1 bg-brand-light border border-brand-light rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
            />
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="text-brand-muted text-xs mb-2">Seleccioná el segmento</p>
            <div className="space-y-2">
              {SEGMENTS.map((s) => (
                <label
                  key={s.id}
                  className={`flex items-center gap-3 border rounded-lg px-3 py-2 cursor-pointer text-sm ${
                    segment === s.id ? 'border-brand-accent bg-brand-light' : 'border-brand-light'
                  }`}
                >
                  <input
                    type="radio"
                    name="segment"
                    checked={segment === s.id}
                    onChange={() => setSegment(s.id)}
                    className="text-brand-primary focus:ring-brand-accent"
                  />
                  <span className="text-brand-text">{s.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <label className="text-brand-muted text-xs">Mensaje</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="Hola [Nombre], tenemos novedades sobre [Servicio] que pueden interesarte..."
              className="w-full mt-1 bg-brand-light border border-brand-light rounded-lg px-3 py-2 text-brand-text text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-accent"
            />
            <p className="text-brand-muted text-xs mt-2">
              Usá <span className="font-mono">[Nombre]</span> y{' '}
              <span className="font-mono">[Servicio]</span> para personalizar el mensaje con
              los datos de cada contacto.
            </p>
          </div>
        )}

        {step === 4 && (
          <div>
            <p className="text-brand-muted text-xs mb-2">Vista previa</p>
            {loadingPreview ? (
              <p className="text-brand-muted text-sm">Calculando...</p>
            ) : preview && preview.previewMessage ? (
              <>
                <div className="bg-brand-light rounded-lg p-3 text-brand-text text-sm whitespace-pre-wrap">
                  {preview.previewMessage}
                </div>
                <p className="text-brand-muted text-xs mt-2">
                  Ejemplo con los datos de{' '}
                  <span className="font-medium">{preview.sampleContactName}</span>
                </p>
                <p className="text-brand-text text-sm font-medium mt-3">
                  Este mensaje se enviará a {preview.count} {peopleLabel(preview.count)}
                </p>
              </>
            ) : (
              <p className="text-brand-muted text-sm">
                No hay contactos con teléfono en este segmento todavía.
              </p>
            )}
          </div>
        )}

        {step === 5 && (
          <div>
            <p className="text-brand-text text-sm mb-1">Todo listo para confirmar.</p>
            <p className="text-brand-muted text-sm mb-4">
              &quot;{name}&quot; se enviará a {preview?.count ?? 0}{' '}
              {peopleLabel(preview?.count ?? 0)} del segmento &quot;{segmentLabel}&quot;.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleConfirm(true)}
                disabled={submitting}
                className="flex-1 bg-brand-primary text-white text-sm font-semibold py-2 rounded-lg hover:bg-brand-accent transition-colors disabled:opacity-50"
              >
                {submitting ? 'Enviando...' : 'Confirmar y enviar ahora'}
              </button>
              <button
                onClick={() => handleConfirm(false)}
                disabled={submitting}
                className="flex-1 border border-brand-light text-brand-text text-sm font-semibold py-2 rounded-lg hover:bg-brand-light transition-colors disabled:opacity-50"
              >
                Programar para después
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-brand-light">
          <button
            onClick={() => goToStep(step - 1)}
            disabled={step === 1}
            className="flex items-center gap-1.5 text-brand-muted hover:text-brand-text text-sm disabled:opacity-30"
          >
            <ArrowLeft size={14} /> Atrás
          </button>
          {step < TOTAL_STEPS && (
            <button
              onClick={() => goToStep(step + 1)}
              disabled={
                (step === 1 && name.trim().length === 0) ||
                (step === 3 && message.trim().length === 0)
              }
              className="flex items-center gap-1.5 bg-brand-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand-accent transition-colors disabled:opacity-50"
            >
              Siguiente <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
