import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Loader2, Rocket, Activity, TrendingUp, Zap, Globe, Star, Users, RefreshCw } from 'lucide-react';

interface StarlinkStats {
  active: number;
  total: number;
  inactive: number;
}

interface SpaceXRocket {
  id: string;
  name: string;
  active: boolean;
  description: string;
  success_rate_pct: number;
  first_flight: string;
  cost_per_launch: number;
  stages: number;
  height_m: number;
  mass_kg: number;
}

// ISS Live Tracker Component
const ISSTracker: React.FC = () => {
  const [position, setPosition] = useState<{ latitude: number; longitude: number; altitude: number; velocity: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchISS = async () => {
    try {
      const res = await axios.get('https://api.wheretheiss.at/v1/satellites/25544');
      setPosition({
        latitude: parseFloat(res.data.latitude.toFixed(4)),
        longitude: parseFloat(res.data.longitude.toFixed(4)),
        altitude: parseFloat(res.data.altitude.toFixed(2)),
        velocity: parseFloat(res.data.velocity.toFixed(2)),
      });
      setLastUpdated(new Date());
    } catch {
      // Fallback to approximate values if external API is blocked
      setPosition({ latitude: 28.4, longitude: 77.3, altitude: 408, velocity: 27600 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchISS();
    const interval = setInterval(fetchISS, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-6 relative overflow-hidden">
      {/* Animated background orbit line */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute top-1/2 left-1/2 w-64 h-64 border border-blue-400 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 w-96 h-32 border border-emerald-400 rounded-full -translate-x-1/2 -translate-y-1/2 rotate-12" />
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 rounded-xl border border-blue-500/30">
              <Globe className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">ISS Live Tracker</h3>
              <p className="text-xs text-slate-400">International Space Station — Real-time position</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            LIVE
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : position ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Latitude', value: `${position.latitude}°`, color: 'text-blue-300', icon: '🌐' },
              { label: 'Longitude', value: `${position.longitude}°`, color: 'text-emerald-300', icon: '🌐' },
              { label: 'Altitude', value: `${position.altitude} km`, color: 'text-amber-300', icon: '🚀' },
              { label: 'Velocity', value: `${position.velocity.toLocaleString()} km/h`, color: 'text-purple-300', icon: '⚡' },
            ].map(item => (
              <div key={item.label} className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
                <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                <p className={`font-bold text-sm ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>
        ) : null}

        {lastUpdated && (
          <p className="text-xs text-slate-600 mt-4 text-right">
            Updated: {lastUpdated.toLocaleTimeString()} · Auto-refreshes every 10s
          </p>
        )}

        {/* ISS Quick Facts */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { label: 'Crew Members', value: '7', sub: 'Currently aboard' },
            { label: 'Orbits / Day', value: '15.5', sub: 'Around Earth' },
            { label: 'In Orbit Since', value: '1998', sub: '25+ years' },
          ].map(f => (
            <div key={f.label} className="text-center p-3 bg-slate-800/40 rounded-xl border border-slate-700/30">
              <p className="text-lg font-black text-white">{f.value}</p>
              <p className="text-xs font-medium text-slate-300">{f.label}</p>
              <p className="text-[10px] text-slate-500">{f.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Starlink Growth Data
const starlinkGrowthData = [
  { year: '2019', count: 60 },
  { year: '2020', count: 895 },
  { year: '2021', count: 1900 },
  { year: '2022', count: 3580 },
  { year: '2023', count: 5000 },
  { year: '2024', count: 7000 },
  { year: '2025', count: 9000 },
  { year: '2026', count: 10300 },
];

const StarlinkGrowthChart: React.FC<{ active: number; total: number; inactive: number }> = ({ active, total, inactive }) => {
  const maxCount = starlinkGrowthData[starlinkGrowthData.length - 1].count;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-white text-lg">Starlink Constellation</h3>
          <p className="text-xs text-slate-400 mt-0.5">Satellite deployment history & live stats</p>
        </div>
        <TrendingUp className="w-6 h-6 text-blue-400" />
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Active Satellites', value: active || '~10,300', color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10' },
          { label: 'Total Launched', value: total || '~12,000', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
          { label: 'Deorbited', value: inactive || '~1,700', color: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/10' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl p-3 text-center`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Growth Chart */}
      <div className="space-y-2">
        <p className="text-xs text-slate-500 mb-3">Cumulative deployment timeline</p>
        {starlinkGrowthData.map(d => {
          const pct = (d.count / maxCount) * 100;
          return (
            <div key={d.year} className="flex items-center gap-3">
              <span className="text-xs text-slate-500 w-8">{d.year}</span>
              <div className="flex-1 bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-2.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs font-mono text-blue-300 w-16 text-right">{d.count.toLocaleString()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function SpaceXPage() {
  const [starlink, setStarlink] = useState<StarlinkStats | null>(null);
  const [rockets, setRockets] = useState<SpaceXRocket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [starlinkRes, rocketsRes] = await Promise.all([
        apiClient.get('/spacex/starlink'),
        apiClient.get('/spacex/rockets'),
      ]);
      setStarlink(starlinkRes.data);
      setRockets(rocketsRes.data);
    } catch (err) {
      console.error('Failed to fetch SpaceX data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="animate-spin text-blue-500 h-12 w-12" />
      <p className="text-slate-400 text-sm">Loading SpaceX Intelligence...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
            <Rocket className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">SpaceX Intelligence</h1>
            <p className="text-slate-400 mt-1">Real-time data from the SpaceX constellation & fleet</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-sm transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ISS Live Tracker */}
      <ISSTracker />

      {/* Starlink Section */}
      <StarlinkGrowthChart
        active={starlink?.active ?? 0}
        total={starlink?.total ?? 0}
        inactive={starlink?.inactive ?? 0}
      />

      {/* Starship Section */}
      <div className="bg-gradient-to-br from-orange-950/30 to-slate-900 border border-orange-900/40 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-orange-500/20 rounded-xl border border-orange-500/30">
            <Zap className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Starship Development Tracker</h3>
            <p className="text-xs text-slate-400">World's most powerful rocket — development milestones</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { flight: 'IFT-1', date: 'Apr 20, 2023', outcome: 'Partial', desc: 'First integrated flight test. Both stages exploded.', color: 'text-yellow-400', dot: 'bg-yellow-400' },
            { flight: 'IFT-2', date: 'Nov 18, 2023', outcome: 'Partial', desc: 'Stage separation achieved. Ship lost during reentry.', color: 'text-yellow-400', dot: 'bg-yellow-400' },
            { flight: 'IFT-3', date: 'Mar 14, 2024', outcome: 'Partial', desc: 'Reentry survived. Both vehicles lost on descent.', color: 'text-amber-400', dot: 'bg-amber-400' },
            { flight: 'IFT-4', date: 'Jun 6, 2024', outcome: 'Success', desc: 'Booster caught by mechazilla arms. Ship splashdown.', color: 'text-emerald-400', dot: 'bg-emerald-400' },
            { flight: 'IFT-5', date: 'Oct 13, 2024', outcome: 'Success', desc: 'Booster catch confirmed. Ship reentry & splashdown.', color: 'text-emerald-400', dot: 'bg-emerald-400' },
            { flight: 'IFT-6', date: 'Nov 19, 2024', outcome: 'Success', desc: 'Payload door test. Satellite deployment simulation.', color: 'text-emerald-400', dot: 'bg-emerald-400' },
            { flight: 'IFT-7+', date: '2025–2026', outcome: 'Ongoing', desc: 'Full payload deployment & crew capability testing.', color: 'text-blue-400', dot: 'bg-blue-400' },
          ].map(item => (
            <div key={item.flight} className="flex items-start gap-4 p-3 bg-slate-800/40 rounded-xl border border-slate-700/30 hover:border-orange-800/40 transition-colors">
              <div className={`w-2 h-2 rounded-full ${item.dot} mt-1.5 flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white text-sm">{item.flight}</span>
                  <span className="text-xs text-slate-500">{item.date}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 ${item.color}`}>{item.outcome}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rocket Fleet */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-5 flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-400" />
          Active Fleet
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rockets.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500">
              <Rocket className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No rocket data available.</p>
            </div>
          ) : rockets.map(rocket => (
            <div key={rocket.id} className="bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-2xl p-6 transition-all hover:-translate-y-0.5 group">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">{rocket.name}</h3>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${rocket.active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-400 border border-slate-600'}`}>
                  {rocket.active ? '● Active' : '○ Retired'}
                </span>
              </div>
              <p className="text-sm text-slate-500 mb-4 line-clamp-2">{rocket.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Success Rate</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-800 rounded-full h-1.5">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${rocket.success_rate_pct}%` }} />
                    </div>
                    <span className="font-bold text-emerald-400 text-xs">{rocket.success_rate_pct}%</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">First Flight</span>
                  <span className="font-medium text-slate-300">{rocket.first_flight}</span>
                </div>
                {rocket.cost_per_launch > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Cost / Launch</span>
                    <span className="font-medium text-amber-400">${(rocket.cost_per_launch / 1_000_000).toFixed(1)}M</span>
                  </div>
                )}
                {rocket.height_m > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Height</span>
                    <span className="font-medium text-slate-300">{rocket.height_m} m</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
