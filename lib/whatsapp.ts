const META_GRAPH_VERSION = 'v21.0'

/**
 * Contact no guarda el servicio (vive en Deal), así que quien llama a
 * replaceTemplateVars debe resolver el servicio desde el deal más reciente.
 */
export interface TemplateContact {
  name: string
  service?: string | null
}

function normalizePhone(phone: string): string {
  let clean = phone.replace(/\D/g, '')
  if (clean.length === 10) clean = `57${clean}`
  return clean
}

export async function sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
  const token = process.env.WHATSAPP_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!token || !phoneNumberId) {
    console.warn('WhatsApp no configurado: faltan WHATSAPP_TOKEN o WHATSAPP_PHONE_NUMBER_ID')
    return false
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/${META_GRAPH_VERSION}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: normalizePhone(phone),
          type: 'text',
          text: { body: message },
        }),
      }
    )

    if (!res.ok) {
      const errorBody = await res.text()
      console.error('Error al enviar mensaje de WhatsApp:', res.status, errorBody)
      return false
    }

    return true
  } catch (error) {
    console.error('Error al enviar mensaje de WhatsApp:', error)
    return false
  }
}

export function replaceTemplateVars(template: string, contact: TemplateContact): string {
  return template
    .replace(/\[Nombre\]/g, contact.name)
    .replace(/\[Servicio\]/g, contact.service?.trim() || 'nuestros vehículos')
}
