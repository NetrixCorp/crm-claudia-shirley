import { db } from './db'

export interface AudienceContact {
  id: string
  name: string
  phone: string | null
  service: string | null
}

/**
 * "Solo LEAD/NEGOCIACION/CERRADO/PERDIDO" filtra por la etapa del deal más
 * reciente de cada contacto (no "alguna vez tuvo un deal en esa etapa").
 * Contactos sin teléfono se descartan: no se les puede enviar WhatsApp.
 */
export async function resolveAudience(businessId: string, segment: string): Promise<AudienceContact[]> {
  const contacts = await db.contact.findMany({
    where: { businessId },
    include: {
      deals: {
        orderBy: { updatedAt: 'desc' },
        take: 1,
      },
    },
  })

  return contacts
    .filter((contact) => Boolean(contact.phone))
    .filter((contact) => segment === 'ALL' || contact.deals[0]?.stage === segment)
    .map((contact) => ({
      id: contact.id,
      name: contact.name,
      phone: contact.phone,
      service: contact.deals[0]?.service ?? null,
    }))
}
