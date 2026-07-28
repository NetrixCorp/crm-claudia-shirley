import { NextResponse } from 'next/server'
import { getBusinessId } from '@/lib/auth'
import { resolveAudience } from '@/lib/campaign-audience'
import { replaceTemplateVars } from '@/lib/whatsapp'

export const dynamic = 'force-dynamic'

interface PreviewInput {
  segment: string
  message: string
}

interface PreviewResponse {
  count: number
  previewMessage: string | null
  sampleContactName: string | null
}

/**
 * No listada explícitamente en la tarea, pero el wizard (paso 2-4) necesita
 * el conteo de destinatarios y una vista previa con datos reales antes de
 * crear la campaña, así que se agrega este endpoint de solo lectura.
 */
export async function POST(request: Request) {
  try {
    const businessId = await getBusinessId()
    if (!businessId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = (await request.json()) as PreviewInput
    const audience = await resolveAudience(businessId, body.segment)
    const sample = audience[0] ?? null

    const response: PreviewResponse = {
      count: audience.length,
      previewMessage: sample ? replaceTemplateVars(body.message ?? '', sample) : null,
      sampleContactName: sample?.name ?? null,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error al calcular audiencia de campaña:', error)
    return NextResponse.json({ error: 'Error al calcular audiencia' }, { status: 500 })
  }
}
