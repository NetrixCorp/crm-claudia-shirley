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

function stageLabel(stageId: string): string {
  return DEAL_STAGES.find((s) => s.id === stageId)?.label ?? stageId
}

function daysLabel(rule: SuggestionRuleData): string {
  if (rule.daysMaxContact === -1) return `${rule.daysMinContact}+ días`
  return `${rule.daysMinContact}–${rule.daysMaxContact} días`
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
      <div className="text-center py-16 bg-white border border-brand-light rounded-lg">
        <p className="text-brand-text font-medium mb-1">No hay reglas todavía</p>
        <p className="text-brand-muted text-sm">Creá la primera con el botón &quot;Nueva regla&quot;.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-brand-light rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="border-b border-brand-light text-brand-muted text-left text-xs uppercase tracking-wide">
              <th className="p-3">Nombre</th>
              <th className="p-3">Etapa</th>
              <th className="p-3">Días sin contacto</th>
              <th className="p-3">Acción</th>
              <th className="p-3">Prioridad</th>
              <th className="p-3">Activa</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule, index) => (
              <tr key={rule.id} className="border-b border-brand-light last:border-0">
                <td className="p-3 text-brand-text font-medium">{rule.name}</td>
                <td className="p-3 text-brand-muted">{stageLabel(rule.stage)}</td>
                <td className="p-3 text-brand-muted">{daysLabel(rule)}</td>
                <td className="p-3 text-brand-muted">{rule.actionText}</td>
                <td className="p-3 text-brand-muted">{PRIORITY_LABELS[rule.priority]}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleToggle(rule)}
                    disabled={pendingId === rule.id}
                    className={
                      rule.isActive
                        ? 'bg-brand-primary text-white text-xs font-medium px-2 py-1 rounded disabled:opacity-50'
                        : 'bg-brand-light text-brand-muted text-xs font-medium px-2 py-1 rounded disabled:opacity-50'
                    }
                  >
                    {rule.isActive ? 'Activa' : 'Inactiva'}
                  </button>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleMove(index, -1)}
                      disabled={index === 0 || pendingId !== null}
                      className="text-brand-muted hover:text-brand-text disabled:opacity-30"
                      title="Subir prioridad"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      onClick={() => handleMove(index, 1)}
                      disabled={index === rules.length - 1 || pendingId !== null}
                      className="text-brand-muted hover:text-brand-text disabled:opacity-30"
                      title="Bajar prioridad"
                    >
                      <ArrowDown size={16} />
                    </button>
                    <button
                      onClick={() => onEdit(rule)}
                      className="text-brand-muted hover:text-brand-accent"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(rule)}
                      className="text-brand-muted hover:text-red-600"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
