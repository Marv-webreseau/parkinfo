// ============================================
// FICHIER : src/pages/Dashboard.tsx
// RÔLE : Tableau de bord principal
// C'est la première page que voit le DSI
// Elle résume tout l'état du parc en temps réel
// FONCTIONNALITÉS :
//   - Cartes de statistiques
//   - Graphiques (barres + camembert)
//   - Derniers incidents
//   - Prochaines maintenances
//   - Alertes automatiques
// ============================================

import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend
} from 'recharts'
import {
  getEquipements,
  getIncidents,
  getMaintenances,
  getUtilisateurs,
} from '../data/storage'
import type { Equipement, Incident, Maintenance } from '../types'

// ============================================
// COMPOSANT : Carte statistique
// ============================================
function StatCard({
  titre, valeur, sousTitre, couleur, icone
}: {
  titre: string
  valeur: number
  sousTitre?: string
  couleur: 'blue' | 'emerald' | 'red' | 'amber' | 'purple'
  icone: React.ReactNode
}) {
  const styles = {
    blue:    { bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    red:     { bg: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-100' },
    amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-100' },
    purple:  { bg: 'bg-purple-50',  text: 'text-purple-600',  border: 'border-purple-100' },
  }
  const s = styles[couleur]

  return (
    <div className={`card p-5 border ${s.border}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-slate-500">{titre}</p>
        <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center ${s.text}`}>
          {icone}
        </div>
      </div>
      <p className={`text-3xl font-bold ${s.text}`}>{valeur}</p>
      {sousTitre && (
        <p className="text-xs text-slate-400 mt-1">{sousTitre}</p>
      )}
    </div>
  )
}

// ============================================
// COMPOSANT : Badge statut incident
// ============================================
function BadgeStatutIncident({ statut }: { statut: Incident['statut'] }) {
  const styles = {
    'Ouvert':   'bg-red-100 text-red-700',
    'En cours': 'bg-amber-100 text-amber-700',
    'Résolu':   'bg-emerald-100 text-emerald-700',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[statut]}`}>
      {statut}
    </span>
  )
}

// ============================================
// COMPOSANT : Badge statut maintenance
// ============================================
function BadgeStatutMaintenance({ statut }: { statut: Maintenance['statut'] }) {
  const styles = {
    'Planifiée': 'bg-blue-100 text-blue-700',
    'En cours':  'bg-amber-100 text-amber-700',
    'Terminée':  'bg-emerald-100 text-emerald-700',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[statut]}`}>
      {statut}
    </span>
  )
}

// ============================================
// COULEURS DU GRAPHIQUE CAMEMBERT
// ============================================
const COULEURS_PIE = {
  'Actif':          '#10b981',
  'En panne':       '#ef4444',
  'En maintenance': '#f59e0b',
  'Retiré':         '#94a3b8',
}

