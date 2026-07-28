-- CreateEnum
CREATE TYPE "ContactSource" AS ENUM ('WHATSAPP_MARKETING', 'REFERIDO', 'INSTAGRAM', 'FERIA_EVENTO', 'LLAMADA_DIRECTA', 'EXCEL', 'OTRO');

-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('Activo', 'Inactivo', 'Ganado', 'Perdido');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('AUTO_NUEVO', 'AUTO_USADO', 'SERVICIO_TECNICO', 'FINANCIAMIENTO', 'PERMUTA', 'OTRO');

-- CreateEnum
CREATE TYPE "ServiceLevel" AS ENUM ('N1', 'N2', 'N3', 'N4');

-- CreateEnum
CREATE TYPE "DealStage" AS ENUM ('LEAD', 'LLAMADA', 'EN_PROCESO', 'CERRADO', 'PERDIDO');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('Llamada', 'WhatsApp', 'Email', 'Reunion', 'Nota', 'Propuesta', 'Cierre');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('Llamada', 'Reunion', 'FollowUp');

-- CreateEnum
CREATE TYPE "AutomationStatus" AS ENUM ('pending', 'success', 'failed');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('CALL', 'WHATSAPP_MESSAGE', 'REACTIVATE', 'SEND_PROPOSAL');

-- CreateEnum
CREATE TYPE "RulePriority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "source" "ContactSource" NOT NULL DEFAULT 'OTRO',
    "status" "ContactStatus" NOT NULL DEFAULT 'Activo',
    "lead_score" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deals" (
    "id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "service" "ServiceType" NOT NULL,
    "level" "ServiceLevel" NOT NULL DEFAULT 'N1',
    "value_cop" BIGINT NOT NULL DEFAULT 0,
    "stage" "DealStage" NOT NULL DEFAULT 'LEAD',
    "probability" INTEGER NOT NULL DEFAULT 10,
    "next_follow_up" TIMESTAMP(3),
    "stagnated_at" TIMESTAMP(3),
    "notes" TEXT,
    "assigned_to" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "deal_id" TEXT,
    "contact_id" TEXT,
    "type" "ActivityType" NOT NULL,
    "description" TEXT NOT NULL,
    "outcome" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_events" (
    "id" TEXT NOT NULL,
    "deal_id" TEXT NOT NULL,
    "google_event_id" TEXT,
    "title" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "event_type" "EventType" NOT NULL DEFAULT 'Reunion',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_logs" (
    "id" TEXT NOT NULL,
    "auto_type" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "status" "AutomationStatus" NOT NULL DEFAULT 'pending',
    "details" JSONB,
    "deal_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "automation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suggestion_rules" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "stage" "DealStage" NOT NULL,
    "days_min_contact" INTEGER NOT NULL,
    "days_max_contact" INTEGER NOT NULL DEFAULT -1,
    "action_text" TEXT NOT NULL,
    "action_type" "ActionType" NOT NULL,
    "priority" "RulePriority" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "order_number" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suggestion_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suggestion_history" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "rule_id" TEXT NOT NULL,
    "action_taken" TEXT NOT NULL,
    "was_helpful" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "suggestion_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_campaigns" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "segment" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "sent_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_recipients" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3),
    "status" TEXT NOT NULL,

    CONSTRAINT "campaign_recipients_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_logs" ADD CONSTRAINT "automation_logs_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suggestion_history" ADD CONSTRAINT "suggestion_history_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suggestion_history" ADD CONSTRAINT "suggestion_history_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "suggestion_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_recipients" ADD CONSTRAINT "campaign_recipients_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "whatsapp_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_recipients" ADD CONSTRAINT "campaign_recipients_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
