import { NextResponse } from 'next/server'
import type { SuggestionRule } from '@prisma/client'
import { db } from '@/lib/db'
import { getBusinessId } from '@/lib/auth'
import {
  calculateSuggestions,
  getDefaultRules,
  type Suggestion,
  type SuggestionContact,
} from '@/lib/suggestions'

export const dynamic = 'force-dynamic'

interface CalculateSuggestionsResponse {
  suggestions: Suggestion[]
  calculatedAt: string
  totalContacts: number
  rulesUsed: number
}

interface ErrorResponse {
  error: string
}

export async function GET() {
  try {
    const businessId = await getBusinessId()
    if (!businessId) {
      return NextResponse.json<ErrorResponse>({ error: 'No autorizado' }, { status: 401 })
    }

    let rules = await db.suggestionRule.findMany({
      where: { businessId, isActive: true },
      orderBy: { orderNumber: 'asc' },
    })

    if (rules.length === 0) {
      rules = await seedDefaultRules(businessId)
    }

    const contactsWithDeals = await db.contact.findMany({
      where: { businessId },
      include: {
        deals: {
          orderBy: { updatedAt: 'desc' },
          take: 1,
        },
      },
    })

    const contacts: SuggestionContact[] = contactsWithDeals
      .filter((contact) => contact.deals.length > 0)
      .map((contact) => {
        const lastDeal = contact.deals[0]
        return {
          id: contact.id,
          name: contact.name,
          phone: contact.phone,
          stage: lastDeal.stage,
          lastContactDate: lastDeal.updatedAt,
        }
      })

    const suggestions = calculateSuggestions(contacts, rules)

    if (suggestions.length > 0) {
      await db.suggestionHistory.createMany({
        data: suggestions.map((suggestion) => ({
          businessId,
          contactId: suggestion.contactId,
          ruleId: suggestion.ruleId,
          actionTaken: suggestion.action,
        })),
      })
    }

    const response: CalculateSuggestionsResponse = {
      suggestions,
      calculatedAt: new Date().toISOString(),
      totalContacts: contacts.length,
      rulesUsed: rules.length,
    }

    return NextResponse.json<CalculateSuggestionsResponse>(response)
  } catch (error) {
    console.error('Error al calcular sugerencias:', error)
    return NextResponse.json<ErrorResponse>(
      { error: 'Error al calcular sugerencias' },
      { status: 500 }
    )
  }
}

/**
 * suggestion_history.rule_id tiene FK contra suggestion_rules, así que las
 * reglas por defecto deben persistirse antes de poder registrar historial.
 */
async function seedDefaultRules(businessId: string): Promise<SuggestionRule[]> {
  const defaults = getDefaultRules().map((rule) => ({
    businessId,
    name: rule.name,
    description: rule.description,
    stage: rule.stage,
    daysMinContact: rule.daysMinContact,
    daysMaxContact: rule.daysMaxContact,
    actionText: rule.actionText,
    actionType: rule.actionType,
    priority: rule.priority,
    isActive: rule.isActive,
    orderNumber: rule.orderNumber,
  }))

  await db.suggestionRule.createMany({ data: defaults })

  return db.suggestionRule.findMany({
    where: { businessId, isActive: true },
    orderBy: { orderNumber: 'asc' },
  })
}
