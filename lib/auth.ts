import { currentUser } from '@clerk/nextjs/server'

export async function getBusinessId(): Promise<string | null> {
  const user = await currentUser()
  console.error('userId:', user?.id)
  console.error('user:', user)
  if (!user) return null

  const businessId = user.publicMetadata?.businessId
  console.error('businessId:', businessId)
  return typeof businessId === 'string' && businessId.length > 0 ? businessId : null
}
