import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Satellite, Rocket, FileWarning, BarChart3, Newspaper, CloudLightning, Users, Lightbulb, ArrowRight, CalendarDays } from 'lucide-react';
import apiClient from '../api/client';

const modules = [
  { name: 'Satellites', desc: 'Real-time TLE tracking & orbital intelligence', path: '/satellites', icon: Satellite, color: 'from-emerald-500 to-teal-600' },
  { name: 'Missions', desc: 'Live launch tracker & mission intelligence', path: '/missions', icon: Rocket, color: 'from-blue-500 to-indigo-600' },
  { name: 'Rockets', desc: 'System explorer with full specs', path: '/rockets', icon: Rocket, color: 'from-orange-500 to-red-600' },
  { name: 'Failures', desc: 'AI-powered failure & root cause analysis', path: '/failures', icon: FileWarning, color: 'from-red-500 to-rose-600' },
  { name: 'Analytics', desc: 'Platform-wide space intelligence metrics', path: '/analytics', icon: BarChart3, color: 'from-purple-500 to-violet-600' },
  { name: 'Astronauts', desc: 'Current crew & astronaut intelligence', path: '/astronauts', icon: Users, color: 'from-cyan-500 to-sky-600' },
  { name: 'Space News', desc: 'AI-summarised spaceflight news feed', path: '/news', icon: Newspaper, color: 'from-yellow-500 to-amber-600' },
  { name: 'Space Weather', desc: 'NOAA solar storm & KP index monitor', path: '/space-weather', icon: CloudLightning, color: 'from-fuchsia-500 to-pink-600' },
  { name: 'SpaceX Intel', desc: 'ISS tracker, Starlink & Starship updates', path: '/spacex', icon: Rocket, color: 'from-slate-500 to-slate-700' },
  { name: 'Space Calendar', desc: 'Launches, milestones & events in one view', path: '/calendar', icon: CalendarDays, color: 'from-violet-500 to-purple-700' },
];

const LandingPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    apiClient.get('/analytics/summary')
      .then(res => setStats(res.data))
      .catch(() => null);
  }, []);

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      {/* Hero */}
      <div className="relative text-center py-16 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent rounded-3xl pointer-events-none" />
        <div className="relative">
          <span className="inline-block px-3 py-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6 uppercase tracking-widest">
            Space Intelligence Platform v2.0
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent leading-tight mb-6">
            Not just data —<br />but understanding.
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
            Real-time satellite tracking, live launch intelligence, failure analysis, AI explanations,
            and space weather monitoring — all in one place.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/satellites" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-all hover:scale-105 shadow-lg shadow-emerald-500/20">
              <Satellite className="w-5 h-5" />
              Explore Satellites
            </Link>
            <Link to="/missions" className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl font-semibold transition-all hover:scale-105">
              <Rocket className="w-5 h-5" />
              View Missions
            </Link>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Tracked Satellites', value: stats.satellites?.total ?? 0, color: 'text-emerald-400' },
            { label: 'Upcoming Launches', value: stats.launches?.upcoming ?? 0, color: 'text-blue-400' },
            { label: 'Failure Records', value: stats.failures?.total ?? 0, color: 'text-red-400' },
            { label: 'Rockets in DB', value: stats.rockets?.total ?? 0, color: 'text-orange-400' },
          ].map(s => (
            <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center">
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Module grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-slate-200">Intelligence Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map(m => {
            const Icon = m.icon;
            return (
              <Link key={m.name} to={m.path}
                className="group bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-600 hover:bg-slate-800/50 transition-all hover:-translate-y-1"
              >
                <div className={`inline-flex p-2.5 rounded-lg bg-gradient-to-br ${m.color} mb-4`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-slate-100 mb-1 group-hover:text-white">{m.name}</h3>
                <p className="text-xs text-slate-500">{m.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-xs text-slate-600 group-hover:text-slate-400 transition-colors">
                  <span>Open module</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            );
          })}
          <Link to="/ideas"
            className="group bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-600 hover:bg-slate-800/50 transition-all hover:-translate-y-1"
          >
            <div className="inline-flex p-2.5 rounded-lg bg-gradient-to-br from-lime-500 to-green-600 mb-4">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-slate-100 mb-1 group-hover:text-white">Ideas Board</h3>
            <p className="text-xs text-slate-500">Submit & vote on community feature ideas</p>
            <div className="mt-4 flex items-center gap-1 text-xs text-slate-600 group-hover:text-slate-400 transition-colors">
              <span>Open module</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </Link>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-slate-700 pb-4">
        Space Intelligence Platform · Powered by CelesTrak, Launch Library 2, NOAA SWPC, Spaceflight News API & Groq AI
      </p>
    </div>
  );
};

export default LandingPage;
