import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendInternalNotification } from '@/lib/email'
import { formatCOP } from '@/lib/utils'
import { STAGNATION_DAYS } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export async function GET() {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  const stagnationCutoff = new Date(now.getTime() - STAGNATION_DAYS * 24 * 60 * 60 * 1000)

  const [followUpsHoy, dealsEstancados] = await Promise.all([
    db.deal.findMany({
      where: { nextFollowUp: { gte: startOfDay, lte: endOfDay } },
      include: { contact: true },
    }),
    db.deal.findMany({
      where: {
        stage: { notIn: ['Cerrado', 'Perdido'] },
        updatedAt: { lt: stagnationCutoff },
      },
      include: { contact: true },
    }),
  ])

  if (followUpsHoy.length === 0 && dealsEstancados.length === 0) {
    return NextResponse.json({ sent: false, reason: 'Nada que reportar hoy' })
  }

  const html = `
    <div style="font-family: sans-serif;">
      <h2 style="color:#0D0D0D;">Resumen diario — NETRIX CRM</h2>
      ${followUpsHoy.length > 0 ? `
        <h3>Seguimientos de hoy (${followUpsHoy.length})</h3>
        <ul>${followUpsHoy.map((d) => `<li>${d.title} — ${d.contact.name} — ${formatCOP(Number(d.valueCop))}</li>`).join('')}</ul>
      ` : ''}
      ${dealsEstancados.length > 0 ? `
        <h3>Deals sin movimiento hace +${STAGNATION_DAYS} dias (${dealsEstancados.length})</h3>
        <ul>${dealsEstancados.map((d) => `<li>${d.title} — ${d.contact.name} — etapa: ${d.stage}</li>`).join('')}</ul>
      ` : ''}
    </div>
  `

  await sendInternalNotification('Resumen diario del CRM', html)
  return NextResponse.json({
    sent: true,
    followUpsHoy: followUpsHoy.length,
    dealsEstancados: dealsEstancados.length,
  })
}
