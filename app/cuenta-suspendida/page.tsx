import { NETRIX, SITE_CONFIG } from '@/lib/constants'

export default function CuentaSuspendidaPage() {
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold text-white tracking-widest mb-2">{SITE_CONFIG.businessName}</h1>
        <div className="w-12 h-0.5 bg-brand-accent mx-auto mb-6" />
        <h2 className="text-lg font-semibold text-white mb-3">Acceso suspendido</h2>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          Tu acceso al sistema está temporalmente suspendido. Para regularizar tu cuenta,
          comunicate con el equipo de NETRIX.
        </p>
        <a
          href={NETRIX.whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-brand-accent text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity text-sm"
        >
          Contactar por WhatsApp
        </a>
      </div>
    </main>
  )
}
