import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import type { ActionType, DealStage, RulePriority } from '@prisma/client'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

const VALID_STAGES: DealStage[] = ['Lead', 'Propuesta_Enviada', 'Negociacion', 'Cerrado', 'Perdido']
const VALID_ACTION_TYPES: ActionType[] = ['CALL', 'WHATSAPP_MESSAGE', 'REACTIVATE', 'SEND_PROPOSAL']
const VALID_PRIORITIES: RulePriority[] = ['HIGH', 'MEDIUM', 'LOW']

interface RuleCreateInput {
  name: string
  description?: string | null
  stage: DealStage
  daysMinContact: number
  daysMaxContact?: number
  actionText: string
  actionType: ActionType
  priority: RulePriority
  isActive?: boolean
}

async function getBusinessId(): Promise<string | null> {
  const user = await currentUser()
  if (!user) return null
  const businessId = user.unsafeMetadata?.businessId
  return typeof businessId === 'string' && businessId.length > 0 ? businessId : null
}

export async function GET() {
  try {
    const businessId = await getBusinessId()
    if (!businessId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const rules = await db.suggestionRule.findMany({
      where: { businessId },
      orderBy: { orderNumber: 'asc' },
    })

    return NextResponse.json(rules)
  } catch (error) {
    console.error('Error al listar reglas:', error)
    return NextResponse.json({ error: 'Error al listar reglas' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const businessId = await getBusinessId()
    if (!businessId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = (await request.json()) as RuleCreateInput

    if (typeof body.name !== 'string' || body.name.trim().length === 0) {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 })
    }
    if (!VALID_STAGES.includes(body.stage)) {
      return NextResponse.json({ error: 'La etapa no es válida' }, { status: 400 })
    }
    if (typeof body.daysMinContact !== 'number' || body.daysMinContact < 0) {
      return NextResponse.json({ error: 'Los días mínimo deben ser 0 o más' }, { status: 400 })
    }
    if (!VALID_ACTION_TYPES.includes(body.actionType)) {
      return NextResponse.json({ error: 'El tipo de acción no es válido' }, { status: 400 })
    }
    if (!VALID_PRIORITIES.includes(body.priority)) {
      return NextResponse.json({ error: 'La prioridad no es válida' }, { status: 400 })
    }

    const lastRule = await db.suggestionRule.findFirst({
      where: { businessId },
      orderBy: { orderNumber: 'desc' },
    })

    const rule = await db.suggestionRule.create({
      data: {
        businessId,
        name: body.name.trim(),
        description: body.description ?? null,
        stage: body.stage,
        daysMinContact: body.daysMinContact,
        daysMaxContact: typeof body.daysMaxContact === 'number' ? body.daysMaxContact : -1,
        actionText: body.actionText ?? '',
        actionType: body.actionType,
        priority: body.priority,
        isActive: body.isActive ?? true,
        orderNumber: (lastRule?.orderNumber ?? 0) + 1,
      },
    })

    return NextResponse.json(rule, { status: 201 })
  } catch (error) {
    console.error('Error al crear regla:', error)
    return NextResponse.json({ error: 'Error al crear regla' }, { status: 500 })
  }
}
