// ============================================
// FICHIER : src/pages/Incidents.tsx
// RÔLE : Gestion des incidents et pannes
// FONCTIONNALITÉS :
//   - Déclarer un incident sur un équipement
//   - Suivre le statut (Ouvert, En cours, Résolu)
//   - Définir une priorité (Faible, Moyenne, Urgente)
//   - Historique complet des incidents
//   - Responsive mobile/desktop
// ============================================

import { useState, useEffect } from 'react'
import type { Incident, Equipement } from '../types'
import {
  getIncidents,
  ajouterIncident,
  modifierIncident,
  supprimerIncident,
  getEquipements,
} from '../data/storage'

// Formulaire vide par défaut
const formVide = {
  equipementId: '',
  equipementNom: '',
  titre: '',
  description: '',
  statut: 'Ouvert' as Incident['statut'],
  priorite: 'Moyenne' as Incident['priorite'],
  dateCreation: new Date().toISOString().split('T')[0],
  dateResolution: '',
}

// ============================================
// Badge statut incident
// ============================================
function BadgeStatut({ statut }: { statut: Incident['statut'] }) {
  const styles = {
    'Ouvert':    'bg-red-100 text-red-700 border border-red-200',
    'En cours':  'bg-amber-100 text-amber-700 border border-amber-200',
    'Résolu':    'bg-emerald-100 text-emerald-700 border border-emerald-200',
  }
  const points = {
    'Ouvert':   'bg-red-500 animate-pulse',
    'En cours': 'bg-amber-500',
    'Résolu':   'bg-emerald-500',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles[statut]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${points[statut]}`} />
      {statut}
    </span>
  )
}

// ============================================
// Badge priorité
// ============================================
function BadgePriorite({ priorite }: { priorite: Incident['priorite'] }) {
  const styles = {
    'Faible':  'bg-slate-100 text-slate-600',
    'Moyenne': 'bg-blue-100 text-blue-700',
    'Urgente': 'bg-red-100 text-red-700 font-semibold',
  }
  const icones = {
    'Faible':  '↓',
    'Moyenne': '→',
    'Urgente': '↑',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs ${styles[priorite]}`}>
      {icones[priorite]} {priorite}
    </span>
  )
}

