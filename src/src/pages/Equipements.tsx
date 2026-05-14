// ============================================
// FICHIER : src/pages/Equipements.tsx
// RÔLE : Gestion complète des équipements
// CORRECTION : Utilisateur assigné devient une
// liste déroulante des vrais employés
// ============================================

import { useState, useEffect } from 'react'
import type { Equipement, Utilisateur } from '../types'
import {
  getEquipements,
  ajouterEquipement,
  modifierEquipement,
  supprimerEquipement,
  getUtilisateurs,
} from '../data/storage'

const formVide = {
  nom: '', type: 'Ordinateur' as Equipement['type'],
  statut: 'Actif' as Equipement['statut'],
  departement: '', utilisateur: '', dateAchat: '',
  garantieJusquau: '', marque: '', modele: '', description: '',
}

function BadgeStatut({ statut }: { statut: Equipement['statut'] }) {
  const styles = {
    'Actif':          'bg-emerald-100 text-emerald-700 border border-emerald-200',
    'En panne':       'bg-red-100 text-red-700 border border-red-200',
    'En maintenance': 'bg-amber-100 text-amber-700 border border-amber-200',
    'Retiré':         'bg-slate-100 text-slate-600 border border-slate-200',
  }
  const points = {
    'Actif':          'bg-emerald-500',
    'En panne':       'bg-red-500 animate-pulse',
    'En maintenance': 'bg-amber-500',
    'Retiré':         'bg-slate-400',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles[statut]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${points[statut]}`} />
      {statut}
    </span>
  )
}

function BadgeType({ type }: { type: Equipement['type'] }) {
  const styles: Record<string, string> = {
    'Ordinateur': 'bg-blue-50 text-blue-700',
    'Imprimante': 'bg-purple-50 text-purple-700',
    'Serveur':    'bg-indigo-50 text-indigo-700',
    'Téléphone':  'bg-teal-50 text-teal-700',
    'Autre':      'bg-slate-50 text-slate-600',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[type] || styles['Autre']}`}>
      {type}
    </span>
  )
}

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
// Modal formulaire — utilisateur = liste déroulante
// ============================================
function ModalFormulaire({
  equipement, onSave, onClose, utilisateurs,
}: {
  equipement: Omit<Equipement, 'id'> & { id?: string }
  onSave: (data: Omit<Equipement, 'id'>) => void
  onClose: () => void
  utilisateurs: Utilisateur[]
}) {
  const [form, setForm] = useState(equipement)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto animate-fade-in">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-scale-in">

          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                {equipement.id ? "Modifier l'équipement" : "Ajouter un équipement"}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {equipement.id ? 'Modifiez les informations ci-dessous' : 'Remplissez les informations du nouvel équipement'}
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nom de l'équipement <span className="text-red-500">*</span>
                </label>
                <input name="nom" value={form.nom} onChange={handleChange} required
                  placeholder="Ex: PC-2026-001" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Type <span className="text-red-500">*</span>
                </label>
                <select name="type" value={form.type} onChange={handleChange} className="input-field">
                  <option>Ordinateur</option>
                  <option>Imprimante</option>
                  <option>Serveur</option>
                  <option>Téléphone</option>
                  <option>Autre</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Marque</label>
                <input name="marque" value={form.marque} onChange={handleChange}
                  placeholder="Ex: Dell, HP, Lenovo" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Modèle</label>
                <input name="modele" value={form.modele} onChange={handleChange}
                  placeholder="Ex: Latitude 5520" className="input-field" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Statut <span className="text-red-500">*</span>
                </label>
                <select name="statut" value={form.statut} onChange={handleChange} className="input-field">
                  <option>Actif</option>
                  <option>En panne</option>
                  <option>En maintenance</option>
                  <option>Retiré</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Département</label>
                <input name="departement" value={form.departement} onChange={handleChange}
                  placeholder="Ex: Comptabilité" className="input-field" />
              </div>
            </div>

            {/* Utilisateur assigné — liste déroulante des vrais employés */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Utilisateur assigné
              </label>
              <select name="utilisateur" value={form.utilisateur} onChange={handleChange} className="input-field">
                <option value="">— Aucun utilisateur —</option>
                {utilisateurs.map(u => (
                  <option key={u.id} value={`${u.prenom} ${u.nom}`}>
                    {u.prenom} {u.nom} — {u.departement} ({u.poste})
                  </option>
                ))}
              </select>
              {utilisateurs.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  ⚠️ Aucun employé enregistré. Ajoutez d'abord des employés dans la page Utilisateurs.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Date d'achat</label>
                <input type="date" name="dateAchat" value={form.dateAchat} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Garantie jusqu'au</label>
                <input type="date" name="garantieJusquau" value={form.garantieJusquau} onChange={handleChange} className="input-field" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Description / Notes</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                placeholder="Observations, remarques sur cet équipement..."
                rows={3} className="input-field resize-none" />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
              <button type="submit" className="btn-primary">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {equipement.id ? 'Enregistrer les modifications' : "Ajouter l'équipement"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}

function ModalConfirmation({ nom, onConfirm, onClose }: {
  nom: string
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
          Vous êtes sur le point de supprimer l'équipement{' '}
          <span className="font-semibold text-slate-800">{nom}</span>.
          Cette action ne peut pas être annulée.
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

export default function Equipements() {
  const [equipements, setEquipements] = useState<Equipement[]>([])
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([])
  const [recherche, setRecherche] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('Tous')
  const [filtreType, setFiltreType] = useState('Tous')
  const [modalForm, setModalForm] = useState(false)
  const [modalSupprimer, setModalSupprimer] = useState<string | null>(null)
  const [equipementEnCours, setEquipementEnCours] = useState<(Omit<Equipement, 'id'> & { id?: string }) | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    setEquipements(getEquipements())
    setUtilisateurs(getUtilisateurs())
  }, [])

  const equipementsFiltres = equipements.filter(e => {
    const matchRecherche =
      e.nom.toLowerCase().includes(recherche.toLowerCase()) ||
      e.marque.toLowerCase().includes(recherche.toLowerCase()) ||
      e.departement.toLowerCase().includes(recherche.toLowerCase()) ||
      e.utilisateur.toLowerCase().includes(recherche.toLowerCase())
    const matchStatut = filtreStatut === 'Tous' || e.statut === filtreStatut
    const matchType = filtreType === 'Tous' || e.type === filtreType
    return matchRecherche && matchStatut && matchType
  })

  const ouvrirAjout = () => {
    setEquipementEnCours(formVide)
    setModalForm(true)
  }

  const ouvrirModification = (eq: Equipement) => {
    setEquipementEnCours(eq)
    setModalForm(true)
  }

  const sauvegarder = (data: Omit<Equipement, 'id'>) => {
    if (equipementEnCours?.id) {
      modifierEquipement(equipementEnCours.id, data)
      setToast({ message: 'Équipement modifié avec succès', type: 'success' })
    } else {
      ajouterEquipement(data)
      setToast({ message: 'Équipement ajouté avec succès', type: 'success' })
    }
    setEquipements(getEquipements())
    setModalForm(false)
    setEquipementEnCours(null)
  }

  const confirmerSuppression = () => {
    if (modalSupprimer) {
      supprimerEquipement(modalSupprimer)
      setEquipements(getEquipements())
      setToast({ message: 'Équipement supprimé', type: 'success' })
      setModalSupprimer(null)
    }
  }

  const nomASupprimer = equipements.find(e => e.id === modalSupprimer)?.nom || ''

  return (
    <div className="p-4 sm:p-6 lg:p-8 fade-in">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Équipements</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {equipements.length} équipement{equipements.length > 1 ? 's' : ''} enregistré{equipements.length > 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={ouvrirAjout} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Ajouter un équipement
        </button>
      </div>

      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher par nom, marque, département..."
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
            <option>Actif</option>
            <option>En panne</option>
            <option>En maintenance</option>
            <option>Retiré</option>
          </select>
          <select value={filtreType} onChange={e => setFiltreType(e.target.value)} className="input-field sm:w-44">
            <option value="Tous">Tous les types</option>
            <option>Ordinateur</option>
            <option>Imprimante</option>
            <option>Serveur</option>
            <option>Téléphone</option>
            <option>Autre</option>
          </select>
        </div>

        {(recherche || filtreStatut !== 'Tous' || filtreType !== 'Tous') && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              <span className="font-medium text-slate-700">{equipementsFiltres.length}</span> résultat{equipementsFiltres.length > 1 ? 's' : ''} trouvé{equipementsFiltres.length > 1 ? 's' : ''}
            </p>
            <button onClick={() => { setRecherche(''); setFiltreStatut('Tous'); setFiltreType('Tous') }}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      <div className="card overflow-hidden">
        {equipementsFiltres.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium">Aucun équipement trouvé</p>
            <p className="text-slate-400 text-sm mt-1">Modifiez vos filtres ou ajoutez un équipement</p>
          </div>
        ) : (
          <>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Équipement</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Département</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Utilisateur</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Garantie</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {equipementsFiltres.map((eq) => (
                    <tr key={eq.id} className="hover:bg-slate-50 transition-colors duration-100">
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-800 text-sm">{eq.nom}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{eq.marque} {eq.modele}</div>
                      </td>
                      <td className="px-4 py-3.5"><BadgeType type={eq.type} /></td>
                      <td className="px-4 py-3.5"><BadgeStatut statut={eq.statut} /></td>
                      <td className="px-4 py-3.5 text-sm text-slate-600">{eq.departement || '—'}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-600">{eq.utilisateur || '—'}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-600">
                        {eq.garantieJusquau ? (
                          new Date(eq.garantieJusquau) < new Date()
                            ? <span className="text-red-500 font-medium">Expirée</span>
                            : new Date(eq.garantieJusquau) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                              ? <span className="text-amber-500 font-medium">Bientôt</span>
                              : new Date(eq.garantieJusquau).toLocaleDateString('fr-FR')
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => ouvrirModification(eq)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Modifier">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                            </svg>
                          </button>
                          <button onClick={() => setModalSupprimer(eq.id)}
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

            <div className="sm:hidden divide-y divide-slate-100">
              {equipementsFiltres.map(eq => (
                <div key={eq.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{eq.nom}</p>
                      <p className="text-xs text-slate-400">{eq.marque} {eq.modele}</p>
                    </div>
                    <BadgeStatut statut={eq.statut} />
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <BadgeType type={eq.type} />
                    {eq.departement && <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{eq.departement}</span>}
                  </div>
                  {eq.utilisateur && <p className="text-xs text-slate-500 mb-3">👤 {eq.utilisateur}</p>}
                  <div className="flex gap-2">
                    <button onClick={() => ouvrirModification(eq)} className="btn-secondary text-xs py-1.5 flex-1">Modifier</button>
                    <button onClick={() => setModalSupprimer(eq.id)} className="btn-danger text-xs py-1.5 flex-1">Supprimer</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {equipementsFiltres.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-500">
              Affichage de <span className="font-medium">{equipementsFiltres.length}</span> équipement{equipementsFiltres.length > 1 ? 's' : ''}
              {equipements.length !== equipementsFiltres.length && ` sur ${equipements.length}`}
            </p>
          </div>
        )}
      </div>

      {modalForm && equipementEnCours && (
        <ModalFormulaire
          equipement={equipementEnCours}
          onSave={sauvegarder}
          onClose={() => { setModalForm(false); setEquipementEnCours(null) }}
          utilisateurs={utilisateurs}
        />
      )}

      {modalSupprimer && (
        <ModalConfirmation
          nom={nomASupprimer}
          onConfirm={confirmerSuppression}
          onClose={() => setModalSupprimer(null)}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

    </div>
  )
}
