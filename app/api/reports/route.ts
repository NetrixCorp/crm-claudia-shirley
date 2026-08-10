import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null
  return Math.round(((current - previous) / previous) * 100)
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const now = new Date()
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  const [allDeals, allContacts] = await Promise.all([
    db.deal.findMany({
      select: {
        id: true,
        title: true,
        valueCop: true,
        stage: true,
        createdAt: true,
        updatedAt: true,
        contact: { select: { name: true, source: true } },
      },
      orderBy: { createdAt: 'asc' },
    }),
    db.contact.findMany({
      select: { source: true, createdAt: true },
      where: { createdAt: { gte: sixMonthsAgo } },
    }),
  ])

  // Revenue y volumen por mes (últimos 6 meses), bucketed por updatedAt
  const revenueByMonth: Record<string, number> = {}
  const dealsByMonth: Record<string, number> = {}
  const cerradosByMonth: Record<string, number> = {}

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = d.toLocaleDateString('es-CO', { month: 'short', year: '2-digit' })
    revenueByMonth[key] = 0
    dealsByMonth[key] = 0
    cerradosByMonth[key] = 0
  }

  allDeals.forEach((deal) => {
    const d = new Date(deal.updatedAt)
    const key = d.toLocaleDateString('es-CO', { month: 'short', year: '2-digit' })
    if (deal.stage === 'CERRADO' && revenueByMonth[key] !== undefined) {
      revenueByMonth[key] += Number(deal.valueCop)
    }
    if (dealsByMonth[key] !== undefined) {
      dealsByMonth[key] += 1
      if (deal.stage === 'CERRADO') cerradosByMonth[key] += 1
    }
  })

  const revenueChart = Object.entries(revenueByMonth).map(([mes, revenue]) => ({
    mes,
    revenue,
    deals: dealsByMonth[mes] || 0,
  }))

  const conversionByMonth = Object.keys(dealsByMonth).map((mes) => ({
    mes,
    rate: dealsByMonth[mes] > 0 ? Math.round((cerradosByMonth[mes] / dealsByMonth[mes]) * 100) : 0,
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

  // Tasa de conversión (histórica, todo el tiempo)
  const total = allDeals.length
  const cerrados = allDeals.filter((d) => d.stage === 'CERRADO').length
  const perdidos = allDeals.filter((d) => d.stage === 'PERDIDO').length
  const conversionRate = total > 0 ? Math.round((cerrados / total) * 100) : 0

  // Top 5 deals por valor
  const topDeals = [...allDeals]
    .sort((a, b) => Number(b.valueCop) - Number(a.valueCop))
    .slice(0, 5)
    .map((d) => ({
      id: d.id,
      title: d.title,
      contactName: d.contact?.name ?? '—',
      valueCop: Number(d.valueCop),
      stage: d.stage,
    }))

  // KPIs de mes actual vs mes anterior (única base de comparación real: creado/actualizado en el mes)
  const dealsThisMonth = allDeals.filter((d) => d.createdAt >= startOfThisMonth && d.createdAt < startOfNextMonth)
  const dealsLastMonth = allDeals.filter((d) => d.createdAt >= startOfLastMonth && d.createdAt < startOfThisMonth)
  const dealsThisMonthValue = dealsThisMonth.reduce((sum, d) => sum + Number(d.valueCop), 0)
  const dealsLastMonthValue = dealsLastMonth.reduce((sum, d) => sum + Number(d.valueCop), 0)

  const cerradosThisMonth = allDeals.filter(
    (d) => d.stage === 'CERRADO' && d.updatedAt >= startOfThisMonth && d.updatedAt < startOfNextMonth
  )
  const cerradosLastMonth = allDeals.filter(
    (d) => d.stage === 'CERRADO' && d.updatedAt >= startOfLastMonth && d.updatedAt < startOfThisMonth
  )

  const conversionThisMonth =
    dealsThisMonth.length > 0
      ? Math.round((dealsThisMonth.filter((d) => d.stage === 'CERRADO').length / dealsThisMonth.length) * 100)
      : 0
  const conversionLastMonth =
    dealsLastMonth.length > 0
      ? Math.round((dealsLastMonth.filter((d) => d.stage === 'CERRADO').length / dealsLastMonth.length) * 100)
      : 0

  const revenuePipeline = allDeals
    .filter((d) => d.stage !== 'CERRADO' && d.stage !== 'PERDIDO')
    .reduce((sum, d) => sum + Number(d.valueCop), 0)

  const kpis = {
    dealsCreatedThisMonth: dealsThisMonth.length,
    dealsCreatedChange: pctChange(dealsThisMonth.length, dealsLastMonth.length),
    revenuePipeline,
    revenuePipelineChange: pctChange(dealsThisMonthValue, dealsLastMonthValue),
    conversionRate: conversionThisMonth,
    conversionRateChange: pctChange(conversionThisMonth, conversionLastMonth),
    dealsCerradosThisMonth: cerradosThisMonth.length,
    dealsCerradosChange: pctChange(cerradosThisMonth.length, cerradosLastMonth.length),
  }

  return NextResponse.json({
    revenueChart,
    conversionByMonth,
    sourcesChart,
    stagesChart,
    topDeals,
    kpis,
    summary: { total, cerrados, perdidos, conversionRate },
  })
}
