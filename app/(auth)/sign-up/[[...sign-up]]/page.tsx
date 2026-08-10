import { SignUp } from '@clerk/nextjs'
import { SITE_CONFIG } from '@/lib/constants'

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-brand-black">
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white tracking-widest">{SITE_CONFIG.businessName}</h1>
          <p className="text-brand-gray-mid text-sm mt-1">CRM</p>
        </div>
        <SignUp />
      </div>
    </main>
  )
}
