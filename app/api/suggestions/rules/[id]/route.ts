import { NextResponse } from 'next/server'
import type { ActionType, DealStage, RulePriority } from '@prisma/client'
import { db } from '@/lib/db'
import { getBusinessId } from '@/lib/auth'

const VALID_STAGES: DealStage[] = ['LEAD', 'LLAMADA', 'EN_PROCESO', 'CERRADO', 'PERDIDO']
const VALID_ACTION_TYPES: ActionType[] = ['CALL', 'WHATSAPP_MESSAGE', 'REACTIVATE', 'SEND_PROPOSAL']
const VALID_PRIORITIES: RulePriority[] = ['HIGH', 'MEDIUM', 'LOW']

interface RuleUpdateInput {
  name?: string
  description?: string | null
  stage?: DealStage
  daysMinContact?: number
  daysMaxContact?: number
  actionText?: string
  actionType?: ActionType
  priority?: RulePriority
  isActive?: boolean
  orderNumber?: number
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const businessId = await getBusinessId()
    if (!businessId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = (await request.json()) as RuleUpdateInput

    if (body.name !== undefined && body.name.trim().length === 0) {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 })
    }
    if (body.stage !== undefined && !VALID_STAGES.includes(body.stage)) {
      return NextResponse.json({ error: 'La etapa no es válida' }, { status: 400 })
    }
    if (
      body.daysMinContact !== undefined &&
      (typeof body.daysMinContact !== 'number' || body.daysMinContact < 0)
    ) {
      return NextResponse.json({ error: 'Los días mínimo deben ser 0 o más' }, { status: 400 })
    }
    if (body.actionType !== undefined && !VALID_ACTION_TYPES.includes(body.actionType)) {
      return NextResponse.json({ error: 'El tipo de acción no es válido' }, { status: 400 })
    }
    if (body.priority !== undefined && !VALID_PRIORITIES.includes(body.priority)) {
      return NextResponse.json({ error: 'La prioridad no es válida' }, { status: 400 })
    }

    const { count } = await db.suggestionRule.updateMany({
      where: { id: params.id, businessId },
      data: {
        ...(body.name !== undefined && { name: body.name.trim() }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.stage !== undefined && { stage: body.stage }),
        ...(body.daysMinContact !== undefined && { daysMinContact: body.daysMinContact }),
        ...(body.daysMaxContact !== undefined && { daysMaxContact: body.daysMaxContact }),
        ...(body.actionText !== undefined && { actionText: body.actionText }),
        ...(body.actionType !== undefined && { actionType: body.actionType }),
        ...(body.priority !== undefined && { priority: body.priority }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.orderNumber !== undefined && { orderNumber: body.orderNumber }),
      },
    })

    if (count === 0) {
      return NextResponse.json({ error: 'Regla no encontrada' }, { status: 404 })
    }

    const rule = await db.suggestionRule.findUnique({ where: { id: params.id } })
    return NextResponse.json(rule)
  } catch (error) {
    console.error('Error al actualizar regla:', error)
    return NextResponse.json({ error: 'Error al actualizar regla' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const businessId = await getBusinessId()
    if (!businessId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { count } = await db.suggestionRule.deleteMany({
      where: { id: params.id, businessId },
    })

    if (count === 0) {
      return NextResponse.json({ error: 'Regla no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al eliminar regla:', error)
    return NextResponse.json({ error: 'Error al eliminar regla' }, { status: 500 })
  }
}
