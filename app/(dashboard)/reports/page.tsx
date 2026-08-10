import { ReportsCharts } from '@/components/crm/ReportsCharts'
import { ReportsTable } from '@/components/crm/ReportsTable'

export const dynamic = 'force-dynamic'

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Reportes</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-lg mt-1">
          Análisis del pipeline comercial. Las gráficas se actualizan en
          tiempo real con los datos del CRM. A más deals registrados y movidos entre
          etapas, más preciso se vuelve el análisis.
        </p>
      </div>

      <ReportsCharts />

      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Todos los deals</h2>
        <ReportsTable />
      </div>
    </div>
  )
}
