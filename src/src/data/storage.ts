// ============================================
// FICHIER : src/data/storage.ts
// RÔLE : Toutes les fonctions pour lire et
// écrire les données dans le LocalStorage
// ============================================

import type { Equipement, Utilisateur, Incident, Maintenance } from '../types'

const KEYS = {
  EQUIPEMENTS: 'parkinfo_equipements',
  UTILISATEURS: 'parkinfo_utilisateurs',
  INCIDENTS: 'parkinfo_incidents',
  MAINTENANCES: 'parkinfo_maintenances',
}

export const genererID = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

// ---- ÉQUIPEMENTS ----
export const getEquipements = (): Equipement[] => {
  const data = localStorage.getItem(KEYS.EQUIPEMENTS)
  return data ? JSON.parse(data) : []
}
export const saveEquipements = (equipements: Equipement[]): void => {
  localStorage.setItem(KEYS.EQUIPEMENTS, JSON.stringify(equipements))
}
export const ajouterEquipement = (equipement: Omit<Equipement, 'id'>): Equipement => {
  const equipements = getEquipements()
  const nouvelEquipement: Equipement = { ...equipement, id: genererID() }
  equipements.push(nouvelEquipement)
  saveEquipements(equipements)
  return nouvelEquipement
}
export const modifierEquipement = (id: string, modifications: Partial<Equipement>): void => {
  const equipements = getEquipements()
  const index = equipements.findIndex(e => e.id === id)
  if (index !== -1) {
    equipements[index] = { ...equipements[index], ...modifications }
    saveEquipements(equipements)
  }
}
export const supprimerEquipement = (id: string): void => {
  saveEquipements(getEquipements().filter(e => e.id !== id))
}

// ---- UTILISATEURS ----
export const getUtilisateurs = (): Utilisateur[] => {
  const data = localStorage.getItem(KEYS.UTILISATEURS)
  return data ? JSON.parse(data) : []
}
export const saveUtilisateurs = (utilisateurs: Utilisateur[]): void => {
  localStorage.setItem(KEYS.UTILISATEURS, JSON.stringify(utilisateurs))
}
export const ajouterUtilisateur = (utilisateur: Omit<Utilisateur, 'id'>): Utilisateur => {
  const utilisateurs = getUtilisateurs()
  const nouvelUtilisateur: Utilisateur = { ...utilisateur, id: genererID() }
  utilisateurs.push(nouvelUtilisateur)
  saveUtilisateurs(utilisateurs)
  return nouvelUtilisateur
}
export const modifierUtilisateur = (id: string, modifications: Partial<Utilisateur>): void => {
  const utilisateurs = getUtilisateurs()
  const index = utilisateurs.findIndex(u => u.id === id)
  if (index !== -1) {
    utilisateurs[index] = { ...utilisateurs[index], ...modifications }
    saveUtilisateurs(utilisateurs)
  }
}
export const supprimerUtilisateur = (id: string): void => {
  saveUtilisateurs(getUtilisateurs().filter(u => u.id !== id))
}

// ---- INCIDENTS ----
export const getIncidents = (): Incident[] => {
  const data = localStorage.getItem(KEYS.INCIDENTS)
  return data ? JSON.parse(data) : []
}
export const saveIncidents = (incidents: Incident[]): void => {
  localStorage.setItem(KEYS.INCIDENTS, JSON.stringify(incidents))
}
export const ajouterIncident = (incident: Omit<Incident, 'id'>): Incident => {
  const incidents = getIncidents()
  const nouvelIncident: Incident = { ...incident, id: genererID() }
  incidents.push(nouvelIncident)
  saveIncidents(incidents)
  return nouvelIncident
}
export const modifierIncident = (id: string, modifications: Partial<Incident>): void => {
  const incidents = getIncidents()
  const index = incidents.findIndex(i => i.id === id)
  if (index !== -1) {
    incidents[index] = { ...incidents[index], ...modifications }
    saveIncidents(incidents)
  }
}
export const supprimerIncident = (id: string): void => {
  saveIncidents(getIncidents().filter(i => i.id !== id))
}

