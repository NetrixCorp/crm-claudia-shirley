import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const now = new Date()
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  const [allDeals, allContacts] = await Promise.all([
    db.deal.findMany({
      select: {
        id: true,
        valueCop: true,
        stage: true,
        createdAt: true,
        updatedAt: true,
        contact: { select: { source: true } },
      },
      orderBy: { createdAt: 'asc' },
    }),
    db.contact.findMany({
      select: { source: true, createdAt: true },
      where: { createdAt: { gte: sixMonthsAgo } },
    }),
  ])

  // Revenue por mes (últimos 6 meses) — deals cerrados
  const revenueByMonth: Record<string, number> = {}
  const dealsByMonth: Record<string, number> = {}

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = d.toLocaleDateString('es-CO', { month: 'short', year: '2-digit' })
    revenueByMonth[key] = 0
    dealsByMonth[key] = 0
  }

  allDeals.forEach((deal) => {
    const d = new Date(deal.updatedAt)
    const key = d.toLocaleDateString('es-CO', { month: 'short', year: '2-digit' })
    if (deal.stage === 'Cerrado' && revenueByMonth[key] !== undefined) {
      revenueByMonth[key] += Number(deal.valueCop)
    }
    if (dealsByMonth[key] !== undefined) {
      dealsByMonth[key] += 1
    }
  })

  const revenueChart = Object.entries(revenueByMonth).map(([mes, revenue]) => ({
    mes,
    revenue,
    deals: dealsByMonth[mes] || 0,
  }))

  // Fuentes de leads
  const sourceCount: Record<string, number> = {}
  allContacts.forEach((c) => {
    sourceCount[c.source] = (sourceCount[c.source] || 0) + 1
  })
  const sourcesChart = Object.entries(sourceCount)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)

  // Distribución por etapa
  const stageCount: Record<string, { count: number; value: number }> = {}
  allDeals.forEach((deal) => {
    if (!stageCount[deal.stage]) stageCount[deal.stage] = { count: 0, value: 0 }
    stageCount[deal.stage].count += 1
    stageCount[deal.stage].value += Number(deal.valueCop)
  })
  const stagesChart = Object.entries(stageCount).map(([stage, data]) => ({
    stage,
    count: data.count,
    value: data.value,
  }))

  // Tasa de conversión
  const total = allDeals.length
  const cerrados = allDeals.filter((d) => d.stage === 'Cerrado').length
  const perdidos = allDeals.filter((d) => d.stage === 'Perdido').length
  const conversionRate = total > 0 ? Math.round((cerrados / total) * 100) : 0

  return NextResponse.json({
    revenueChart,
    sourcesChart,
    stagesChart,
    summary: { total, cerrados, perdidos, conversionRate },
  })
}
