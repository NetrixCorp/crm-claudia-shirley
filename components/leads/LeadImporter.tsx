'use client'

import { useMemo, useState } from 'react'
import { X, Upload } from 'lucide-react'
import type { ServiceType } from '@prisma/client'
import { SERVICE_TYPES } from '@/lib/constants'
import type { NewLead } from '@/types/leads'

interface LeadImporterProps {
  onImport: (leads: NewLead[]) => void
  onClose: () => void
}

const PHONE_PATTERN = /(\+?\d[\d\s().-]{5,}\d)/

function parseLine(line: string): NewLead {
  const trimmed = line.trim()

  if (!trimmed) {
    return { name: '', phone: '', stage: 'LEAD', source: 'WhatsApp', needsReview: true }
  }

  const match = trimmed.match(PHONE_PATTERN)

  if (!match || match.index === undefined) {
    return { name: trimmed, phone: '', stage: 'LEAD', source: 'WhatsApp', needsReview: true }
  }

  const rawPhone = match[0]
  const digits = rawPhone.replace(/\D/g, '')
  const before = trimmed.slice(0, match.index)
  const after = trimmed.slice(match.index + rawPhone.length)
  const name = `${before} ${after}`.replace(/^[\s\-:]+|[\s\-:]+$/g, '').trim()

  const needsReview = digits.length < 10 || digits.length > 12 || name.length === 0

  return {
    name: name || trimmed,
    phone: digits,
    stage: 'LEAD',
    source: 'WhatsApp',
    needsReview,
  }
}

function parseText(text: string): NewLead[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map(parseLine)
}

export function LeadImporter({ onImport, onClose }: LeadImporterProps) {
  const [text, setText] = useState('')
  const [leads, setLeads] = useState<NewLead[]>([])

  const reviewCount = useMemo(() => leads.filter((l) => l.needsReview).length, [leads])

  function handleTextChange(value: string) {
    setText(value)
    setLeads(parseText(value))
  }

  function updateLead(index: number, patch: Partial<NewLead>) {
    setLeads((prev) =>
      prev.map((lead, i) => {
        if (i !== index) return lead
        const updated = { ...lead, ...patch }
        const stillNeedsReview = updated.name.trim().length === 0 || updated.phone.replace(/\D/g, '').length < 10
        return { ...updated, needsReview: stillNeedsReview }
      })
    )
  }

  function handleImport() {
    if (leads.length === 0) return
    onImport(leads)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-brand-light rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-brand-light">
          <h2 className="text-brand-text font-semibold">Importar leads desde WhatsApp</h2>
          <button onClick={onClose} className="text-brand-muted hover:text-brand-text">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="text-brand-muted text-xs">
              Pegá el mensaje con los leads (un lead por línea)
            </label>
            <textarea
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={'Juan Pérez - 3001234567\nMaría Gómez: 3009876543\n3012223344 - Carlos Ruiz'}
              rows={5}
              className="w-full mt-1 bg-brand-light border border-brand-light rounded-lg px-3 py-2 text-brand-text text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-accent"
            />
          </div>

          {leads.length > 0 && (
            <>
              <p className="text-brand-text text-sm font-medium">
                {leads.length} leads detectados
                {reviewCount > 0 && (
                  <span className="text-yellow-700"> · {reviewCount} necesitan revisión</span>
                )}
              </p>

              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="min-w-[640px] px-4 sm:px-0">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="text-left text-brand-muted text-xs uppercase tracking-wide">
                        <th className="pb-2 pr-2">Nombre</th>
                        <th className="pb-2 pr-2">Teléfono</th>
                        <th className="pb-2 pr-2">Servicio</th>
                        <th className="pb-2">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead, index) => (
                        <tr
                          key={index}
                          className={
                            lead.needsReview
                              ? 'bg-yellow-50 border-b border-yellow-200'
                              : 'border-b border-brand-light'
                          }
                        >
                          <td className="py-1.5 pr-2">
                            <input
                              value={lead.name}
                              onChange={(e) => updateLead(index, { name: e.target.value })}
                              className="w-full bg-white border border-brand-light rounded px-2 py-1 text-brand-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                            />
                          </td>
                          <td className="py-1.5 pr-2">
                            <input
                              value={lead.phone}
                              onChange={(e) => updateLead(index, { phone: e.target.value })}
                              className="w-full bg-white border border-brand-light rounded px-2 py-1 text-brand-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                            />
                          </td>
                          <td className="py-1.5 pr-2">
                            <select
                              value={lead.service ?? ''}
                              onChange={(e) =>
                                updateLead(index, {
                                  service: (e.target.value || undefined) as ServiceType | undefined,
                                })
                              }
                              className="w-full bg-white border border-brand-light rounded px-2 py-1 text-brand-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                            >
                              <option value="">Sin definir</option>
                              {SERVICE_TYPES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-1.5">
                            {lead.needsReview ? (
                              <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded">
                                Revisar
                              </span>
                            ) : (
                              <span className="inline-block bg-brand-light text-brand-primary text-xs font-medium px-2 py-1 rounded">
                                Listo
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="text-brand-muted hover:text-brand-text text-sm px-4 py-2"
            >
              Cancelar
            </button>
            <button
              onClick={handleImport}
              disabled={leads.length === 0}
              className="flex items-center gap-2 bg-brand-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload size={16} /> Importar {leads.length} leads
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
