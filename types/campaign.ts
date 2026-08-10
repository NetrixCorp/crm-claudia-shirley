export type CampaignSegment = 'ALL' | 'LEAD' | 'EN_PROCESO' | 'CERRADO' | 'PERDIDO'
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
