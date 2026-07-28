# CRM Claudia Shirley

CRM interno para la gestión de leads y pipeline comercial de **Claudia Shirley**
(venta de autos). Permite registrar contactos, dar seguimiento a oportunidades
de venta (deals) a través de un pipeline por etapas, recibir sugerencias
automáticas de acciones a tomar con cada cliente, importar leads pegados desde
WhatsApp y lanzar campañas de mensajes masivos por WhatsApp segmentadas por
etapa del pipeline.

> Este proyecto corre sobre una base de datos PostgreSQL **compartida** con
> `crm-interno` (multi-tenant). Todas las tablas usan una columna `business_id`
> para separar los datos de cada cliente. Antes de modificar enums o modelos
> del schema de Prisma, confirmá que el cambio no afecta a otros tenants.

## Stack tecnológico

- **Framework:** Next.js 14 (App Router) + React 18 + TypeScript (strict)
- **Estilos:** Tailwind CSS
- **Base de datos:** PostgreSQL (Supabase) vía Prisma ORM
- **Autenticación:** Clerk
- **Emails transaccionales:** Resend
- **Mensajería:** WhatsApp Cloud API (Meta)
- **Calendario:** Google Calendar API
- **Analítica:** Google Analytics / Hotjar (opcional)
- **Hosting:** Vercel

## Setup local

1. **Clonar el repo e instalar dependencias**

   ```bash
   git clone https://github.com/NetrixCorp/crm-claudia-shirley.git
   cd crm-claudia-shirley
   npm install
   ```

   `npm install` corre `prisma generate` automáticamente (hook `postinstall`).

2. **Configurar variables de entorno**

   Copiá `.env.example` a `.env.local` y completá los valores reales
   (ver sección [Variables de entorno](#variables-de-entorno) más abajo):

   ```bash
   cp .env.example .env.local
   ```

3. **Sincronizar el schema de Prisma con la base de datos**

   Este proyecto usa `db push` (no `migrate`), porque la base de datos es
   compartida con otro proyecto y no lleva historial de migraciones propio:

   ```bash
   npx prisma db push
   ```

4. **Levantar el servidor de desarrollo**

   ```bash
   npm run dev
   ```

   La app queda disponible en [http://localhost:3000](http://localhost:3000).

### Otros scripts disponibles

| Comando           | Qué hace                                   |
| ----------------- | ------------------------------------------- |
| `npm run build`   | Build de producción                         |
| `npm run start`   | Sirve el build de producción                |
| `npm run lint`    | Corre ESLint                                |
| `npx tsc --noEmit`| Chequeo de tipos sin generar archivos       |

## Variables de entorno

Ninguna de estas debe tener valores reales en el repositorio (todos los
archivos `.env*` están en `.gitignore`).

| Variable | Requerida | Descripción |
| --- | --- | --- |
| `DATABASE_URL` | Sí | Connection string de PostgreSQL (pooled, para runtime) |
| `DIRECT_URL` | Sí | Connection string directa de PostgreSQL (para `prisma db push`) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Sí | Clave pública de Clerk |
| `CLERK_SECRET_KEY` | Sí | Clave secreta de Clerk |
| `RESEND_API_KEY` | No | Habilita el envío de notificaciones internas por email |
| `RESEND_FROM_EMAIL` | No | Remitente de los emails (tiene un default) |
| `WHATSAPP_TOKEN` | No | Token de acceso de WhatsApp Cloud API (Meta) |
| `WHATSAPP_PHONE_NUMBER_ID` | No | ID del número de WhatsApp Business |
| `WHATSAPP_VERIFY_TOKEN` | No | Token propio para verificar el webhook de Meta |
| `GOOGLE_CLIENT_ID` | No | Habilita la integración con Google Calendar |
| `GOOGLE_CLIENT_SECRET` | No | Habilita la integración con Google Calendar |
| `GOOGLE_REDIRECT_URI` | No | URL de callback OAuth de Google |
| `NEXT_PUBLIC_SITE_URL` | No | URL pública del sitio (default `http://localhost:3000`) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | No | Google Analytics |
| `NEXT_PUBLIC_HOTJAR_SCRIPT_SRC` | No | Hotjar |
| `SUBSCRIPTION_ACTIVE` | No | Poner en `false` para bloquear el acceso (default: activo) |

Las funcionalidades marcadas como "No requerida" están diseñadas para
degradar de forma segura: si falta la variable, la funcionalidad queda
deshabilitada (con un warning en consola) en vez de romper la app.

## Deploy en Vercel

1. Importar el repositorio de GitHub en [Vercel](https://vercel.com/new).
2. Configurar todas las variables de entorno listadas arriba en
   **Project Settings → Environment Variables** (usar los valores reales
   de producción, nunca los de `.env.local`).
3. Verificar que el **Build Command** sea `next build` y el **Install Command**
   `npm install` (defaults de Next.js, no requieren configuración adicional).
4. Después del primer deploy, correr `npx prisma db push` apuntando a la base
   de datos de producción (localmente, con `DATABASE_URL`/`DIRECT_URL` de
   producción) para asegurarte de que el schema esté sincronizado.
5. Si usás el webhook de WhatsApp, configurar en Meta la URL
   `https://<tu-dominio>/api/webhooks/whatsapp` con el mismo
   `WHATSAPP_VERIFY_TOKEN` configurado en Vercel.

## Créditos

Desarrollado por **NETRIX Corporation**.
