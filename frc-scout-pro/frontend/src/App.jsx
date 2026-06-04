import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import TeamProfile from './pages/TeamProfile'
import EventBrowser from './pages/EventBrowser'
import EventView from './pages/EventView'
import ScoutEntry from './pages/ScoutEntry'
import ScoutDashboard from './pages/ScoutDashboard'
import MatchPredictor from './pages/MatchPredictor'
import PickList from './pages/PickList'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen">
        <Navbar />
        <main className="flex-1 ml-56 p-6 min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/team/:num" element={<TeamProfile />} />
            <Route path="/events" element={<EventBrowser />} />
            <Route path="/event/:key" element={<EventView />} />
            <Route path="/scout" element={<ScoutEntry />} />
            <Route path="/dashboard" element={<ScoutDashboard />} />
            <Route path="/predict" element={<MatchPredictor />} />
            <Route path="/picklist" element={<PickList />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
