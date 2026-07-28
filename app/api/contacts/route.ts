import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { sendInternalNotification } from '@/lib/email'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const contacts = await db.contact.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { deals: true } } },
  })
  return NextResponse.json(contacts)
}

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await request.json()
  const contact = await db.contact.create({
    data: {
      name: body.name,
      email: body.email || null,
      phone: body.phone || null,
      company: body.company || null,
      source: body.source || 'Otro',
      status: body.status || 'Activo',
      userId,
    },
  })

  await sendInternalNotification(
    `Nuevo contacto: ${contact.name}`,
    `<div style="font-family: sans-serif;">
      <h2 style="color:#0D0D0D;">Nuevo contacto registrado</h2>
      <p><strong>Nombre:</strong> ${contact.name}</p>
      <p><strong>Empresa:</strong> ${contact.company || '—'}</p>
      <p><strong>Fuente:</strong> ${contact.source}</p>
      <p><strong>Email:</strong> ${contact.email || '—'}</p>
      <p><strong>Teléfono:</strong> ${contact.phone || '—'}</p>
    </div>`
  )

  return NextResponse.json(contact, { status: 201 })
}
