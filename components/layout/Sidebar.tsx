'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  Briefcase,
  BarChart2,
  Settings,
  MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SITE_CONFIG } from '@/lib/constants'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pipeline', label: 'Pipeline', icon: KanbanSquare },
  { href: '/contacts', label: 'Contactos', icon: Users },
  { href: '/deals', label: 'Deals', icon: Briefcase },
  { href: '/reports', label: 'Reportes', icon: BarChart2 },
  {
    href: '/configuracion/reglas',
    label: 'Configuración',
    icon: Settings,
    subItems: [{ label: 'Reglas de Sugerencias', href: '/configuracion/reglas' }],
  },
  { href: '/campanas', label: 'Campañas', icon: MessageSquare },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0 flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-accent rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
            CS
          </div>
          <div className="min-w-0">
            <h1 className="text-white font-bold truncate">{SITE_CONFIG.businessName}</h1>
            <p className="text-xs text-slate-400">CRM de Ventas</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon, subItems }) => {
          const active = pathname === href || (subItems?.some((s) => s.href === pathname) ?? false)
          return (
            <div key={href}>
              <Link
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                  active
                    ? 'bg-brand-accent text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                )}
              >
                <Icon size={18} />
                {label}
              </Link>
              {subItems && (
                <div className="ml-8 mt-1 space-y-1">
                  {subItems.map((sub) => {
                    const subActive = pathname === sub.href
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={cn(
                          'block px-3 py-1.5 rounded-lg text-xs transition-colors',
                          subActive
                            ? 'text-white font-semibold'
                            : 'text-slate-400 hover:text-white'
                        )}
                      >
                        {sub.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
      <div className="p-4 border-t border-slate-800 flex items-center gap-3">
        <UserButton afterSignOutUrl="/sign-in" />
        <span className="text-xs text-slate-400">Mi cuenta</span>
      </div>
    </aside>
  )
}
