'use client'

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { SERVICE_TYPES, SERVICE_LEVELS, PRICING_DEFAULTS } from '@/lib/constants'
import { trackEvent } from '@/lib/analytics'

interface DealFormProps {
  deal: any | null
  defaultStage?: string
  onClose: () => void
  onSaved: () => void
}

export function DealForm({ deal, defaultStage, onClose, onSaved }: DealFormProps) {
  const [contacts, setContacts] = useState<any[]>([])
  const [form, setForm] = useState({
    contactId: deal?.contactId || '',
    title: deal?.title || '',
    service: deal?.service || 'AUTO_NUEVO',
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
      <div className="bg-brand-black-soft border border-brand-gray-dark rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-brand-gray-dark">
          <h2 className="text-white font-semibold">{deal ? 'Editar deal' : 'Nuevo deal'}</h2>
          <button onClick={onClose} className="text-brand-gray-mid hover:text-white">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {!deal && (
            <p className="text-brand-gray-mid text-xs mb-3 leading-relaxed">
              Registrá el valor del vehículo o servicio en {PRICING_DEFAULTS.currency}.
            </p>
          )}
          <select
            required
            value={form.contactId}
            onChange={(e) => setForm({ ...form, contactId: e.target.value })}
            className="w-full bg-brand-black border border-brand-gray-dark rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="">Seleccionar contacto...</option>
            {contacts.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
          <input
            required
            placeholder="Título del deal"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-brand-black border border-brand-gray-dark rounded-lg px-3 py-2 text-white text-sm"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.service}
              onChange={(e) => setForm({ ...form, service: e.target.value })}
              className="w-full bg-brand-black border border-brand-gray-dark rounded-lg px-3 py-2 text-white text-sm"
            >
              {SERVICE_TYPES.map((s) => (<option key={s.id} value={s.id}>{s.label}</option>))}
            </select>
            <select
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
              className="w-full bg-brand-black border border-brand-gray-dark rounded-lg px-3 py-2 text-white text-sm"
            >
              {SERVICE_LEVELS.map((l) => (<option key={l} value={l}>{l}</option>))}
            </select>
          </div>
          <div>
            <input
              required
              type="number"
              placeholder="Valor en COP"
              value={form.valueCop}
              onChange={(e) => setForm({ ...form, valueCop: e.target.value })}
              className="w-full bg-brand-black border border-brand-gray-dark rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="text-brand-gray-mid text-xs">Próximo seguimiento</label>
            <input
              ref={dateInputRef}
              type="date"
              min={today}
              value={form.nextFollowUp}
              onClick={() => dateInputRef.current?.showPicker?.()}
              onChange={(e) => setForm({ ...form, nextFollowUp: e.target.value })}
              className="w-full bg-brand-black border border-brand-gray-dark rounded-lg px-3 py-2 text-white text-sm mt-1 cursor-pointer"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-brand-red text-white font-semibold py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? 'Guardando...' : deal ? 'Guardar cambios' : 'Crear deal'}
          </button>
        </form>
      </div>
    </div>
  )
}
