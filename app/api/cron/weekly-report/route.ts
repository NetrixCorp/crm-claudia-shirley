import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendInternalNotification } from '@/lib/email'
import { formatCOP } from '@/lib/utils'
import { DEAL_STAGES } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export async function GET() {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [allDeals, leadsNuevos, dealsGanados] = await Promise.all([
    db.deal.findMany({ where: { stage: { notIn: ['Cerrado', 'Perdido'] } } }),
    db.contact.count({ where: { createdAt: { gte: oneWeekAgo } } }),
    db.deal.findMany({ where: { stage: 'Cerrado', updatedAt: { gte: oneWeekAgo } } }),
  ])

  const revenuePipeline = allDeals.reduce((sum, d) => sum + Number(d.valueCop), 0)
  const revenueGanado = dealsGanados.reduce((sum, d) => sum + Number(d.valueCop), 0)

  const porEtapa = DEAL_STAGES.map((stage) => ({
    label: stage.label,
    count: allDeals.filter((d) => d.stage === stage.id).length,
  }))

  const html = `
    <div style="font-family: sans-serif;">
      <h2 style="color:#0D0D0D;">Reporte semanal — NETRIX CRM</h2>
      <p><strong>Leads nuevos esta semana:</strong> ${leadsNuevos}</p>
      <p><strong>Deals cerrados esta semana:</strong> ${dealsGanados.length} (${formatCOP(revenueGanado)})</p>
      <p><strong>Revenue en pipeline activo:</strong> ${formatCOP(revenuePipeline)}</p>
      <h3>Distribucion por etapa</h3>
      <ul>${porEtapa.map((s) => `<li>${s.label}: ${s.count}</li>`).join('')}</ul>
    </div>
  `

  await sendInternalNotification('Reporte semanal del pipeline', html)
  return NextResponse.json({ sent: true, leadsNuevos, dealsGanados: dealsGanados.length })
}
