// ============================================
// FICHIER : src/App.tsx
// RÔLE : Point d'entrée principal de l'app
// C'est ici qu'on configure la navigation
// entre les différentes pages (routing)
// ============================================

import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Dashboard from './pages/Dashboard'
import Equipements from './pages/Equipements'
import Utilisateurs from './pages/Utilisateurs'
import Incidents from './pages/Incidents'
import Maintenance from './pages/Maintenance'
import Sidebar from './components/Sidebar'
import { chargerDonneesDemoSiVide } from './data/storage'

function App() {
  useEffect(() => {
    chargerDonneesDemoSiVide()
  }, [])

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <Sidebar />
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
    </BrowserRouter>
  )
}

export default App
