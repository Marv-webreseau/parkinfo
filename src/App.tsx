// ============================================
// FICHIER : src/App.tsx
// RÔLE : Point d'entrée principal de l'app
// HashRouter utilisé pour GitHub Pages
// (évite les erreurs 404 au rechargement)
// ============================================

import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'

import Dashboard from './pages/Dashboard'
import Equipements from './pages/Equipements'
import Utilisateurs from './pages/Utilisateurs'
import Incidents from './pages/Incidents'
import Maintenance from './pages/Maintenance'
import Sidebar, { SidebarContent } from './components/Sidebar'
import { chargerDonneesDemoSiVide } from './data/storage'

function App() {
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    chargerDonneesDemoSiVide()
  }, [])

  return (
    <HashRouter>
      <div className="flex h-screen bg-slate-50 overflow-hidden">

        {/* Sidebar desktop */}
        <Sidebar />

        {/* Fond sombre mobile */}
        {mobileOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar mobile */}
        <aside className={`lg:hidden fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50
                          transform transition-transform duration-300 ease-in-out
                          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <SidebarContent onClose={() => setMobileOpen(false)} />
        </aside>

        {/* Zone principale */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Header mobile */}
          <header className="lg:hidden flex items-center justify-between
                             px-4 h-14 bg-white border-b border-slate-200 shadow-sm flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 leading-tight">ParkInfo</p>
                <p className="text-xs text-slate-400 leading-tight">Gestion de parc IT</p>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </header>

          {/* Contenu des pages */}
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/equipements" element={<Equipements />} />
              <Route path="/utilisateurs" element={<Utilisateurs />} />
              <Route path="/incidents" element={<Incidents />} />
              <Route path="/maintenance" element={<Maintenance />} />
            </Routes>
          </main>

        </div>
      </div>
    </HashRouter>
  )
}

export default App
