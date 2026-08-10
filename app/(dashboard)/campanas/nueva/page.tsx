'use client'

import { useRef, useState } from 'react'
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

// Solo variables que lib/whatsapp.ts#replaceTemplateVars realmente reemplaza.
const VARIABLES = ['[Nombre]', '[Servicio]']

interface PreviewResponse {
  count: number
  previewMessage: string | null
  sampleContactName: string | null
}

const TOTAL_STEPS = 5
const STEP_LABELS = ['Información', 'Segmento', 'Mensaje', 'Vista previa', 'Confirmar']

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
  const [confirmChecked, setConfirmChecked] = useState(false)
  const messageRef = useRef<HTMLTextAreaElement>(null)

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

  function insertVariable(variable: string) {
    const textarea = messageRef.current
    if (!textarea) {
      setMessage((m) => m + variable)
      return
    }
    const start = textarea.selectionStart ?? message.length
    const end = textarea.selectionEnd ?? message.length
    const next = message.slice(0, start) + variable + message.slice(end)
    setMessage(next)
    requestAnimationFrame(() => {
      textarea.focus()
      const pos = start + variable.length
      textarea.setSelectionRange(pos, pos)
    })
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Nueva campaña</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Paso {step} de {TOTAL_STEPS} — {STEP_LABELS[step - 1]}
        </p>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-1">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
          <div
            key={s}
            className={`flex-1 h-1.5 rounded-full transition-colors ${
              step >= s ? 'bg-brand-primary' : 'bg-slate-200 dark:bg-slate-700'
            }`}
          />
        ))}
      </div>

      {error && (
        <p className="bg-yellow-50 text-yellow-800 text-sm rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
        {step === 1 && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre de la campaña</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Promo fin de mes"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Seleccioná el segmento</p>
            <div className="space-y-2">
              {SEGMENTS.map((s) => (
                <label
                  key={s.id}
                  className={`flex items-center gap-3 border rounded-lg px-3 py-2 cursor-pointer text-sm transition-colors ${
                    segment === s.id
                      ? 'border-brand-accent bg-blue-50 dark:bg-slate-800'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="segment"
                    checked={segment === s.id}
                    onChange={() => setSegment(s.id)}
                    className="text-brand-primary focus:ring-brand-accent"
                  />
                  <span className="text-slate-900 dark:text-white">{s.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Mensaje</label>
              <span className="text-xs text-slate-400">{message.length} caracteres</span>
            </div>
            <textarea
              ref={messageRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="Hola [Nombre], tenemos novedades sobre [Servicio] que pueden interesarte..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {VARIABLES.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => insertVariable(v)}
                  className="text-xs font-mono px-2 py-1 rounded border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {v}
                </button>
              ))}
            </div>

            {message.trim() && (
              <div className="mt-4">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Vista previa</p>
                <div className="bg-[#DCF8C6] dark:bg-green-900/30 rounded-lg rounded-tl-none p-3 text-sm text-slate-900 dark:text-white whitespace-pre-wrap max-w-sm">
                  {message}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Vista previa</p>
            {loadingPreview ? (
              <p className="text-slate-500 text-sm">Calculando...</p>
            ) : preview && preview.previewMessage ? (
              <>
                <div className="bg-[#DCF8C6] dark:bg-green-900/30 rounded-lg rounded-tl-none p-3 text-slate-900 dark:text-white text-sm whitespace-pre-wrap max-w-sm">
                  {preview.previewMessage}
                </div>
                <p className="text-slate-500 text-xs mt-2">
                  Ejemplo con los datos de{' '}
                  <span className="font-medium text-slate-700 dark:text-slate-300">{preview.sampleContactName}</span>
                </p>
                <p className="text-slate-900 dark:text-white text-sm font-medium mt-3">
                  Este mensaje se enviará a {preview.count} {peopleLabel(preview.count)}
                </p>
              </>
            ) : (
              <p className="text-slate-500 text-sm">
                No hay contactos con teléfono en este segmento todavía.
              </p>
            )}
          </div>
        )}

        {step === 5 && (
          <div>
            <p className="text-slate-900 dark:text-white text-sm font-medium mb-1">Resumen</p>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-sm text-slate-700 dark:text-slate-300 space-y-1 mb-4">
              <p><span className="text-slate-500 dark:text-slate-400">Nombre:</span> {name}</p>
              <p><span className="text-slate-500 dark:text-slate-400">Segmento:</span> {segmentLabel} ({preview?.count ?? 0} {peopleLabel(preview?.count ?? 0)})</p>
              <p className="whitespace-pre-wrap"><span className="text-slate-500 dark:text-slate-400">Mensaje:</span> {message}</p>
            </div>
            <label className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmChecked}
                onChange={(e) => setConfirmChecked(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 dark:border-slate-600 text-brand-primary focus:ring-brand-accent"
              />
              Entiendo que esto enviará {preview?.count ?? 0} {peopleLabel(preview?.count ?? 0)}
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleConfirm(true)}
                disabled={submitting || !confirmChecked}
                className="flex-1 bg-green-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Enviando...' : 'Enviar ahora'}
              </button>
              <button
                onClick={() => handleConfirm(false)}
                disabled={submitting}
                className="flex-1 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm font-semibold py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Guardar como borrador
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={() => goToStep(step - 1)}
            disabled={step === 1}
            className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm disabled:opacity-30"
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
