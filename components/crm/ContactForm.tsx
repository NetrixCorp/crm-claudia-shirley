'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { CONTACT_SOURCES } from '@/lib/constants'
import { trackEvent } from '@/lib/analytics'

interface ContactFormProps {
  contact: any | null
  onClose: () => void
  onSaved: () => void
}

export function ContactForm({ contact, onClose, onSaved }: ContactFormProps) {
  const [form, setForm] = useState({
    name: contact?.name || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    company: contact?.company || '',
    source: contact?.source || 'WhatsApp',
    status: contact?.status || 'Activo',
  })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const url = contact ? `/api/contacts/${contact.id}` : '/api/contacts'
    const method = contact ? 'PATCH' : 'POST'

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    trackEvent(contact ? 'edit_contact' : 'create_contact', { source: form.source })
    setSaving(false)
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-brand-black-soft border border-brand-gray-dark rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-brand-gray-dark">
          <h2 className="text-white font-semibold">
            {contact ? 'Editar contacto' : 'Nuevo contacto'}
          </h2>
          <button onClick={onClose} className="text-brand-gray-mid hover:text-white">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {!contact && (
            <p className="text-brand-gray-mid text-xs mb-3 leading-relaxed">
              Completá los datos del lead. El teléfono es importante para el botón
              de WhatsApp directo. La fuente ayuda a entender de dónde vienen los clientes.
            </p>
          )}
          <input
            required
            placeholder="Nombre completo"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-brand-black border border-brand-gray-dark rounded-lg px-3 py-2 text-white text-sm"
          />
          <input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-brand-black border border-brand-gray-dark rounded-lg px-3 py-2 text-white text-sm"
          />
          <input
            placeholder="Teléfono / WhatsApp"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full bg-brand-black border border-brand-gray-dark rounded-lg px-3 py-2 text-white text-sm"
          />
          <input
            placeholder="Empresa"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            className="w-full bg-brand-black border border-brand-gray-dark rounded-lg px-3 py-2 text-white text-sm"
          />
          <select
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
            className="w-full bg-brand-black border border-brand-gray-dark rounded-lg px-3 py-2 text-white text-sm"
          >
            {CONTACT_SOURCES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-brand-red text-white font-semibold py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? 'Guardando...' : contact ? 'Guardar cambios' : 'Crear contacto'}
          </button>
        </form>
      </div>
    </div>
  )
}
