// ============================================
// FICHIER : src/pages/Utilisateurs.tsx
// RÔLE : Gestion des employés de la structure
// FONCTIONNALITÉS :
//   - Liste des employés
//   - Recherche en temps réel
//   - Ajouter / Modifier / Supprimer
//   - Voir les équipements assignés
//   - Responsive mobile/desktop
// ============================================

import { useState, useEffect } from 'react'
import type { Utilisateur, Equipement } from '../types'
import {
  getUtilisateurs,
  ajouterUtilisateur,
  modifierUtilisateur,
  supprimerUtilisateur,
  getEquipements,
} from '../data/storage'

// Formulaire vide par défaut
const formVide = {
  nom: '', prenom: '', email: '',
  departement: '', poste: '',
}

// ============================================
// Initiales de l'employé pour l'avatar
// ============================================
function Avatar({ prenom, nom }: { prenom: string; nom: string }) {
  const initiales = `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase()
  const couleurs = [
    'bg-blue-100 text-blue-700',
    'bg-purple-100 text-purple-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-indigo-100 text-indigo-700',
  ]
  // Choisit une couleur basée sur la première lettre du nom
  const couleur = couleurs[nom.charCodeAt(0) % couleurs.length]
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${couleur}`}>
      {initiales}
    </div>
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
// Modal formulaire ajout/modification
// ============================================
function ModalFormulaire({
  utilisateur, onSave, onClose,
}: {
  utilisateur: Omit<Utilisateur, 'id'> & { id?: string }
  onSave: (data: Omit<Utilisateur, 'id'>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState(utilisateur)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto animate-fade-in">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in">

          {/* En-tête */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                {utilisateur.id ? "Modifier l'employé" : "Ajouter un employé"}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {utilisateur.id ? 'Modifiez les informations ci-dessous' : 'Remplissez les informations du nouvel employé'}
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

            {/* Prénom + Nom */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input name="prenom" value={form.prenom} onChange={handleChange} required
                  placeholder="Ex: Koffi" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input name="nom" value={form.nom} onChange={handleChange} required
                  placeholder="Ex: MENSAH" className="input-field" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Adresse email <span className="text-red-500">*</span>
              </label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required
                placeholder="Ex: k.mensah@structure.bj" className="input-field" />
            </div>

            {/* Département + Poste */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Département</label>
                <select name="departement" value={form.departement} onChange={handleChange} className="input-field">
                  <option value="">Sélectionner...</option>
                  <option>Direction</option>
                  <option>Informatique</option>
                  <option>Comptabilité</option>
                  <option>Ressources Humaines</option>
                  <option>Commercial</option>
                  <option>Logistique</option>
                  <option>Juridique</option>
                  <option>Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Poste occupé</label>
                <input name="poste" value={form.poste} onChange={handleChange}
                  placeholder="Ex: Comptable senior" className="input-field" />
              </div>
            </div>

            {/* Boutons */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
              <button type="submit" className="btn-primary">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {utilisateur.id ? 'Enregistrer les modifications' : "Ajouter l'employé"}
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
          Vous êtes sur le point de supprimer l'employé{' '}
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

// ============================================
// Modal détail employé — équipements assignés
// ============================================
function ModalDetail({ utilisateur, equipements, onClose }: {
  utilisateur: Utilisateur
  equipements: Equipement[]
  onClose: () => void
}) {
  // Récupère les équipements assignés à cet employé
  const equipementsAssignes = equipements.filter(
    e => e.utilisateur.toLowerCase() === `${utilisateur.prenom} ${utilisateur.nom}`.toLowerCase()
  )

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto animate-fade-in">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in">

          {/* En-tête */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800">Fiche employé</h2>
            <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-6 py-5">

            {/* Infos employé */}
            <div className="flex items-center gap-4 mb-6">
              <Avatar prenom={utilisateur.prenom} nom={utilisateur.nom} />
              <div>
                <p className="font-semibold text-slate-800">
                  {utilisateur.prenom} {utilisateur.nom}
                </p>
                <p className="text-sm text-slate-500">{utilisateur.poste}</p>
                <p className="text-sm text-blue-600">{utilisateur.email}</p>
              </div>
            </div>

            {/* Département */}
            <div className="bg-slate-50 rounded-xl p-4 mb-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Département</p>
              <p className="text-sm font-medium text-slate-700">{utilisateur.departement || 'Non renseigné'}</p>
            </div>

            {/* Équipements assignés */}
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-3">
                Équipements assignés
                <span className="ml-2 text-xs font-normal text-slate-400">
                  ({equipementsAssignes.length})
                </span>
              </p>

              {equipementsAssignes.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4 bg-slate-50 rounded-xl">
                  Aucun équipement assigné à cet employé
                </p>
              ) : (
                <div className="space-y-2">
                  {equipementsAssignes.map(eq => (
                    <div key={eq.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{eq.nom}</p>
                        <p className="text-xs text-slate-400">{eq.type} — {eq.marque} {eq.modele}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium
                        ${eq.statut === 'Actif' ? 'bg-emerald-100 text-emerald-700' :
                          eq.statut === 'En panne' ? 'bg-red-100 text-red-700' :
                          eq.statut === 'En maintenance' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-600'}`}>
                        {eq.statut}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// PAGE PRINCIPALE
// ============================================
export default function Utilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([])
  const [equipements, setEquipements] = useState<Equipement[]>([])
  const [recherche, setRecherche] = useState('')
  const [filtreDept, setFiltreDept] = useState('Tous')
  const [modalForm, setModalForm] = useState(false)
  const [modalSupprimer, setModalSupprimer] = useState<string | null>(null)
  const [modalDetail, setModalDetail] = useState<Utilisateur | null>(null)
  const [utilisateurEnCours, setUtilisateurEnCours] = useState<(Omit<Utilisateur, 'id'> & { id?: string }) | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    setUtilisateurs(getUtilisateurs())
    setEquipements(getEquipements())
  }, [])

  // Départements uniques pour le filtre
  const departements = ['Tous', ...Array.from(new Set(utilisateurs.map(u => u.departement).filter(Boolean)))]

  // Filtrage
  const utilisateursFiltres = utilisateurs.filter(u => {
    const matchRecherche =
      u.nom.toLowerCase().includes(recherche.toLowerCase()) ||
      u.prenom.toLowerCase().includes(recherche.toLowerCase()) ||
      u.email.toLowerCase().includes(recherche.toLowerCase()) ||
      u.poste.toLowerCase().includes(recherche.toLowerCase())
    const matchDept = filtreDept === 'Tous' || u.departement === filtreDept
    return matchRecherche && matchDept
  })

  // Nombre d'équipements par utilisateur
  const nbEquipements = (u: Utilisateur) =>
    equipements.filter(e =>
      e.utilisateur.toLowerCase() === `${u.prenom} ${u.nom}`.toLowerCase()
    ).length

  const ouvrirAjout = () => {
    setUtilisateurEnCours(formVide)
    setModalForm(true)
  }

  const ouvrirModification = (u: Utilisateur) => {
    setUtilisateurEnCours(u)
    setModalForm(true)
  }

  const sauvegarder = (data: Omit<Utilisateur, 'id'>) => {
    if (utilisateurEnCours?.id) {
      modifierUtilisateur(utilisateurEnCours.id, data)
      setToast({ message: 'Employé modifié avec succès', type: 'success' })
    } else {
      ajouterUtilisateur(data)
      setToast({ message: 'Employé ajouté avec succès', type: 'success' })
    }
    setUtilisateurs(getUtilisateurs())
    setModalForm(false)
    setUtilisateurEnCours(null)
  }

  const confirmerSuppression = () => {
    if (modalSupprimer) {
      supprimerUtilisateur(modalSupprimer)
      setUtilisateurs(getUtilisateurs())
      setToast({ message: 'Employé supprimé', type: 'success' })
      setModalSupprimer(null)
    }
  }

  const nomASupprimer = utilisateurs.find(u => u.id === modalSupprimer)
  const nomCompletASupprimer = nomASupprimer ? `${nomASupprimer.prenom} ${nomASupprimer.nom}` : ''

  return (
    <div className="p-4 sm:p-6 lg:p-8 fade-in">

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Utilisateurs</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {utilisateurs.length} employé{utilisateurs.length > 1 ? 's' : ''} enregistré{utilisateurs.length > 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={ouvrirAjout} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Ajouter un employé
        </button>
      </div>

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
              placeholder="Rechercher par nom, email, poste..."
              value={recherche}
              onChange={e => setRecherche(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
              className="w-full py-2 pl-10 pr-3 rounded-lg border border-slate-200 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         bg-white text-slate-800 placeholder-slate-400"
            />
          </div>
          <select value={filtreDept} onChange={e => setFiltreDept(e.target.value)} className="input-field sm:w-52">
            {departements.map(d => (
              <option key={d} value={d}>{d === 'Tous' ? 'Tous les départements' : d}</option>
            ))}
          </select>
        </div>

        {(recherche || filtreDept !== 'Tous') && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              <span className="font-medium text-slate-700">{utilisateursFiltres.length}</span> résultat{utilisateursFiltres.length > 1 ? 's' : ''}
            </p>
            <button onClick={() => { setRecherche(''); setFiltreDept('Tous') }}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              Réinitialiser
            </button>
          </div>
        )}
      </div>

      {/* Liste des employés */}
      <div className="card overflow-hidden">
        {utilisateursFiltres.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium">Aucun employé trouvé</p>
            <p className="text-slate-400 text-sm mt-1">Modifiez vos filtres ou ajoutez un employé</p>
          </div>
        ) : (
          <>
            {/* Tableau desktop */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Employé</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Département</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Poste</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Équipements</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {utilisateursFiltres.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors duration-100">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar prenom={u.prenom} nom={u.nom} />
                          <div>
                            <p className="font-medium text-slate-800 text-sm">{u.prenom} {u.nom}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-blue-600">{u.email || '—'}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-600">{u.departement || '—'}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-600">{u.poste || '—'}</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" />
                          </svg>
                          {nbEquipements(u)} équipement{nbEquipements(u) > 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => setModalDetail(u)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Voir la fiche">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </button>
                          <button onClick={() => ouvrirModification(u)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Modifier">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                            </svg>
                          </button>
                          <button onClick={() => setModalSupprimer(u.id)}
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
              {utilisateursFiltres.map(u => (
                <div key={u.id} className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar prenom={u.prenom} nom={u.nom} />
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{u.prenom} {u.nom}</p>
                      <p className="text-xs text-blue-600">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 text-xs text-slate-500 mb-3">
                    {u.departement && <span className="bg-slate-100 px-2 py-0.5 rounded">{u.departement}</span>}
                    {u.poste && <span className="bg-slate-100 px-2 py-0.5 rounded">{u.poste}</span>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setModalDetail(u)} className="btn-secondary text-xs py-1.5 flex-1">Voir</button>
                    <button onClick={() => ouvrirModification(u)} className="btn-secondary text-xs py-1.5 flex-1">Modifier</button>
                    <button onClick={() => setModalSupprimer(u.id)} className="btn-danger text-xs py-1.5 flex-1">Supprimer</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {utilisateursFiltres.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-500">
              Affichage de <span className="font-medium">{utilisateursFiltres.length}</span> employé{utilisateursFiltres.length > 1 ? 's' : ''}
              {utilisateurs.length !== utilisateursFiltres.length && ` sur ${utilisateurs.length}`}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {modalForm && utilisateurEnCours && (
        <ModalFormulaire
          utilisateur={utilisateurEnCours}
          onSave={sauvegarder}
          onClose={() => { setModalForm(false); setUtilisateurEnCours(null) }}
        />
      )}

      {modalSupprimer && (
        <ModalConfirmation
          nom={nomCompletASupprimer}
          onConfirm={confirmerSuppression}
          onClose={() => setModalSupprimer(null)}
        />
      )}

      {modalDetail && (
        <ModalDetail
          utilisateur={modalDetail}
          equipements={equipements}
          onClose={() => setModalDetail(null)}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

    </div>
  )
}
