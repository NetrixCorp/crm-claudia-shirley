'use client'

import { useState } from 'react'
import { ArrowUp, ArrowDown, Pencil, Trash2 } from 'lucide-react'
import { DEAL_STAGES } from '@/lib/constants'
import type { SuggestionRuleData } from '@/types/suggestion-rule'

interface RulesListProps {
  rules: SuggestionRuleData[]
  onEdit: (rule: SuggestionRuleData) => void
  onRefresh: () => void
}

const PRIORITY_LABELS: Record<SuggestionRuleData['priority'], string> = {
  HIGH: 'Alta',
  MEDIUM: 'Media',
  LOW: 'Baja',
}

const PRIORITY_BADGE_STYLES: Record<SuggestionRuleData['priority'], string> = {
  HIGH: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
  MEDIUM: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
  LOW: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
}

function stageLabel(stageId: string): string {
  return DEAL_STAGES.find((s) => s.id === stageId)?.label ?? stageId
}

function daysLabel(rule: SuggestionRuleData): string {
  if (rule.daysMaxContact === -1) return `${rule.daysMinContact}+ días`
  return `${rule.daysMinContact}–${rule.daysMaxContact} días`
}

function PriorityBadge({ priority }: { priority: SuggestionRuleData['priority'] }) {
  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${PRIORITY_BADGE_STYLES[priority]}`}>
      {PRIORITY_LABELS[priority]}
    </span>
  )
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${
        checked ? 'bg-brand-primary' : 'bg-slate-300 dark:bg-slate-600'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

export function RulesList({ rules, onEdit, onRefresh }: RulesListProps) {
  const [pendingId, setPendingId] = useState<string | null>(null)

  async function patchRule(id: string, data: Record<string, unknown>) {
    await fetch(`/api/suggestions/rules/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  async function handleToggle(rule: SuggestionRuleData) {
    setPendingId(rule.id)
    await patchRule(rule.id, { isActive: !rule.isActive })
    setPendingId(null)
    onRefresh()
  }

  async function handleDelete(rule: SuggestionRuleData) {
    if (!confirm(`¿Eliminar la regla "${rule.name}"?`)) return
    setPendingId(rule.id)
    await fetch(`/api/suggestions/rules/${rule.id}`, { method: 'DELETE' })
    setPendingId(null)
    onRefresh()
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= rules.length) return

    const current = rules[index]
    const swapWith = rules[target]

    setPendingId(current.id)
    await Promise.all([
      patchRule(current.id, { orderNumber: swapWith.orderNumber }),
      patchRule(swapWith.id, { orderNumber: current.orderNumber }),
    ])
    setPendingId(null)
    onRefresh()
  }

  if (rules.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-slate-900 border border-brand-light dark:border-slate-700 rounded-lg">
        <p className="text-slate-900 dark:text-white font-medium mb-1">No hay reglas todavía</p>
        <p className="text-slate-500 text-sm">Creá la primera con el botón &quot;Nueva regla&quot;.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {rules.map((rule, index) => (
        <div
          key={rule.id}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          <div className="flex justify-between items-start gap-3 mb-3">
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 dark:text-white truncate">{rule.name}</h3>
              {rule.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{rule.description}</p>
              )}
            </div>
            <PriorityBadge priority={rule.priority} />
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mb-4">
            <span>Etapa: <span className="text-slate-700 dark:text-slate-300 font-medium">{stageLabel(rule.stage)}</span></span>
            <span>Sin contacto: <span className="text-slate-700 dark:text-slate-300 font-medium">{daysLabel(rule)}</span></span>
            <span>Acción: <span className="text-slate-700 dark:text-slate-300 font-medium">{rule.actionText}</span></span>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
            <div className="flex items-center gap-2">
              <Toggle checked={rule.isActive} onChange={() => handleToggle(rule)} disabled={pendingId === rule.id} />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {rule.isActive ? 'Activa' : 'Inactiva'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleMove(index, -1)}
                disabled={index === 0 || pendingId !== null}
                className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 rounded"
                title="Subir prioridad"
              >
                <ArrowUp size={15} />
              </button>
              <button
                onClick={() => handleMove(index, 1)}
                disabled={index === rules.length - 1 || pendingId !== null}
                className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 rounded"
                title="Bajar prioridad"
              >
                <ArrowDown size={15} />
              </button>
              <button
                onClick={() => onEdit(rule)}
                className="flex items-center gap-1 text-xs font-medium px-2 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
              >
                <Pencil size={14} /> Editar
              </button>
              <button
                onClick={() => handleDelete(rule)}
                className="flex items-center gap-1 text-xs font-medium px-2 py-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded"
              >
                <Trash2 size={14} /> Eliminar
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
