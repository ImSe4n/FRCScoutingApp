import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Home from './pages/Home'
import TeamProfile from './pages/TeamProfile'
import EventBrowser from './pages/EventBrowser'
import EventView from './pages/EventView'
import ScoutEntry from './pages/ScoutEntry'
import ScoutDashboard from './pages/ScoutDashboard'
import MatchPredictor from './pages/MatchPredictor'
import PickList from './pages/PickList'
import Assignments from './pages/Assignments'
import TeamManagement from './pages/TeamManagement'

function AppShell({ children }) {
  return (
    <div className="flex min-h-screen">
      <Navbar />
      <main className="flex-1 ml-56 p-6 min-h-screen">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <AppShell>
                <Routes>
                  <Route path="/"            element={<Home />} />
                  <Route path="/team/:num"   element={<TeamProfile />} />
                  <Route path="/events"      element={<EventBrowser />} />
                  <Route path="/event/:key"  element={<EventView />} />
                  <Route path="/scout"       element={<ScoutEntry />} />
                  <Route path="/dashboard"   element={<ScoutDashboard />} />
                  <Route path="/predict"     element={<MatchPredictor />} />
                  <Route path="/picklist"    element={<PickList />} />
                  <Route path="/assignments" element={<Assignments />} />
                  <Route path="/team"        element={<TeamManagement />} />
                </Routes>
              </AppShell>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
