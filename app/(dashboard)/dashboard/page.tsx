import { db } from '@/lib/db'
import { formatCOP } from '@/lib/utils'
import { KPICard } from '@/components/crm/KPICard'
import { SuggestionPanel } from '@/components/suggestions/SuggestionPanel'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

  const [leadsActivos, dealsAbiertos, dealsCerrados, followUpsHoy] = await Promise.all([
    db.contact.count({ where: { status: 'Activo' } }),
    db.deal.findMany({
      where: { stage: { notIn: ['Cerrado', 'Perdido'] } },
      select: { valueCop: true },
    }),
    db.deal.count({ where: { stage: 'Cerrado' } }),
    db.deal.count({ where: { nextFollowUp: { gte: startOfDay, lte: endOfDay } } }),
  ])

  const revenuePipeline = dealsAbiertos.reduce((sum, d) => sum + Number(d.valueCop), 0)
  const sinDatos = leadsActivos === 0 && dealsCerrados === 0 && followUpsHoy === 0

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
      <p className="text-brand-gray-mid text-sm mb-8">
        Vista general del pipeline comercial
      </p>
      {sinDatos && (
        <div className="bg-brand-black-soft border border-brand-gray-dark rounded-lg p-6 mb-6">
          <h3 className="text-white font-semibold mb-2">Bienvenido al CRM de Claudia Shirley</h3>
          <p className="text-brand-gray-mid text-sm leading-relaxed mb-4">
            Para empezar, seguí estos 3 pasos:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-brand-red font-bold text-sm w-5 flex-shrink-0">1.</span>
              <p className="text-brand-gray-mid text-sm">
                <span className="text-white font-medium">Agregá un contacto</span> — Andá a la sección &quot;Contactos&quot; y creá tu primer lead con su nombre, teléfono y de dónde llegó.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-brand-red font-bold text-sm w-5 flex-shrink-0">2.</span>
              <p className="text-brand-gray-mid text-sm">
                <span className="text-white font-medium">Creá un deal</span> — En &quot;Pipeline&quot;, usá el botón &quot;Nuevo deal&quot; para registrar la oportunidad de venta y su valor.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-brand-red font-bold text-sm w-5 flex-shrink-0">3.</span>
              <p className="text-brand-gray-mid text-sm">
                <span className="text-white font-medium">Mové el deal</span> — Arrastrá la card entre columnas a medida que avanza la venta. El sistema te manda un email automático en cada cambio.
              </p>
            </div>
          </div>
        </div>
      )}
      <SuggestionPanel />
      <div className="grid grid-cols-4 gap-4">
        <KPICard label="Leads activos" value={String(leadsActivos)} />
        <KPICard label="Revenue pipeline" value={formatCOP(revenuePipeline)} />
        <KPICard label="Deals cerrados" value={String(dealsCerrados)} />
        <KPICard label="Follow-ups hoy" value={String(followUpsHoy)} />
      </div>
    </div>
  )
}
