export type CampaignSegment = 'ALL' | 'Lead' | 'Negociacion' | 'Cerrado' | 'Perdido'
export type CampaignStatus = 'DRAFT' | 'SENDING' | 'COMPLETED'

export interface CampaignData {
  id: string
  name: string
  message: string
  segment: CampaignSegment
  status: CampaignStatus
  sentCount: number
  createdAt: string
}
