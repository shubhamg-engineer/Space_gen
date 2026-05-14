import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import LandingPage from './pages/LandingPage';
import SatelliteDashboard from './pages/SatelliteDashboard';
import MissionDashboard from './pages/MissionDashboard';
import RocketExplorer from './pages/RocketExplorer';
import FailureIntelligence from './pages/FailureIntelligence';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import IdeasBoard from './pages/IdeasBoard';
import LoginPage from './pages/LoginPage';
import OwnerDashboard from './pages/OwnerDashboard';
import SpaceNews from './pages/SpaceNews';
import SpaceWeather from './pages/SpaceWeather';
import AstronautModule from './pages/AstronautModule';
import SpaceXPage from './pages/SpaceXPage';
import SpaceCalendar from './pages/SpaceCalendar';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="satellites" element={<SatelliteDashboard />} />
          <Route path="missions" element={<MissionDashboard />} />
          <Route path="rockets" element={<RocketExplorer />} />
          <Route path="failures" element={<FailureIntelligence />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="astronauts" element={<AstronautModule />} />
          <Route path="news" element={<SpaceNews />} />
          <Route path="space-weather" element={<SpaceWeather />} />
          <Route path="spacex" element={<SpaceXPage />} />
          <Route path="calendar" element={<SpaceCalendar />} />
          <Route path="ideas" element={<IdeasBoard />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="owner" element={<OwnerDashboard />} />
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <p className="text-6xl font-black text-slate-800 mb-4">404</p>
              <p className="text-slate-400">This module doesn't exist yet.</p>
            </div>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