// ============================================
// PAGE PRINCIPALE DASHBOARD
// ============================================
export default function Dashboard() {
  const [equipements, setEquipements]   = useState<Equipement[]>([])
  const [incidents, setIncidents]       = useState<Incident[]>([])
  const [maintenances, setMaintenances] = useState<Maintenance[]>([])
  const [nbUtilisateurs, setNbUtilisateurs] = useState(0)

  // Chargement de toutes les données au démarrage
  useEffect(() => {
    setEquipements(getEquipements())
    setIncidents(getIncidents())
    setMaintenances(getMaintenances())
    setNbUtilisateurs(getUtilisateurs().length)
  }, [])

  // ---- CALCUL DES STATISTIQUES ----

  const stats = {
    totalEquipements:      equipements.length,
    actifs:                equipements.filter(e => e.statut === 'Actif').length,
    enPanne:               equipements.filter(e => e.statut === 'En panne').length,
    enMaintenance:         equipements.filter(e => e.statut === 'En maintenance').length,
    incidentsOuverts:      incidents.filter(i => i.statut !== 'Résolu').length,
    maintenancesPlanifiees: maintenances.filter(m => m.statut !== 'Terminée').length,
  }

  // ---- DONNÉES GRAPHIQUE CAMEMBERT (statuts) ----
  const donneesPie = [
    { name: 'Actif',          value: stats.actifs },
    { name: 'En panne',       value: stats.enPanne },
    { name: 'En maintenance', value: stats.enMaintenance },
    { name: 'Retiré',         value: equipements.filter(e => e.statut === 'Retiré').length },
  ].filter(d => d.value > 0) // On n'affiche que les statuts qui ont des équipements

  // ---- DONNÉES GRAPHIQUE BARRES (par département) ----
  const departements = Array.from(new Set(equipements.map(e => e.departement).filter(Boolean)))
  const donneesBarres = departements.map(dept => ({
    name: dept.length > 12 ? dept.substring(0, 12) + '...' : dept,
    total: equipements.filter(e => e.departement === dept).length,
    actifs: equipements.filter(e => e.departement === dept && e.statut === 'Actif').length,
    pannes: equipements.filter(e => e.departement === dept && e.statut === 'En panne').length,
  }))

  // ---- ALERTES AUTOMATIQUES ----
  const aujourd_hui = new Date()
  const dans30jours = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  const alertes = [
    // Garanties qui expirent bientôt
    ...equipements
      .filter(e => {
        if (!e.garantieJusquau) return false
        const dateGarantie = new Date(e.garantieJusquau)
        return dateGarantie > aujourd_hui && dateGarantie < dans30jours
      })
      .map(e => ({
        type: 'warning' as const,
        message: `Garantie de ${e.nom} expire le ${new Date(e.garantieJusquau).toLocaleDateString('fr-FR')}`,
      })),

    // Garanties déjà expirées
    ...equipements
      .filter(e => e.garantieJusquau && new Date(e.garantieJusquau) < aujourd_hui && e.statut === 'Actif')
      .map(e => ({
        type: 'danger' as const,
        message: `Garantie de ${e.nom} est expirée`,
      })),

    // Incidents urgents non résolus
    ...incidents
      .filter(i => i.priorite === 'Urgente' && i.statut !== 'Résolu')
      .map(i => ({
        type: 'danger' as const,
        message: `Incident urgent non résolu : "${i.titre}" sur ${i.equipementNom}`,
      })),

    // Équipements en panne sans incident déclaré
    ...equipements
      .filter(e => {
        if (e.statut !== 'En panne') return false
        const aIncident = incidents.some(i => i.equipementId === e.id && i.statut !== 'Résolu')
        return !aIncident
      })
      .map(e => ({
        type: 'warning' as const,
        message: `${e.nom} est en panne mais aucun incident n'est déclaré`,
      })),
  ]

  // 5 derniers incidents
  const derniersIncidents = [...incidents]
    .sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime())
    .slice(0, 5)

  // Prochaines maintenances non terminées
  const prochainesMaintenances = [...maintenances]
    .filter(m => m.statut !== 'Terminée')
    .sort((a, b) => new Date(a.datePrevu).getTime() - new Date(b.datePrevu).getTime())
    .slice(0, 5)

  return (
    <div className="p-4 sm:p-6 lg:p-8 fade-in">

      {/* ---- EN-TÊTE ---- */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Tableau de bord</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Vue d'ensemble du parc informatique — mis à jour en temps réel
        </p>
      </div>

      {/* ---- CARTES STATISTIQUES ---- */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        <StatCard
          titre="Équipements"
          valeur={stats.totalEquipements}
          sousTitre="Total enregistrés"
          couleur="blue"
          icone={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" />
            </svg>
          }
        />
        <StatCard
          titre="Actifs"
          valeur={stats.actifs}
          sousTitre="En service"
          couleur="emerald"
          icone={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          titre="En panne"
          valeur={stats.enPanne}
          sousTitre="Hors service"
          couleur="red"
          icone={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          }
        />
        <StatCard
          titre="Incidents"
          valeur={stats.incidentsOuverts}
          sousTitre="Non résolus"
          couleur="amber"
          icone={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
            </svg>
          }
        />
        <StatCard
          titre="Maintenances"
          valeur={stats.maintenancesPlanifiees}
          sousTitre="En attente"
          couleur="purple"
          icone={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          }
        />
        <StatCard
          titre="Employés"
          valeur={nbUtilisateurs}
          sousTitre="Enregistrés"
          couleur="blue"
          icone={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          }
        />
      </div>

      {/* ---- ALERTES ---- */}
      {alertes.length > 0 && (
        <div className="card p-4 mb-6 border-amber-100">
          <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            Alertes — {alertes.length} notification{alertes.length > 1 ? 's' : ''}
          </h2>
          <div className="space-y-2">
            {alertes.slice(0, 5).map((alerte, i) => (
              <div key={i} className={`flex items-start gap-3 px-3 py-2.5 rounded-lg text-sm
                ${alerte.type === 'danger'
                  ? 'bg-red-50 text-red-700 border border-red-100'
                  : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {alerte.type === 'danger'
                    ? <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    : <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  }
                </svg>
                {alerte.message}
              </div>
            ))}
            {alertes.length > 5 && (
              <p className="text-xs text-slate-400 text-center pt-1">
                + {alertes.length - 5} autre{alertes.length - 5 > 1 ? 's' : ''} alerte{alertes.length - 5 > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ---- GRAPHIQUES ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">

        {/* Graphique barres — équipements par département */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">
            Équipements par département
          </h2>
          {donneesBarres.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
              Aucune donnée disponible
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={donneesBarres} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="actifs" name="Actifs" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pannes" name="En panne" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Graphique camembert — répartition statuts */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">
            Répartition par statut
          </h2>
          {donneesPie.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
              Aucune donnée disponible
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={donneesPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {donneesPie.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={COULEURS_PIE[entry.name as keyof typeof COULEURS_PIE] || '#94a3b8'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span style={{ fontSize: '12px', color: '#64748b' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>

      {/* ---- TABLEAUX DU BAS ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Derniers incidents */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Derniers incidents</h2>
            <span className="text-xs text-slate-400">{incidents.length} au total</span>
          </div>

          {derniersIncidents.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">
              Aucun incident déclaré
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {derniersIncidents.map(incident => (
                <div key={incident.id} className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{incident.titre}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {incident.equipementNom} · {incident.dateCreation ? new Date(incident.dateCreation).toLocaleDateString('fr-FR') : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                      ${incident.priorite === 'Urgente' ? 'bg-red-100 text-red-700' :
                        incident.priorite === 'Moyenne' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-600'}`}>
                      {incident.priorite}
                    </span>
                    <BadgeStatutIncident statut={incident.statut} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Prochaines maintenances */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Prochaines maintenances</h2>
            <span className="text-xs text-slate-400">{stats.maintenancesPlanifiees} en attente</span>
          </div>

          {prochainesMaintenances.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">
              Aucune maintenance planifiée
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {prochainesMaintenances.map(m => (
                <div key={m.id} className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{m.titre}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {m.equipementNom} · 👷 {m.technicien}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-slate-500">
                      {new Date(m.datePrevu).toLocaleDateString('fr-FR')}
                    </span>
                    <BadgeStatutMaintenance statut={m.statut} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
