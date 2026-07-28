import type { ActionType, DealStage, RulePriority } from '@prisma/client'

export interface SuggestionRuleData {
  id: string
  name: string
  description: string | null
  stage: DealStage
  daysMinContact: number
  daysMaxContact: number
  actionText: string
  actionType: ActionType
  priority: RulePriority
  isActive: boolean
  orderNumber: number
}
