import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Satellite, Info, RefreshCw, Search, Filter, Globe, Activity, Layers, Zap } from 'lucide-react';
import ExplainButton from '../components/ui/ExplainButton';
import Earth3D from '../components/Earth3D';

interface SatelliteData {
  id: number;
  norad_id: number;
  name: string;
  status: string;
  orbit_type: string;
  tle_line1: string;
  tle_line2: string;
}

const orbitColors: Record<string, string> = {
  LEO: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  MEO: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  GEO: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  HEO: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  SSO: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};

const SatelliteDashboard: React.FC = () => {
  const [satellites, setSatellites] = useState<SatelliteData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [ingesting, setIngesting] = useState<boolean>(false);
  const [search, setSearch] = useState('');
  const [orbitFilter, setOrbitFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchSatellites = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/v1/satellites/?limit=100');
      setSatellites(response.data);
    } catch (error) {
      console.error('Failed to fetch satellites', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSatellites(); }, []);

  const handleIngest = async () => {
    setIngesting(true);
    try {
      await axios.post('http://localhost:8000/api/v1/satellites/ingest');
      alert('Ingestion started. Please refresh after a minute.');
    } catch (error) {
      console.error('Failed to ingest', error);
    } finally {
      setIngesting(false);
    }
  };

  const filtered = useMemo(() => {
    return satellites.filter(s => {
      const matchesSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || String(s.norad_id).includes(search);
      const matchesOrbit = !orbitFilter || (s.orbit_type || '').toUpperCase().includes(orbitFilter.toUpperCase());
      const matchesStatus = !statusFilter || (s.status || 'Active').toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesOrbit && matchesStatus;
    });
  }, [satellites, search, orbitFilter, statusFilter]);

  // Analytics
  const orbitCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    satellites.forEach(s => {
      const orbit = (s.orbit_type || 'Unknown').toUpperCase().split(' ')[0];
      counts[orbit] = (counts[orbit] || 0) + 1;
    });
    return counts;
  }, [satellites]);

  const activeCount = satellites.filter(s => !s.status || s.status.toLowerCase() === 'active').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Satellite className="w-8 h-8 text-emerald-400" />
            Satellite Intelligence
          </h1>
          <p className="text-slate-400 mt-1">Real-time tracking and intelligence for Earth orbit satellites.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchSatellites}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleIngest}
            disabled={ingesting}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors font-medium text-white disabled:opacity-50 text-sm"
          >
            <Zap className="w-4 h-4" />
            Ingest TLEs
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-900/20 border border-blue-800/50 rounded-xl p-4 flex gap-4 items-start">
        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <p className="text-blue-100/80 text-sm leading-relaxed">
          As of early 2026, approximately <strong className="text-blue-300">14,500–15,600 active satellites</strong> orbit Earth. The SpaceX Starlink constellation alone accounts for <strong className="text-blue-300">7,400–10,300</strong> of those, dominating low Earth orbit.
        </p>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Tracked', value: satellites.length, icon: <Satellite className="w-5 h-5" />, color: 'text-emerald-400', bg: 'from-emerald-500/10 to-emerald-500/5', border: 'border-emerald-500/20' },
          { label: 'Active', value: activeCount, icon: <Activity className="w-5 h-5" />, color: 'text-blue-400', bg: 'from-blue-500/10 to-blue-500/5', border: 'border-blue-500/20' },
          { label: 'Orbit Types', value: Object.keys(orbitCounts).length, icon: <Globe className="w-5 h-5" />, color: 'text-purple-400', bg: 'from-purple-500/10 to-purple-500/5', border: 'border-purple-500/20' },
          { label: 'Filtered Results', value: filtered.length, icon: <Filter className="w-5 h-5" />, color: 'text-amber-400', bg: 'from-amber-500/10 to-amber-500/5', border: 'border-amber-500/20' },
        ].map(s => (
          <div key={s.label} className={`bg-gradient-to-br ${s.bg} border ${s.border} rounded-xl p-4 flex items-center gap-4`}>
            <div className={`${s.color} opacity-80`}>{s.icon}</div>
            <div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Orbit Distribution */}
      {Object.keys(orbitCounts).length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4" /> Orbit Distribution
          </h3>
          <div className="space-y-2">
            {Object.entries(orbitCounts).sort((a, b) => b[1] - a[1]).map(([orbit, count]) => {
              const pct = Math.round((count / satellites.length) * 100);
              const colorClass = orbitColors[orbit] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
              const barColor = orbit === 'LEO' ? 'bg-emerald-500' : orbit === 'MEO' ? 'bg-blue-500' : orbit === 'GEO' ? 'bg-purple-500' : 'bg-amber-500';
              return (
                <div key={orbit} className="flex items-center gap-3">
                  <span className={`text-xs font-mono px-2 py-0.5 rounded border ${colorClass} w-14 text-center`}>{orbit}</span>
                  <div className="flex-1 bg-slate-800 rounded-full h-2">
                    <div className={`${barColor} h-2 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-slate-500 w-20 text-right">{count} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3D Earth */}
      <div className="mb-2">
        <Earth3D />
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name or NORAD ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500/70 transition-colors"
          />
        </div>
        <select
          value={orbitFilter}
          onChange={e => setOrbitFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-500/70"
        >
          <option value="">All Orbits</option>
          <option value="LEO">LEO</option>
          <option value="MEO">MEO</option>
          <option value="GEO">GEO</option>
          <option value="HEO">HEO</option>
          <option value="SSO">SSO</option>
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-500/70"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="deorbited">Deorbited</option>
        </select>
        <div className="flex gap-1 bg-slate-900 border border-slate-700 rounded-xl p-1">
          <button onClick={() => setViewMode('grid')} className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${viewMode === 'grid' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Grid</button>
          <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${viewMode === 'list' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>List</button>
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-slate-500">
        Showing <span className="text-emerald-400 font-semibold">{filtered.length}</span> of <span className="text-slate-300 font-semibold">{satellites.length}</span> satellites
        {(search || orbitFilter || statusFilter) && ' (filtered)'}
      </p>

      {/* Satellite Cards */}
      {loading ? (
        <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-slate-900 rounded-xl border border-slate-800 p-5 animate-pulse h-52" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800">
          <Satellite className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No satellites match your search.</p>
          <p className="text-sm mt-1">Try adjusting your filters or click "Ingest TLEs" to populate the database.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((sat) => (
            <div key={sat.norad_id} className="bg-slate-900 rounded-xl border border-slate-800 p-5 hover:border-emerald-500/50 transition-all hover:-translate-y-0.5 group flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-base font-semibold group-hover:text-emerald-400 transition-colors leading-snug flex-1 pr-2">{sat.name}</h3>
                <span className={`px-2 py-0.5 text-xs rounded border flex-shrink-0 ${orbitColors[sat.orbit_type?.toUpperCase().split(' ')[0] || ''] || 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                  {sat.status || 'Active'}
                </span>
              </div>
              <div className="space-y-2 text-sm flex-1">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-500">NORAD ID</span>
                  <span className="font-mono text-slate-300">{sat.norad_id}</span>
                </div>
                {sat.orbit_type && (
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-500">Orbit</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded border ${orbitColors[sat.orbit_type.toUpperCase().split(' ')[0]] || 'bg-slate-700 text-slate-400 border-slate-600'}`}>{sat.orbit_type}</span>
                  </div>
                )}
                {sat.tle_line1 && (
                  <div className="pt-1">
                    <span className="text-slate-500 block mb-1 text-xs">TLE Data</span>
                    <div className="bg-slate-950 p-2 rounded text-xs font-mono text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap">
                      {sat.tle_line1}<br />
                      {sat.tle_line2}
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800">
                <ExplainButton
                  topic={`Satellite: ${sat.name}`}
                  context={`NORAD ID: ${sat.norad_id}. Orbit: ${sat.orbit_type}.`}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">NORAD ID</th>
                <th className="text-left px-4 py-3">Orbit</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">AI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map(sat => (
                <tr key={sat.norad_id} className="hover:bg-slate-800/50 transition-colors group">
                  <td className="px-4 py-3 font-medium group-hover:text-emerald-400 transition-colors">{sat.name}</td>
                  <td className="px-4 py-3 font-mono text-slate-400">{sat.norad_id}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-1.5 py-0.5 rounded border ${orbitColors[sat.orbit_type?.toUpperCase().split(' ')[0] || ''] || 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                      {sat.orbit_type || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                      {sat.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ExplainButton topic={`Satellite: ${sat.name}`} context={`NORAD ID: ${sat.norad_id}. Orbit: ${sat.orbit_type}.`} compact />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SatelliteDashboard;