// ---- MAINTENANCES ----
export const getMaintenances = (): Maintenance[] => {
  const data = localStorage.getItem(KEYS.MAINTENANCES)
  return data ? JSON.parse(data) : []
}
export const saveMaintenances = (maintenances: Maintenance[]): void => {
  localStorage.setItem(KEYS.MAINTENANCES, JSON.stringify(maintenances))
}
export const ajouterMaintenance = (maintenance: Omit<Maintenance, 'id'>): Maintenance => {
  const maintenances = getMaintenances()
  const nouvelleMaintenance: Maintenance = { ...maintenance, id: genererID() }
  maintenances.push(nouvelleMaintenance)
  saveMaintenances(maintenances)
  return nouvelleMaintenance
}
export const modifierMaintenance = (id: string, modifications: Partial<Maintenance>): void => {
  const maintenances = getMaintenances()
  const index = maintenances.findIndex(m => m.id === id)
  if (index !== -1) {
    maintenances[index] = { ...maintenances[index], ...modifications }
    saveMaintenances(maintenances)
  }
}
export const supprimerMaintenance = (id: string): void => {
  saveMaintenances(getMaintenances().filter(m => m.id !== id))
}

// ---- DONNÉES DE DÉMO ----
export const chargerDonneesDemoSiVide = (): void => {
  if (getEquipements().length === 0) {
    const demo: Omit<Equipement, 'id'>[] = [
      { nom: 'PC-2026-001', type: 'Ordinateur', statut: 'Actif', departement: 'Comptabilité', utilisateur: 'Koffi Mensah', dateAchat: '2024-03-10', garantieJusquau: '2027-03-10', marque: 'Dell', modele: 'Latitude 5520', description: 'Ordinateur principal du service comptabilité' },
      { nom: 'PC-2026-002', type: 'Ordinateur', statut: 'En panne', departement: 'Direction', utilisateur: 'Amina Diallo', dateAchat: '2023-06-15', garantieJusquau: '2026-06-15', marque: 'HP', modele: 'EliteBook 840', description: 'Écran noir au démarrage' },
      { nom: 'SRV-DELL-01', type: 'Serveur', statut: 'Actif', departement: 'Informatique', utilisateur: 'Service IT', dateAchat: '2022-01-20', garantieJusquau: '2026-05-20', marque: 'Dell', modele: 'PowerEdge R740', description: 'Serveur principal de fichiers' },
      { nom: 'IMP-HP-001', type: 'Imprimante', statut: 'En maintenance', departement: 'RH', utilisateur: 'Service RH', dateAchat: '2023-09-05', garantieJusquau: '2025-09-05', marque: 'HP', modele: 'LaserJet Pro M404', description: 'Bourrage papier fréquent' },
      { nom: 'PC-2026-003', type: 'Ordinateur', statut: 'Actif', departement: 'Commercial', utilisateur: 'Moussa Traoré', dateAchat: '2025-01-08', garantieJusquau: '2028-01-08', marque: 'Lenovo', modele: 'ThinkPad E15', description: '' },
    ]
    demo.forEach(e => ajouterEquipement(e))
  }
  if (getUtilisateurs().length === 0) {
    const demo: Omit<Utilisateur, 'id'>[] = [
      { nom: 'Mensah', prenom: 'Koffi', email: 'k.mensah@structure.bj', departement: 'Comptabilité', poste: 'Comptable senior' },
      { nom: 'Diallo', prenom: 'Amina', email: 'a.diallo@structure.bj', departement: 'Direction', poste: 'Directrice générale' },
      { nom: 'Traoré', prenom: 'Moussa', email: 'm.traore@structure.bj', departement: 'Commercial', poste: 'Commercial terrain' },
      { nom: 'Adjovi', prenom: 'Clarisse', email: 'c.adjovi@structure.bj', departement: 'RH', poste: 'Responsable RH' },
    ]
    demo.forEach(u => ajouterUtilisateur(u))
  }
}
