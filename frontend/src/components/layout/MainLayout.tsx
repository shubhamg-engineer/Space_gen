import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Rocket, Satellite, Activity, FileWarning, BarChart3,
  Lightbulb, LogIn, Flame, Newspaper, CloudLightning, Users, ShieldCheck, CalendarDays
} from 'lucide-react';
import { useAuthStore } from '../../store/useStore';

const MainLayout: React.FC = () => {
  const { token, username, logout } = useAuthStore();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Activity className="w-5 h-5" />, end: true },
    { name: 'Satellites', path: '/satellites', icon: <Satellite className="w-5 h-5" /> },
    { name: 'Missions', path: '/missions', icon: <Rocket className="w-5 h-5" /> },
    { name: 'Rockets', path: '/rockets', icon: <Flame className="w-5 h-5" /> },
    { name: 'Failures', path: '/failures', icon: <FileWarning className="w-5 h-5" /> },
    { name: 'Astronauts', path: '/astronauts', icon: <Users className="w-5 h-5" /> },
    { name: 'Space News', path: '/news', icon: <Newspaper className="w-5 h-5" /> },
    { name: 'Space Weather', path: '/space-weather', icon: <CloudLightning className="w-5 h-5" /> },
    { name: 'Analytics', path: '/analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { name: 'SpaceX Intel', path: '/spacex', icon: <Rocket className="w-5 h-5" /> },
    { name: 'Space Calendar', path: '/calendar', icon: <CalendarDays className="w-5 h-5" /> },
    { name: 'Ideas Board', path: '/ideas', icon: <Lightbulb className="w-5 h-5" /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-slate-800">
          <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-2">
            <Rocket className="w-5 h-5 text-emerald-400" />
            SIP
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-wider font-semibold">Space Intelligence Platform</p>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 mt-3 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                }`
              }
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Owner section */}
        <div className="p-3 border-t border-slate-800 space-y-1">
          {token ? (
            <>
              <NavLink
                to="/owner"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                  }`
                }
              >
                <ShieldCheck className="w-5 h-5" />
                <span className="font-medium">Owner Intel</span>
              </NavLink>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
              >
                <LogIn className="w-4 h-4 rotate-180" />
                <span>Logout ({username})</span>
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`
              }
            >
              <LogIn className="w-5 h-5" />
              <span className="font-medium">Owner Login</span>
            </NavLink>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md flex items-center justify-between px-6 flex-shrink-0">
          <span className="text-slate-400 text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Systems Operational
          </span>
          <div className="text-xs text-slate-600 font-mono">
            SIP v2.0 · {new Date().toUTCString().slice(0, 25)} UTC
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
