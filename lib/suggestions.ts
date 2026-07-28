import type { ActionType, DealStage, RulePriority, SuggestionRule } from '@prisma/client'

/**
 * Prisma's Contact model doesn't store `stage` (it lives on Deal) or a
 * `lastContactDate` column (it's derived from activity/deal history).
 * Callers must resolve those before invoking this engine.
 */
export interface SuggestionContact {
  id: string
  name: string
  phone: string | null
  stage: DealStage
  lastContactDate: Date | null
}

export interface Suggestion {
  contactId: string
  contactName: string
  contactPhone: string | null
  action: string
  actionType: ActionType
  priority: RulePriority
  ruleId: string
  ruleName: string
  reason: string
  suggestedAt: Date
}

export const priorityOrder: Record<RulePriority, number> = {
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
}

export function daysSinceLastContact(contact: SuggestionContact): number {
  if (!contact.lastContactDate) return Infinity
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.floor((Date.now() - contact.lastContactDate.getTime()) / msPerDay)
}

export function matchesRule(contact: SuggestionContact, rule: SuggestionRule): boolean {
  if (contact.stage !== rule.stage) return false

  const daysSince = daysSinceLastContact(contact)
  if (daysSince < rule.daysMinContact) return false
  if (rule.daysMaxContact !== -1 && daysSince > rule.daysMaxContact) return false

  return true
}

function buildReason(contact: SuggestionContact, rule: SuggestionRule, daysSince: number): string {
  const daysText = daysSince === Infinity ? 'sin contacto registrado' : `${daysSince} día(s) sin contacto`
  return `${contact.name} lleva ${daysText} en etapa "${rule.stage}" (regla: ${rule.name})`
}

export function calculateSuggestions(
  contacts: SuggestionContact[],
  rules: SuggestionRule[]
): Suggestion[] {
  const activeRules = rules
    .filter((rule) => rule.isActive)
    .sort((a, b) => a.orderNumber - b.orderNumber)

  const suggestedAt = new Date()
  const suggestions: Suggestion[] = []

  for (const contact of contacts) {
    for (const rule of activeRules) {
      if (!matchesRule(contact, rule)) continue

      suggestions.push({
        contactId: contact.id,
        contactName: contact.name,
        contactPhone: contact.phone,
        action: rule.actionText,
        actionType: rule.actionType,
        priority: rule.priority,
        ruleId: rule.id,
        ruleName: rule.name,
        reason: buildReason(contact, rule, daysSinceLastContact(contact)),
        suggestedAt,
      })
      break
    }
  }

  return suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
}

/**
 * 6 reglas por defecto. `stage` se mapea a los valores compartidos del enum
 * DealStage (Lead, Propuesta_Enviada, Negociacion, Cerrado, Perdido) para no
 * duplicar el enum de crm-interno:
 *   - "Llamada sin seguimiento" -> Propuesta_Enviada
 *   - "En proceso sin contacto" -> Negociacion
 */
export function getDefaultRules(): SuggestionRule[] {
  const now = new Date()
  const businessId = 'claudia-shirley'

  const base = {
    businessId,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }

  return [
    {
      ...base,
      id: 'default-1',
      name: 'Lead nuevo',
      description: 'Lead recién creado, todavía sin llamada de bienvenida.',
      stage: 'Lead' as DealStage,
      daysMinContact: 0,
      daysMaxContact: 1,
      actionText: 'Llamar hoy',
      actionType: 'CALL' as ActionType,
      priority: 'HIGH' as RulePriority,
      orderNumber: 1,
    },
    {
      ...base,
      id: 'default-2',
      name: 'Llamada sin seguimiento',
      description: 'Se envió propuesta pero no hay seguimiento hace 3+ días.',
      stage: 'Propuesta_Enviada' as DealStage,
      daysMinContact: 3,
      daysMaxContact: -1,
      actionText: 'Retomar contacto',
      actionType: 'CALL' as ActionType,
      priority: 'HIGH' as RulePriority,
      orderNumber: 2,
    },
    {
      ...base,
      id: 'default-3',
      name: 'En proceso sin contacto',
      description: 'En negociación sin contacto hace 5+ días.',
      stage: 'Negociacion' as DealStage,
      daysMinContact: 5,
      daysMaxContact: -1,
      actionText: 'Enviar propuesta',
      actionType: 'SEND_PROPOSAL' as ActionType,
      priority: 'MEDIUM' as RulePriority,
      orderNumber: 3,
    },
    {
      ...base,
      id: 'default-4',
      name: 'Lead abandonado',
      description: 'Lead sin contacto hace 7+ días, riesgo de perderlo.',
      stage: 'Lead' as DealStage,
      daysMinContact: 7,
      daysMaxContact: -1,
      actionText: 'Recuperar urgente',
      actionType: 'WHATSAPP_MESSAGE' as ActionType,
      priority: 'HIGH' as RulePriority,
      orderNumber: 4,
    },
    {
      ...base,
      id: 'default-5',
      name: 'Cerrado inactivo',
      description: 'Cliente cerrado hace 45+ días, posible cambio de auto.',
      stage: 'Cerrado' as DealStage,
      daysMinContact: 45,
      daysMaxContact: -1,
      actionText: 'Reactivar cambio de auto',
      actionType: 'REACTIVATE' as ActionType,
      priority: 'LOW' as RulePriority,
      orderNumber: 5,
    },
    {
      ...base,
      id: 'default-6',
      name: 'Perdido',
      description: 'Deal perdido hace 60+ días, vale la pena reintentar.',
      stage: 'Perdido' as DealStage,
      daysMinContact: 60,
      daysMaxContact: -1,
      actionText: 'Reintentar contacto',
      actionType: 'REACTIVATE' as ActionType,
      priority: 'LOW' as RulePriority,
      orderNumber: 6,
    },
  ]
}
