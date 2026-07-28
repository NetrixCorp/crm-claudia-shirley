import { ReportsCharts } from '@/components/crm/ReportsCharts'

export const dynamic = 'force-dynamic'

export default function ReportsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-text">Reportes</h1>
        <p className="text-brand-muted text-sm max-w-lg">
          Análisis del pipeline comercial. Las gráficas se actualizan en
          tiempo real con los datos del CRM. A más deals registrados y movidos entre
          etapas, más preciso se vuelve el análisis.
        </p>
      </div>
      <ReportsCharts />
    </div>
  )
}
