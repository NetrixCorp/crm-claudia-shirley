import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

function serializeDeal(deal: any) {
  return { ...deal, valueCop: Number(deal.valueCop) }
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const deals = await db.deal.findMany({
    orderBy: { createdAt: 'desc' },
    include: { contact: true },
  })
  return NextResponse.json(deals.map(serializeDeal))
}

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await request.json()
  const deal = await db.deal.create({
    data: {
      contactId: body.contactId,
      title: body.title,
      service: body.service,
      level: body.level || 'N1',
      valueCop: BigInt(body.valueCop || 0),
      stage: body.stage || 'Lead',
      probability: body.probability ?? 10,
      nextFollowUp: body.nextFollowUp ? new Date(body.nextFollowUp) : null,
      userId,
    },
    include: { contact: true },
  })
  return NextResponse.json(serializeDeal(deal), { status: 201 })
}
