import { currentUser } from '@clerk/nextjs/server'

export async function getBusinessId(): Promise<string | null> {
  const user = await currentUser()
  if (!user) return null

  const businessId = user.unsafeMetadata?.businessId
  return typeof businessId === 'string' && businessId.length > 0 ? businessId : null
}
