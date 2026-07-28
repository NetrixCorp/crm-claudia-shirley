'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { RefreshCw } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import type { ActionType, RulePriority } from '@prisma/client'
import { WHATSAPP_TEMPLATES } from '@/lib/constants'
import { buildWhatsAppLink } from '@/lib/utils'

interface SuggestionData {
  contactId: string
  contactName: string
  contactPhone: string | null
  action: string
  actionType: ActionType
  priority: RulePriority
  ruleId: string
  ruleName: string
  reason: string
  suggestedAt: string
}

interface CalculateSuggestionsResponse {
  suggestions: SuggestionData[]
  calculatedAt: string
  totalContacts: number
  rulesUsed: number
}

const PRIORITY_STYLES: Record<RulePriority, string> = {
  HIGH: 'bg-red-100 text-red-700',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  LOW: 'bg-gray-100 text-gray-700',
}

const PRIORITY_LABELS: Record<RulePriority, string> = {
  HIGH: 'Alta',
  MEDIUM: 'Media',
  LOW: 'Baja',
}

function minutesAgoLabel(calculatedAt: string, now: number): string {
  const diffMs = now - new Date(calculatedAt).getTime()
  const minutes = Math.max(0, Math.floor(diffMs / 60000))

  if (minutes < 1) return 'Actualizado hace instantes'
  if (minutes === 1) return 'Actualizado hace 1 minuto'
  if (minutes < 60) return `Actualizado hace ${minutes} minutos`

  const hours = Math.floor(minutes / 60)
  if (hours === 1) return 'Actualizado hace 1 hora'
  return `Actualizado hace ${hours} horas`
}

export function SuggestionPanel() {
  const [suggestions, setSuggestions] = useState<SuggestionData[]>([])
  const [calculatedAt, setCalculatedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState<number>(() => Date.now())

  const loadSuggestions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/suggestions/calculate')
      const data: CalculateSuggestionsResponse = await res.json()
      setSuggestions(data.suggestions)
      setCalculatedAt(data.calculatedAt)
      setNow(Date.now())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSuggestions()
  }, [loadSuggestions])

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(interval)
  }, [])

  function whatsappHref(suggestion: SuggestionData): string {
    if (!suggestion.contactPhone) return '#'
    const message = WHATSAPP_TEMPLATES.followUp(suggestion.contactName)
    return buildWhatsAppLink(suggestion.contactPhone, message)
  }

  return (
    <div className="bg-white border border-brand-light rounded-lg p-5 mb-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-brand-text font-semibold">Sugerencias de hoy</h2>
          {calculatedAt && (
            <p className="text-brand-muted text-xs mt-0.5">{minutesAgoLabel(calculatedAt, now)}</p>
          )}
        </div>
        <button
          onClick={loadSuggestions}
          disabled={loading}
          className="flex items-center gap-1.5 text-brand-muted hover:text-brand-primary text-sm disabled:opacity-50 flex-shrink-0"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Recalcular
        </button>
      </div>

      {loading ? (
        <p className="text-brand-muted text-sm py-4">Calculando sugerencias...</p>
      ) : suggestions.length === 0 ? (
        <p className="text-brand-text text-sm py-4">
          ¡Todo al día! No hay acciones pendientes 🎉
        </p>
      ) : (
        <ul className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <li
              key={`${suggestion.contactId}-${suggestion.ruleId}`}
              className="flex flex-col sm:flex-row sm:items-center gap-3 border border-brand-light rounded-lg p-3"
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-light text-brand-primary text-xs font-semibold flex items-center justify-center">
                {index + 1}
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-brand-text font-medium">{suggestion.contactName}</p>
                  {suggestion.contactPhone && (
                    <p className="text-brand-muted text-xs">{suggestion.contactPhone}</p>
                  )}
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${PRIORITY_STYLES[suggestion.priority]}`}>
                    {PRIORITY_LABELS[suggestion.priority]}
                  </span>
                </div>
                <p className="text-brand-text text-sm mt-1">{suggestion.action}</p>
                <p className="text-brand-muted text-xs mt-0.5">{suggestion.reason}</p>
                <p className="text-brand-muted text-[11px] mt-0.5">Regla: {suggestion.ruleName}</p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  href={`/contacts/${suggestion.contactId}`}
                  className="text-xs text-brand-muted hover:text-brand-text border border-brand-light rounded-lg px-3 py-1.5 transition-colors"
                >
                  Ver contacto
                </Link>
                <a
                  href={whatsappHref(suggestion)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-white bg-brand-primary hover:bg-brand-accent rounded-lg px-3 py-1.5 transition-colors"
                >
                  <FaWhatsapp size={14} /> Llamar
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
