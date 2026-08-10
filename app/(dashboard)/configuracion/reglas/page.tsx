'use client'

import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { RulesList } from '@/components/suggestions/RulesList'
import { RuleEditor } from '@/components/suggestions/RuleEditor'
import type { SuggestionRuleData } from '@/types/suggestion-rule'

export default function ReglasPage() {
  const [rules, setRules] = useState<SuggestionRuleData[]>([])
  const [loading, setLoading] = useState(true)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<SuggestionRuleData | null>(null)
  const [toast, setToast] = useState('')

  async function loadRules() {
    setLoading(true)
    const res = await fetch('/api/suggestions/rules')
    const data: SuggestionRuleData[] = await res.json()
    setRules(data)
    setLoading(false)
  }

  useEffect(() => {
    loadRules()
  }, [])

  function showToast(message: string) {
    setToast(message)
    setTimeout(() => setToast(''), 3000)
  }

  function handleSaved() {
    const wasEditing = editing !== null
    setEditorOpen(false)
    loadRules()
    showToast(wasEditing ? 'Regla actualizada' : 'Regla creada')
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Configuración de sugerencias</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl mt-1">
            Personalizá las reglas que determinan qué acciones se sugieren. Por ejemplo,
            cuando un lead lleva varios días sin que lo llames. Se revisan en orden de
            arriba hacia abajo: apenas una regla aplica para un cliente, esa es la que se sugiere.
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setEditorOpen(true) }}
          className="flex items-center gap-2 bg-brand-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand-accent transition-colors flex-shrink-0"
        >
          <Plus size={16} /> Crear nueva regla
        </button>
      </div>

      {loading ? (
        <p className="text-slate-500 text-sm">Cargando...</p>
      ) : (
        <RulesList
          rules={rules}
          onEdit={(rule) => { setEditing(rule); setEditorOpen(true) }}
          onRefresh={loadRules}
        />
      )}

      {editorOpen && (
        <RuleEditor
          rule={editing}
          onClose={() => setEditorOpen(false)}
          onSaved={handleSaved}
        />
      )}

      {toast && (
        <div className="fixed bottom-4 right-4 bg-brand-primary text-white text-sm font-medium px-4 py-3 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
