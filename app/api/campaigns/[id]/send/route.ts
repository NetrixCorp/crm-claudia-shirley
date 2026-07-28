import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getBusinessId } from '@/lib/auth'
import { resolveAudience } from '@/lib/campaign-audience'
import { replaceTemplateVars, sendWhatsAppMessage } from '@/lib/whatsapp'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const businessId = await getBusinessId()
    if (!businessId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const campaign = await db.whatsappCampaign.findFirst({
      where: { id: params.id, businessId },
    })
    if (!campaign) {
      return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 })
    }

    await db.whatsappCampaign.update({
      where: { id: campaign.id },
      data: { status: 'SENDING' },
    })

    const audience = await resolveAudience(businessId, campaign.segment)

    let sentCount = 0
    for (const contact of audience) {
      if (!contact.phone) continue

      const message = replaceTemplateVars(campaign.message, contact)
      const success = await sendWhatsAppMessage(contact.phone, message)

      await db.campaignRecipient.create({
        data: {
          campaignId: campaign.id,
          contactId: contact.id,
          phone: contact.phone,
          status: success ? 'SENT' : 'FAILED',
          sentAt: success ? new Date() : null,
        },
      })

      if (success) sentCount += 1
    }

    const updated = await db.whatsappCampaign.update({
      where: { id: campaign.id },
      data: { status: 'COMPLETED', sentCount },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error al enviar campaña:', error)
    return NextResponse.json({ error: 'Error al enviar campaña' }, { status: 500 })
  }
}
