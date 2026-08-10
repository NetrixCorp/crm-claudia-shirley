import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { isSubscriptionActive, NETRIX_ATTRIBUTION } from '@/lib/constants'
import { Sidebar } from '@/components/layout/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  if (!isSubscriptionActive) redirect('/cuenta-suspendida')

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />
      <main className="flex-1 overflow-auto flex flex-col">
        <div className="p-8 flex-1">{children}</div>
        {NETRIX_ATTRIBUTION.visible && (
          <footer className="border-t border-slate-800 p-4 text-center">
            <a
              href={NETRIX_ATTRIBUTION.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 text-xs hover:text-brand-accent transition-colors"
            >
              {NETRIX_ATTRIBUTION.text}
            </a>
          </footer>
        )}
      </main>
    </div>
  )
}
