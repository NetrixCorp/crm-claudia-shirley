// Paleta: Claudia Shirley — aprobada en [PENDIENTE CONFIRMAR CON CLIENTE]
// NOTA: No usar colores NETRIX (#0D0D0D, #FF2E2E) en proyectos de clientes
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1E3A5F',
          accent: '#2E86AB',
          light: '#F0F4F8',
          text: '#1A1A2E',
          muted: '#6B7280',
        },
        stage: {
          lead: '#3B82F6',
          llamada: '#F59E0B',
          enproceso: '#F97316',
          cerrado: '#10B981',
          perdido: '#EF4444',
        },
      },
    },
  },
  plugins: [],
}

export default config
