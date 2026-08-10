'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type { ActionType, DealStage, RulePriority } from '@prisma/client'
import { DEAL_STAGES } from '@/lib/constants'
import type { SuggestionRuleData } from '@/types/suggestion-rule'

interface RuleEditorProps {
  rule: SuggestionRuleData | null
  onClose: () => void
  onSaved: () => void
}

const ACTION_TYPES: { id: ActionType; label: string }[] = [
  { id: 'CALL', label: 'Llamar' },
  { id: 'WHATSAPP_MESSAGE', label: 'Enviar WhatsApp' },
  { id: 'SEND_PROPOSAL', label: 'Enviar propuesta' },
  { id: 'REACTIVATE', label: 'Reactivar' },
]

const PRIORITIES: { id: RulePriority; label: string }[] = [
  { id: 'HIGH', label: 'Alta' },
  { id: 'MEDIUM', label: 'Media' },
  { id: 'LOW', label: 'Baja' },
]

export function RuleEditor({ rule, onClose, onSaved }: RuleEditorProps) {
  const [name, setName] = useState(rule?.name ?? '')
  const [description, setDescription] = useState(rule?.description ?? '')
  const [stage, setStage] = useState<DealStage>(rule?.stage ?? 'LEAD')
  const [daysMinContact, setDaysMinContact] = useState(String(rule?.daysMinContact ?? 0))
  const [daysMaxContact, setDaysMaxContact] = useState(String(rule?.daysMaxContact ?? -1))
  const [actionText, setActionText] = useState(rule?.actionText ?? '')
  const [actionType, setActionType] = useState<ActionType>(rule?.actionType ?? 'CALL')
  const [priority, setPriority] = useState<RulePriority>(rule?.priority ?? 'MEDIUM')
  const [isActive, setIsActive] = useState(rule?.isActive ?? true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const minDays = Number(daysMinContact)
    const maxDays = Number(daysMaxContact)

    if (!name.trim()) {
      setError('El nombre es obligatorio')
      return
    }
    if (!stage) {
      setError('La etapa es obligatoria')
      return
    }
    if (!Number.isFinite(minDays) || minDays < 0) {
      setError('Los días mínimo deben ser 0 o más')
      return
    }

    setSaving(true)

    const url = rule ? `/api/suggestions/rules/${rule.id}` : '/api/suggestions/rules'
    const method = rule ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        description: description.trim() || null,
        stage,
        daysMinContact: minDays,
        daysMaxContact: Number.isFinite(maxDays) ? maxDays : -1,
        actionText: actionText.trim(),
        actionType,
        priority,
        isActive,
      }),
    })

    setSaving(false)

    if (!res.ok) {
      setError('No se pudo guardar la regla. Intentá de nuevo.')
      return
    }

    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-brand-light rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-brand-light">
          <h2 className="text-brand-text font-semibold">{rule ? 'Editar regla' : 'Nueva regla'}</h2>
          <button onClick={onClose} className="text-brand-muted hover:text-brand-text">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {error && (
            <p className="bg-yellow-50 text-yellow-800 text-xs rounded-lg px-3 py-2">{error}</p>
          )}

          <div>
            <label className="text-brand-muted text-xs">Nombre</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Lead nuevo sin llamar"
              className="w-full mt-1 bg-brand-light border border-brand-light rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
            />
          </div>

          <div>
            <label className="text-brand-muted text-xs">Descripción (opcional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full mt-1 bg-brand-light border border-brand-light rounded-lg px-3 py-2 text-brand-text text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-brand-muted text-xs">Etapa</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as DealStage)}
                className="w-full mt-1 bg-brand-light border border-brand-light rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
              >
                {DEAL_STAGES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-brand-muted text-xs">Prioridad</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as RulePriority)}
                className="w-full mt-1 bg-brand-light border border-brand-light rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-brand-muted text-xs">Días mínimo sin contacto</label>
              <input
                required
                type="number"
                min={0}
                value={daysMinContact}
                onChange={(e) => setDaysMinContact(e.target.value)}
                className="w-full mt-1 bg-brand-light border border-brand-light rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>
            <div>
              <label className="text-brand-muted text-xs">Días máximo (-1 = sin límite)</label>
              <input
                required
                type="number"
                value={daysMaxContact}
                onChange={(e) => setDaysMaxContact(e.target.value)}
                className="w-full mt-1 bg-brand-light border border-brand-light rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>
          </div>

          <div>
            <label className="text-brand-muted text-xs">Acción sugerida</label>
            <input
              required
              value={actionText}
              onChange={(e) => setActionText(e.target.value)}
              placeholder="Ej: Llamar hoy"
              className="w-full mt-1 bg-brand-light border border-brand-light rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
            />
          </div>

          <div>
            <label className="text-brand-muted text-xs">Tipo de acción</label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value as ActionType)}
              className="w-full mt-1 bg-brand-light border border-brand-light rounded-lg px-3 py-2 text-brand-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
            >
              {ACTION_TYPES.map((a) => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-brand-text text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-brand-light text-brand-primary focus:ring-brand-accent"
            />
            Regla activa
          </label>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-brand-muted hover:text-brand-text text-sm px-4 py-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-brand-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand-accent transition-colors disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
