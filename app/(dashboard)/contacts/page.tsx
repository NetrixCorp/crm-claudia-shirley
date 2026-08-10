'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Pencil, Upload } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { ContactForm } from '@/components/crm/ContactForm'
import { LeadImporter } from '@/components/leads/LeadImporter'
import { formatRelativeDate, getInitials, buildWhatsAppLink } from '@/lib/utils'
import type { NewLead } from '@/types/leads'

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [importerOpen, setImporterOpen] = useState(false)

  async function loadContacts() {
    setLoading(true)
    const res = await fetch('/api/contacts')
    setContacts(await res.json())
    setLoading(false)
  }

  useEffect(() => { loadContacts() }, [])

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este contacto? Esto también elimina sus deals asociados.')) return
    await fetch(`/api/contacts/${id}`, { method: 'DELETE' })
    loadContacts()
  }

  async function handleImportLeads(leads: NewLead[]) {
    for (const lead of leads) {
      await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: lead.name, phone: lead.phone, source: lead.source }),
      })
    }
    setImporterOpen(false)
    loadContacts()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Contactos</h1>
          <p className="text-slate-500 text-sm">{contacts.length} contactos registrados</p>
          <p className="text-slate-500 text-xs mt-1 max-w-lg">
            Registrá aquí a cada persona que contacte a Claudia Shirley. Un contacto puede tener
            varios deals asociados. Usá el ícono de WhatsApp para escribirle directamente
            con un mensaje prellenado.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setImporterOpen(true)}
            className="flex items-center gap-2 border border-slate-800 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Upload size={16} /> Importar leads
          </button>
          <button
            onClick={() => { setEditing(null); setFormOpen(true) }}
            className="flex items-center gap-2 bg-brand-accent text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus size={16} /> Nuevo contacto
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500 text-sm">Cargando...</p>
      ) : contacts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-white font-medium mb-2">No hay contactos todavía</p>
          <p className="text-slate-500 text-sm mb-4 max-w-sm mx-auto">
            Cada vez que llegue un lead nuevo por WhatsApp, Instagram o referido,
            registralo aquí. El sistema te manda un email automático cuando creás uno.
          </p>
          <button
            onClick={() => { setEditing(null); setFormOpen(true) }}
            className="bg-brand-accent text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            Crear primer contacto
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800 text-white font-semibold text-left">
                <th className="p-3">Contacto</th>
                <th className="p-3">Empresa</th>
                <th className="p-3">Fuente</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Deals</th>
                <th className="p-3">Creado</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-slate-800 text-white hover:bg-slate-800 transition-colors"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-accent/20 text-brand-accent flex items-center justify-center text-xs font-semibold">
                        {getInitials(c.name)}
                      </div>
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-slate-500 text-xs">{c.email || c.phone || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-slate-500">{c.company || '—'}</td>
                  <td className="p-3 text-slate-500">{c.source}</td>
                  <td className="p-3">
                    <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300">
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500">{c._count.deals}</td>
                  <td className="p-3 text-slate-500">{formatRelativeDate(c.createdAt)}</td>
                  <td className="p-3">
                    <div className="flex gap-2 justify-end items-center">
                      {c.phone && (
                        <a
                          href={buildWhatsAppLink(c.phone, `Hola ${c.name}, te escribo desde Claudia Shirley.`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-500 hover:text-green-500"
                          title="Escribir por WhatsApp"
                        >
                          <FaWhatsapp size={16} />
                        </a>
                      )}
                      <button onClick={() => { setEditing(c); setFormOpen(true) }} className="text-slate-500 hover:text-white">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="text-slate-500 hover:text-brand-accent">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && (
        <ContactForm
          contact={editing}
          onClose={() => setFormOpen(false)}
          onSaved={() => { setFormOpen(false); loadContacts() }}
        />
      )}

      {importerOpen && (
        <LeadImporter
          onImport={handleImportLeads}
          onClose={() => setImporterOpen(false)}
        />
      )}
    </div>
  )
}
