// ============================================
// FICHIER : src/types/index.ts
// RÔLE : Définir la structure de toutes les
// données utilisées dans l'application
// ============================================

export interface Equipement {
  id: string
  nom: string
  type: 'Ordinateur' | 'Imprimante' | 'Serveur' | 'Téléphone' | 'Autre'
  statut: 'Actif' | 'En panne' | 'En maintenance' | 'Retiré'
  departement: string
  utilisateur: string
  dateAchat: string
  garantieJusquau: string
  marque: string
  modele: string
  description: string
}

export interface Utilisateur {
  id: string
  nom: string
  prenom: string
  email: string
  departement: string
  poste: string
}

export interface Incident {
  id: string
  equipementId: string
  equipementNom: string
  titre: string
  description: string
  statut: 'Ouvert' | 'En cours' | 'Résolu'
  priorite: 'Faible' | 'Moyenne' | 'Urgente'
  dateCreation: string
  dateResolution?: string
}

export interface Maintenance {
  id: string
  equipementId: string
  equipementNom: string
  titre: string
  technicien: string
  statut: 'Planifiée' | 'En cours' | 'Terminée'
  datePrevu: string
  dateTermine?: string
  notes: string
}

export interface StatsDashboard {
  totalEquipements: number
  actifs: number
  enPanne: number
  enMaintenance: number
  retires: number
  incidentsOuverts: number
  maintenancesPlanifiees: number
}
