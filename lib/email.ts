import { Resend } from 'resend'
import { NETRIX } from './constants'

export async function sendInternalNotification(subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('Resend no configurado: falta RESEND_API_KEY')
    return
  }

  const resend = new Resend(apiKey)

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'NETRIX CRM <onboarding@resend.dev>',
      to: NETRIX.email,
      subject,
      html,
    })
  } catch (error) {
    console.error('Error enviando notificacion interna:', error)
  }
}
