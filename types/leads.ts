import type { ContactSource, DealStage, ServiceType } from '@prisma/client'

export interface NewLead {
  name: string
  phone: string
  stage: DealStage
  source: ContactSource
  service?: ServiceType
  needsReview?: boolean
}
