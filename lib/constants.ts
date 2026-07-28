export const SITE_CONFIG = {
  name: 'CRM Claudia Shirley',
  fullName: 'CRM Claudia Shirley',
  description: 'Gestión de leads automotriz',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  businessName: 'Claudia Shirley',
  sector: 'Venta de autos',
}

export const CONTACT = {
  whatsapp: '+57 300 000 0000', // TODO: reemplazar con el WhatsApp real de Claudia Shirley
  email: 'contacto@claudiashirley.com', // TODO: reemplazar con el email real de Claudia Shirley
}

export const WHATSAPP_TEMPLATES = {
  followUp: (name: string) =>
    `Hola ${name}, te escribimos de Claudia Shirley para hacer seguimiento a tu interés en nuestros vehículos. ¿Sigues interesado/a?`,
  reactivation: (name: string) =>
    `Hola ${name}, ¿cómo estás? Queremos contarte sobre nuestras nuevas opciones de vehículos que pueden interesarte.`,
  event: (name: string) =>
    `Hola ${name}, te invitamos a nuestro próximo evento de Claudia Shirley. ¡Te esperamos!`,
}

export const ENABLE_AI_SUGGESTIONS = false // TODO: activar sugerencias con IA a futuro

export const NETRIX = {
  name: 'NETRIX Corporation',
  email: 'netrixcorporation@gmail.com',
  whatsapp: '+57 317 278 5407',
  whatsappLink: 'https://wa.me/573172785407',
  whatsappMessage: 'https://wa.me/573172785407?text=Hola%2C%20quiero%20conocer%20m%C3%A1s%20sobre%20NETRIX.',
  instagram: 'https://www.instagram.com/netrix_col/',
  linkedin: 'https://www.linkedin.com/company/netrixcol/',
  portfolio: 'https://portafolio-phi-jade-93.vercel.app',
}

export const COLORS = {
  black: '#0D0D0D',
  red: '#FF2E2E',
  white: '#FFFFFF',
  blackSoft: '#1A1A1A',
  grayDark: '#2C2C2C',
  grayLight: '#F4F4F2',
  grayMid: '#CCCCCC',
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''
export const HOTJAR_SCRIPT_SRC = process.env.NEXT_PUBLIC_HOTJAR_SCRIPT_SRC || ''

export const DEAL_STAGES = [
  { id: 'LEAD', label: 'Lead', color: '#3B82F6' },
  { id: 'LLAMADA', label: 'Llamada', color: '#F59E0B' },
  { id: 'EN_PROCESO', label: 'En proceso', color: '#F97316' },
  { id: 'CERRADO', label: 'Cerrado', color: '#22C55E' },
  { id: 'PERDIDO', label: 'Perdido', color: '#EF4444' },
] as const

export const CONTACT_SOURCES = [
  { id: 'WHATSAPP_MARKETING', label: 'WhatsApp Marketing' },
  { id: 'REFERIDO', label: 'Referido' },
  { id: 'INSTAGRAM', label: 'Instagram' },
  { id: 'FERIA_EVENTO', label: 'Feria / Evento' },
  { id: 'LLAMADA_DIRECTA', label: 'Llamada directa' },
  { id: 'EXCEL', label: 'Excel' },
  { id: 'OTRO', label: 'Otro' },
] as const

export const SERVICE_TYPES = [
  { id: 'AUTO_NUEVO', label: 'Auto nuevo' },
  { id: 'AUTO_USADO', label: 'Auto usado' },
  { id: 'SERVICIO_TECNICO', label: 'Servicio técnico' },
  { id: 'FINANCIAMIENTO', label: 'Financiamiento' },
  { id: 'PERMUTA', label: 'Permuta' },
  { id: 'OTRO', label: 'Otro' },
] as const

export const SERVICE_LEVELS = ['N1', 'N2', 'N3', 'N4'] as const

export const TEAM = {
  MONKEY: { clerkId: '', name: 'Diego Medina', role: 'Tech', alias: 'Monkey' },
  POLO: { clerkId: '', name: 'Juan Pablo Monroy', role: 'Marketing', alias: 'Polo' },
}

export const NETRIX_ATTRIBUTION = {
  text: 'Powered by NETRIX Corporation',
  url: 'https://wa.me/573172785407',
  visible: true,
}

export const isSubscriptionActive = process.env.SUBSCRIPTION_ACTIVE !== 'false'

export const CRON_DAILY_HOUR = 9
export const CRON_WEEKLY_DAY = 1
export const STAGNATION_DAYS = 3

export const PRICING_DEFAULTS = {
  defaultDealValue: 0,
  currency: 'COP',
  currencySymbol: '$',
}