// ============================================
// Toast notification
// ============================================
function Toast({ message, type, onClose }: {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl
                    shadow-lg border animate-slide-in max-w-sm
                    ${type === 'success' ? 'bg-white border-emerald-200' : 'bg-white border-red-200'}`}>
      {type === 'success' ? (
        <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      )}
      <p className="text-sm font-medium text-slate-700">{message}</p>
      <button onClick={onClose} className="ml-auto text-slate-400 hover:text-slate-600">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

// ============================================
// Modal formulaire incident
// ============================================
function ModalFormulaire({
  incident, onSave, onClose, equipements,
}: {
  incident: Omit<Incident, 'id'> & { id?: string }
  onSave: (data: Omit<Incident, 'id'>) => void
  onClose: () => void
  equipements: Equipement[]
}) {
  const [form, setForm] = useState(incident)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // Quand on sélectionne un équipement, on remplit aussi son nom
  const handleEquipementChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const eq = equipements.find(eq => eq.id === e.target.value)
    setForm(prev => ({
      ...prev,
      equipementId: e.target.value,
      equipementNom: eq ? eq.nom : '',
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto animate-fade-in">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl animate-scale-in">

          {/* En-tête */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                {incident.id ? "Modifier l'incident" : "Déclarer un incident"}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {incident.id ? 'Modifiez les informations ci-dessous' : 'Signalez un problème sur un équipement'}
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

            {/* Équipement concerné */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Équipement concerné <span className="text-red-500">*</span>
              </label>
              <select
                value={form.equipementId}
                onChange={handleEquipementChange}
                required
                className="input-field"
              >
                <option value="">— Sélectionner un équipement —</option>
                {equipements.map(eq => (
                  <option key={eq.id} value={eq.id}>
                    {eq.nom} — {eq.type} ({eq.departement})
                  </option>
                ))}
              </select>
            </div>

            {/* Titre de l'incident */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Titre de l'incident <span className="text-red-500">*</span>
              </label>
              <input
                name="titre" value={form.titre} onChange={handleChange} required
                placeholder="Ex: Écran noir au démarrage"
                className="input-field"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Description du problème
              </label>
              <textarea
                name="description" value={form.description} onChange={handleChange}
                placeholder="Décrivez le problème en détail..."
                rows={3} className="input-field resize-none"
              />
            </div>

            {/* Priorité + Statut */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Priorité <span className="text-red-500">*</span>
                </label>
                <select name="priorite" value={form.priorite} onChange={handleChange} className="input-field">
                  <option>Faible</option>
                  <option>Moyenne</option>
                  <option>Urgente</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Statut <span className="text-red-500">*</span>
                </label>
                <select name="statut" value={form.statut} onChange={handleChange} className="input-field">
                  <option>Ouvert</option>
                  <option>En cours</option>
                  <option>Résolu</option>
                </select>
              </div>
            </div>

            {/* Date de création */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Date de déclaration
              </label>
              <input
                type="date" name="dateCreation" value={form.dateCreation}
                onChange={handleChange} className="input-field"
              />
            </div>

            {/* Date de résolution — visible seulement si statut = Résolu */}
            {form.statut === 'Résolu' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Date de résolution
                </label>
                <input
                  type="date" name="dateResolution" value={form.dateResolution || ''}
                  onChange={handleChange} className="input-field"
                />
              </div>
            )}

            {/* Boutons */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
              <button type="submit" className="btn-primary">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {incident.id ? 'Enregistrer les modifications' : "Déclarer l'incident"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Modal confirmation suppression
// ============================================
function ModalConfirmation({ titre, onConfirm, onClose }: {
  titre: string
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Confirmer la suppression</h3>
            <p className="text-sm text-slate-500 mt-0.5">Cette action est irréversible</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 bg-slate-50 rounded-lg px-4 py-3 mb-6">
          Vous êtes sur le point de supprimer l'incident{' '}
          <span className="font-semibold text-slate-800">"{titre}"</span>.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary">Annuler</button>
          <button onClick={onConfirm} className="btn-danger">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// PAGE PRINCIPALE
// ============================================
export default function Incidents() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [equipements, setEquipements] = useState<Equipement[]>([])
  const [recherche, setRecherche] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('Tous')
  const [filtrePriorite, setFiltrePriorite] = useState('Tous')
  const [modalForm, setModalForm] = useState(false)
  const [modalSupprimer, setModalSupprimer] = useState<string | null>(null)
  const [incidentEnCours, setIncidentEnCours] = useState<(Omit<Incident, 'id'> & { id?: string }) | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    setIncidents(getIncidents())
    setEquipements(getEquipements())
  }, [])

  // Filtrage
  const incidentsFiltres = incidents.filter(i => {
    const matchRecherche =
      i.titre.toLowerCase().includes(recherche.toLowerCase()) ||
      i.equipementNom.toLowerCase().includes(recherche.toLowerCase()) ||
      i.description.toLowerCase().includes(recherche.toLowerCase())
    const matchStatut = filtreStatut === 'Tous' || i.statut === filtreStatut
    const matchPriorite = filtrePriorite === 'Tous' || i.priorite === filtrePriorite
    return matchRecherche && matchStatut && matchPriorite
  })

  // Statistiques rapides
  const stats = {
    total: incidents.length,
    ouverts: incidents.filter(i => i.statut === 'Ouvert').length,
    enCours: incidents.filter(i => i.statut === 'En cours').length,
    resolus: incidents.filter(i => i.statut === 'Résolu').length,
    urgents: incidents.filter(i => i.priorite === 'Urgente' && i.statut !== 'Résolu').length,
  }

  const ouvrirAjout = () => {
    setIncidentEnCours(formVide)
    setModalForm(true)
  }

  const ouvrirModification = (incident: Incident) => {
    setIncidentEnCours(incident)
    setModalForm(true)
  }

  // Changer rapidement le statut depuis le tableau
  const changerStatut = (id: string, statut: Incident['statut']) => {
    const updates: Partial<Incident> = { statut }
    if (statut === 'Résolu') {
      updates.dateResolution = new Date().toISOString().split('T')[0]
    }
    modifierIncident(id, updates)
    setIncidents(getIncidents())
    setToast({ message: `Incident marqué comme "${statut}"`, type: 'success' })
  }

  const sauvegarder = (data: Omit<Incident, 'id'>) => {
    if (incidentEnCours?.id) {
      modifierIncident(incidentEnCours.id, data)
      setToast({ message: 'Incident modifié avec succès', type: 'success' })
    } else {
      ajouterIncident(data)
      setToast({ message: 'Incident déclaré avec succès', type: 'success' })
    }
    setIncidents(getIncidents())
    setModalForm(false)
    setIncidentEnCours(null)
  }

  const confirmerSuppression = () => {
    if (modalSupprimer) {
      supprimerIncident(modalSupprimer)
      setIncidents(getIncidents())
      setToast({ message: 'Incident supprimé', type: 'success' })
      setModalSupprimer(null)
    }
  }

  const titreASupprimer = incidents.find(i => i.id === modalSupprimer)?.titre || ''

  return (
    <div className="p-4 sm:p-6 lg:p-8 fade-in">

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Incidents</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Suivi des pannes et problèmes techniques
          </p>
        </div>
        <button onClick={ouvrirAjout} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Déclarer un incident
        </button>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="card p-4">
          <p className="text-xs text-slate-500 mb-1">Total incidents</p>
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
        </div>
        <div className="card p-4 border-red-100">
          <p className="text-xs text-slate-500 mb-1">Ouverts</p>
          <p className="text-2xl font-bold text-red-600">{stats.ouverts}</p>
        </div>
        <div className="card p-4 border-amber-100">
          <p className="text-xs text-slate-500 mb-1">En cours</p>
          <p className="text-2xl font-bold text-amber-600">{stats.enCours}</p>
        </div>
        <div className="card p-4 border-emerald-100">
          <p className="text-xs text-slate-500 mb-1">Résolus</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.resolus}</p>
        </div>
      </div>

      {/* Alerte urgence */}
      {stats.urgents > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-sm text-red-700 font-medium">
            {stats.urgents} incident{stats.urgents > 1 ? 's' : ''} urgent{stats.urgents > 1 ? 's' : ''} nécessite{stats.urgents > 1 ? 'nt' : ''} une attention immédiate
          </p>
        </div>
      )}

      {/* Recherche et filtres */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher par titre, équipement..."
              value={recherche}
              onChange={e => setRecherche(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
              className="w-full py-2 pl-10 pr-3 rounded-lg border border-slate-200 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         bg-white text-slate-800 placeholder-slate-400"
            />
          </div>
          <select value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)} className="input-field sm:w-44">
            <option value="Tous">Tous les statuts</option>
            <option>Ouvert</option>
            <option>En cours</option>
            <option>Résolu</option>
          </select>
          <select value={filtrePriorite} onChange={e => setFiltrePriorite(e.target.value)} className="input-field sm:w-44">
            <option value="Tous">Toutes priorités</option>
            <option>Urgente</option>
            <option>Moyenne</option>
            <option>Faible</option>
          </select>
        </div>

        {(recherche || filtreStatut !== 'Tous' || filtrePriorite !== 'Tous') && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              <span className="font-medium text-slate-700">{incidentsFiltres.length}</span> résultat{incidentsFiltres.length > 1 ? 's' : ''} trouvé{incidentsFiltres.length > 1 ? 's' : ''}
            </p>
            <button onClick={() => { setRecherche(''); setFiltreStatut('Tous'); setFiltrePriorite('Tous') }}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              Réinitialiser
            </button>
          </div>
        )}
      </div>

      {/* Liste des incidents */}
      <div className="card overflow-hidden">
        {incidentsFiltres.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium">Aucun incident trouvé</p>
            <p className="text-slate-400 text-sm mt-1">
              {incidents.length === 0 ? 'Aucun incident déclaré pour le moment' : 'Modifiez vos filtres'}
            </p>
          </div>
        ) : (
          <>
            {/* Tableau desktop */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Incident</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Équipement</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Priorité</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {incidentsFiltres.map(incident => (
                    <tr key={incident.id} className="hover:bg-slate-50 transition-colors duration-100">
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-slate-800 text-sm">{incident.titre}</p>
                        {incident.description && (
                          <p className="text-xs text-slate-400 mt-0.5 max-w-xs truncate">{incident.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {incident.equipementNom || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5"><BadgePriorite priorite={incident.priorite} /></td>
                      <td className="px-4 py-3.5"><BadgeStatut statut={incident.statut} /></td>
                      <td className="px-4 py-3.5 text-sm text-slate-500">
                        {incident.dateCreation
                          ? new Date(incident.dateCreation).toLocaleDateString('fr-FR')
                          : '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 justify-end">

                          {/* Bouton changement rapide de statut */}
                          {incident.statut !== 'Résolu' && (
                            <button
                              onClick={() => changerStatut(incident.id, incident.statut === 'Ouvert' ? 'En cours' : 'Résolu')}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title={incident.statut === 'Ouvert' ? 'Passer En cours' : 'Marquer Résolu'}
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            </button>
                          )}

                          <button onClick={() => ouvrirModification(incident)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Modifier">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                            </svg>
                          </button>
                          <button onClick={() => setModalSupprimer(incident.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cartes mobile */}
            <div className="sm:hidden divide-y divide-slate-100">
              {incidentsFiltres.map(incident => (
                <div key={incident.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold text-slate-800 text-sm flex-1 mr-2">{incident.titre}</p>
                    <BadgeStatut statut={incident.statut} />
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <BadgePriorite priorite={incident.priorite} />
                    {incident.equipementNom && (
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {incident.equipementNom}
                      </span>
                    )}
                  </div>
                  {incident.description && (
                    <p className="text-xs text-slate-400 mb-3 line-clamp-2">{incident.description}</p>
                  )}
                  <div className="flex gap-2">
                    {incident.statut !== 'Résolu' && (
                      <button
                        onClick={() => changerStatut(incident.id, incident.statut === 'Ouvert' ? 'En cours' : 'Résolu')}
                        className="btn-secondary text-xs py-1.5 flex-1"
                      >
                        {incident.statut === 'Ouvert' ? 'Prendre en charge' : 'Marquer résolu'}
                      </button>
                    )}
                    <button onClick={() => ouvrirModification(incident)} className="btn-secondary text-xs py-1.5 flex-1">Modifier</button>
                    <button onClick={() => setModalSupprimer(incident.id)} className="btn-danger text-xs py-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {incidentsFiltres.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-500">
              Affichage de <span className="font-medium">{incidentsFiltres.length}</span> incident{incidentsFiltres.length > 1 ? 's' : ''}
              {incidents.length !== incidentsFiltres.length && ` sur ${incidents.length}`}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {modalForm && incidentEnCours && (
        <ModalFormulaire
          incident={incidentEnCours}
          onSave={sauvegarder}
          onClose={() => { setModalForm(false); setIncidentEnCours(null) }}
          equipements={equipements}
        />
      )}

      {modalSupprimer && (
        <ModalConfirmation
          titre={titreASupprimer}
          onConfirm={confirmerSuppression}
          onClose={() => setModalSupprimer(null)}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

    </div>
  )
}
