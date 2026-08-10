import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getBusinessId } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const VALID_SEGMENTS = ['ALL', 'LEAD', 'EN_PROCESO', 'CERRADO', 'PERDIDO']

interface CampaignCreateInput {
  name: string
  message: string
  segment: string
}

export async function GET() {
  try {
    const businessId = await getBusinessId()
    if (!businessId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const campaigns = await db.whatsappCampaign.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(campaigns)
  } catch (error) {
    console.error('Error al listar campañas:', error)
    return NextResponse.json({ error: 'Error al listar campañas' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const businessId = await getBusinessId()
    if (!businessId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = (await request.json()) as CampaignCreateInput

    if (typeof body.name !== 'string' || body.name.trim().length === 0) {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 })
    }
    if (typeof body.message !== 'string' || body.message.trim().length === 0) {
      return NextResponse.json({ error: 'El mensaje es obligatorio' }, { status: 400 })
    }
    if (!VALID_SEGMENTS.includes(body.segment)) {
      return NextResponse.json({ error: 'El segmento no es válido' }, { status: 400 })
    }

    const campaign = await db.whatsappCampaign.create({
      data: {
        businessId,
        name: body.name.trim(),
        message: body.message.trim(),
        segment: body.segment,
        status: 'DRAFT',
        sentCount: 0,
      },
    })

    return NextResponse.json(campaign, { status: 201 })
  } catch (error) {
    console.error('Error al crear campaña:', error)
    return NextResponse.json({ error: 'Error al crear campaña' }, { status: 500 })
  }
}
