import { SignIn } from '@clerk/nextjs'
import { SITE_CONFIG } from '@/lib/constants'

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white tracking-widest">{SITE_CONFIG.businessName}</h1>
          <p className="text-slate-500 text-sm mt-1">CRM</p>
        </div>
        <SignIn />
        <p className="text-xs text-slate-500">
          Powered by NETRIX Corporation
        </p>
      </div>
    </main>
  )
}
