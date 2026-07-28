import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface WhatsAppInboundMessage {
  from: string
  type: string
  text?: { body: string }
}

interface WhatsAppWebhookPayload {
  entry?: {
    changes?: {
      value?: {
        messages?: WhatsAppInboundMessage[]
      }
    }[]
  }[]
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const mode = url.searchParams.get('hub.mode')
  const verifyToken = url.searchParams.get('hub.verify_token')
  const challenge = url.searchParams.get('hub.challenge')

  if (mode === 'subscribe' && verifyToken && verifyToken === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? '', { status: 200 })
  }

  return NextResponse.json({ error: 'Verificación fallida' }, { status: 403 })
}

/**
 * Meta reintenta el webhook si no recibe 200, así que siempre respondemos
 * 200 (incluso ante errores internos) y solo logueamos el problema.
 * El match de contacto es best-effort por los últimos 10 dígitos del
 * teléfono, ya que los números no se guardan normalizados en el CRM.
 */
export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as WhatsAppWebhookPayload
    const messages = payload.entry?.[0]?.changes?.[0]?.value?.messages ?? []

    for (const message of messages) {
      const digits = message.from.replace(/\D/g, '')
      const nationalNumber = digits.slice(-10)

      const contact = nationalNumber
        ? await db.contact.findFirst({
            where: { phone: { contains: nationalNumber } },
          })
        : null

      await db.activity.create({
        data: {
          contactId: contact?.id ?? null,
          type: 'WhatsApp',
          description: message.text?.body ?? '(mensaje sin texto)',
          userId: 'whatsapp-webhook',
        },
      })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error al procesar webhook de WhatsApp:', error)
    return NextResponse.json({ success: true }, { status: 200 })
  }
}
