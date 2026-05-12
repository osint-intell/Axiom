import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import Investigations from './pages/Investigations'
import IdentityCorrelation from './pages/IdentityCorrelation'
import RelationshipGraph from './pages/RelationshipGraph'
import EvidenceVault from './pages/EvidenceVault'
import Timeline from './pages/Timeline'
import Notes from './pages/Notes'
import Exports from './pages/Exports'
import Settings from './pages/Settings'

function LayoutOutlet() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<LayoutOutlet />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/investigations" element={<Investigations />} />
        <Route path="/identity-correlation" element={<IdentityCorrelation />} />
        <Route path="/relationship-graph" element={<RelationshipGraph />} />
        <Route path="/evidence-vault" element={<EvidenceVault />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/exports" element={<Exports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}
