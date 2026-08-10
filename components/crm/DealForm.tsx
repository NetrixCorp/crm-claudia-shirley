'use client'

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { SERVICE_TYPES, SERVICE_TYPE_LABELS, SERVICE_LEVELS, PRICING_DEFAULTS } from '@/lib/constants'
import { trackEvent } from '@/lib/analytics'

interface DealFormProps {
  deal: any | null
  defaultStage?: string
  onClose: () => void
  onSaved: () => void
}

const FIELD_CLASS =
  'w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
const LABEL_CLASS = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1'

export function DealForm({ deal, defaultStage, onClose, onSaved }: DealFormProps) {
  const [contacts, setContacts] = useState<any[]>([])
  const [form, setForm] = useState({
    contactId: deal?.contactId || '',
    title: deal?.title || '',
    service: deal?.service || 'VentaAutos',
    level: deal?.level || 'N1',
    valueCop: deal?.valueCop ? String(deal.valueCop) : String(PRICING_DEFAULTS.defaultDealValue),
    stage: deal?.stage || defaultStage || 'LEAD',
    nextFollowUp: deal?.nextFollowUp ? String(deal.nextFollowUp).slice(0, 10) : '',
  })
  const [saving, setSaving] = useState(false)
  const dateInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/contacts').then((r) => r.json()).then(setContacts)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const url = deal ? `/api/deals/${deal.id}` : '/api/deals'
    const method = deal ? 'PATCH' : 'POST'
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, valueCop: Number(form.valueCop) || 0 }),
    })
    trackEvent(deal ? 'edit_deal' : 'create_deal', { service: form.service, level: form.level })
    setSaving(false)
    onSaved()
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-slate-900 dark:text-white font-semibold">{deal ? 'Editar deal' : 'Nuevo deal'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {!deal && (
            <p className="text-slate-500 text-xs leading-relaxed">
              Registrá el valor del vehículo o servicio en {PRICING_DEFAULTS.currency}.
            </p>
          )}
          <div>
            <label className={LABEL_CLASS}>Contacto</label>
            <select
              required
              value={form.contactId}
              onChange={(e) => setForm({ ...form, contactId: e.target.value })}
              className={FIELD_CLASS}
            >
              <option value="">Seleccionar contacto...</option>
              {contacts.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Título del deal</label>
            <input
              required
              placeholder="Ej: Venta de Auto XYZ"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={FIELD_CLASS}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLASS}>Servicio</label>
              <select
                value={form.service}
                onChange={(e) => setForm({ ...form, service: e.target.value })}
                className={FIELD_CLASS}
              >
                {SERVICE_TYPES.map((s) => (<option key={s} value={s}>{SERVICE_TYPE_LABELS[s]}</option>))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Nivel</label>
              <select
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
                className={FIELD_CLASS}
              >
                {SERVICE_LEVELS.map((l) => (<option key={l} value={l}>{l}</option>))}
              </select>
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS}>Valor en {PRICING_DEFAULTS.currency}</label>
            <input
              required
              type="number"
              placeholder="Valor en COP"
              value={form.valueCop}
              onChange={(e) => setForm({ ...form, valueCop: e.target.value })}
              className={FIELD_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Próximo seguimiento</label>
            <input
              ref={dateInputRef}
              type="date"
              min={today}
              value={form.nextFollowUp}
              onClick={() => dateInputRef.current?.showPicker?.()}
              onChange={(e) => setForm({ ...form, nextFollowUp: e.target.value })}
              className={`${FIELD_CLASS} cursor-pointer`}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-brand-accent text-white font-semibold py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? 'Guardando...' : deal ? 'Guardar cambios' : 'Crear deal'}
          </button>
        </form>
      </div>
    </div>
  )
}
