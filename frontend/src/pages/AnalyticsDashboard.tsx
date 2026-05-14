import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Globe, Rocket, AlertTriangle, Satellite, Newspaper, Users } from 'lucide-react';
import apiClient from '../api/client';

interface Stats {
  satellites: { total: number; active: number };
  missions: { total: number };
  rockets: { total: number; active: number };
  failures: { total: number; catastrophic: number; by_cause: Record<string, number> };
  launches: { total: number; upcoming: number };
  astronauts: { total: number };
  news: { total: number };
  orbit_distribution: Record<string, number>;
}

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub?: string;
  color?: string;
}> = ({ icon, label, value, sub, color = 'text-slate-200' }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-slate-500 text-sm">{label}</span>
      {icon}
    </div>
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
    {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
  </div>
);

const AnalyticsDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/analytics/summary')
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-purple-400" /> Space Analytics
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5 animate-pulse h-28" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return <div className="text-slate-500 p-8">Failed to load analytics.</div>;

  const primaryStats = [
    { icon: <Satellite className="w-5 h-5 text-emerald-400" />, label: 'Total Satellites', value: stats.satellites.total, sub: `${stats.satellites.active} active`, color: 'text-emerald-400' },
    { icon: <Rocket className="w-5 h-5 text-blue-400" />, label: 'Launches in DB', value: stats.launches.total, sub: `${stats.launches.upcoming} upcoming`, color: 'text-blue-400' },
    { icon: <Rocket className="w-5 h-5 text-orange-400" />, label: 'Rocket Systems', value: stats.rockets.total, sub: `${stats.rockets.active} active`, color: 'text-orange-400' },
    { icon: <AlertTriangle className="w-5 h-5 text-red-400" />, label: 'Failure Records', value: stats.failures.total, sub: `${stats.failures.catastrophic} catastrophic`, color: 'text-red-400' },
    { icon: <Globe className="w-5 h-5 text-cyan-400" />, label: 'Missions', value: stats.missions.total, color: 'text-cyan-400' },
    { icon: <Users className="w-5 h-5 text-violet-400" />, label: 'Astronauts', value: stats.astronauts.total, color: 'text-violet-400' },
    { icon: <Newspaper className="w-5 h-5 text-yellow-400" />, label: 'News Articles', value: stats.news.total, color: 'text-yellow-400' },
    { icon: <TrendingUp className="w-5 h-5 text-pink-400" />, label: 'Satellites Active %', value: stats.satellites.total ? `${Math.round((stats.satellites.active / stats.satellites.total) * 100)}%` : '0%', color: 'text-pink-400' },
  ];

  // orbit distribution bars
  const orbitTotal = Object.values(stats.orbit_distribution).reduce((a, b) => a + b, 0);
  const orbitColors: Record<string, string> = {
    LEO: 'bg-emerald-500', MEO: 'bg-blue-500', GEO: 'bg-orange-500', SSO: 'bg-cyan-500', HEO: 'bg-purple-500',
  };

  // failure cause bars
  const causeTotal = Object.values(stats.failures.by_cause).reduce((a, b) => a + b, 0);
  const causeColors: Record<string, string> = {
    software: 'bg-blue-500', structural: 'bg-orange-500', propulsion: 'bg-red-500',
    human_error: 'bg-purple-500', thermal: 'bg-yellow-500',
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-purple-400" />
          Space Analytics
        </h1>
        <p className="text-slate-400 mt-1">Platform-wide intelligence metrics across all SIP modules.</p>
      </div>

      {/* Primary stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {primaryStats.map(s => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Orbit Distribution */}
        {orbitTotal > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 text-slate-200">Satellite Orbit Distribution</h2>
            <div className="space-y-3">
              {Object.entries(stats.orbit_distribution)
                .sort(([, a], [, b]) => b - a)
                .map(([orbit, count]) => (
                  <div key={orbit}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">{orbit}</span>
                      <span className="text-slate-300 font-mono">{count} <span className="text-slate-600">({Math.round((count / orbitTotal) * 100)}%)</span></span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${orbitColors[orbit] ?? 'bg-slate-500'}`}
                        style={{ width: `${(count / orbitTotal) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Failure Cause Distribution */}
        {causeTotal > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 text-slate-200">Failure Root Cause Distribution</h2>
            <div className="space-y-3">
              {Object.entries(stats.failures.by_cause)
                .sort(([, a], [, b]) => b - a)
                .map(([cause, count]) => (
                  <div key={cause}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400 capitalize">{cause.replace('_', ' ')}</span>
                      <span className="text-slate-300 font-mono">{count} <span className="text-slate-600">({Math.round((count / causeTotal) * 100)}%)</span></span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${causeColors[cause] ?? 'bg-slate-500'}`}
                        style={{ width: `${(count / causeTotal) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* If no orbit data yet */}
        {orbitTotal === 0 && causeTotal === 0 && (
          <div className="col-span-full bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Charts will populate once data is ingested.</p>
            <p className="text-sm mt-1">Go to Satellites → Ingest TLEs, or Failures → Seed Data.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
