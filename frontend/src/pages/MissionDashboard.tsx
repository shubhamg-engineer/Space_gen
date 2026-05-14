import React, { useEffect, useState } from 'react';
import { Rocket, RefreshCw, ExternalLink, Clock, Globe } from 'lucide-react';
import apiClient from '../api/client';

interface LaunchData {
  id: number;
  name: string;
  vehicle: string;
  agency: string;
  net: string;
  status_abbrev: string;
  status_name: string;
  mission_type: string;
  orbit: string;
  launch_site: string;
  webcast_url: string;
  image_url: string;
  mission_description: string;
}

const statusColors: Record<string, string> = {
  Go: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  TBD: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  TBC: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Success: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Failure: 'bg-red-500/20 text-red-400 border-red-500/30',
  InFlight: 'bg-orange-500/20 text-orange-400 border-orange-500/30 animate-pulse',
};

function formatCountdown(netStr: string): string {
  if (!netStr) return 'TBD';
  const now = new Date();
  const net = new Date(netStr);
  const diff = net.getTime() - now.getTime();
  if (diff <= 0) return 'Past';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `T- ${days}d ${hours}h`;
  if (hours > 0) return `T- ${hours}h ${mins}m`;
  return `T- ${mins}m`;
}

const MissionDashboard: React.FC = () => {
  const [launches, setLaunches] = useState<LaunchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filter, setFilter] = useState<string>('');

  const fetchLaunches = () => {
    setLoading(true);
    apiClient.get('/launches/?limit=100')
      .then(res => setLaunches(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLaunches(); }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await apiClient.post('/launches/sync');
      setTimeout(fetchLaunches, 2000);
    } catch (e) { console.error(e); }
    finally { setSyncing(false); }
  };

  const filtered = filter
    ? launches.filter(l => l.status_abbrev?.toLowerCase() === filter.toLowerCase())
    : launches;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Rocket className="w-8 h-8 text-blue-400" />
            Mission Intelligence
          </h1>
          <p className="text-slate-400 mt-1">Live launch tracker — upcoming & recent missions.</p>
        </div>
        <div className="flex gap-3">
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="Go">GO</option>
            <option value="TBD">TBD</option>
            <option value="Success">Success</option>
            <option value="Failure">Failure</option>
          </select>
          <button onClick={handleSync} disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            Sync LL2
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Launches', value: launches.length, color: 'text-slate-200' },
          { label: 'GO for Launch', value: launches.filter(l => l.status_abbrev === 'Go').length, color: 'text-emerald-400' },
          { label: 'TBD', value: launches.filter(l => l.status_abbrev === 'TBD' || l.status_abbrev === 'TBC').length, color: 'text-yellow-400' },
          { label: 'Success', value: launches.filter(l => l.status_abbrev === 'Success').length, color: 'text-blue-400' },
        ].map(s => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Launch cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-slate-900 rounded-xl border border-slate-800 p-5 animate-pulse h-52" />
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800">
            <p>No launches found. Click "Sync LL2" to fetch from Launch Library 2.</p>
          </div>
        ) : filtered.map(l => (
          <div key={l.id} className="bg-slate-900 rounded-xl border border-slate-800 p-5 hover:border-blue-500/40 transition-all group flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-slate-100 group-hover:text-blue-300 transition-colors leading-tight flex-1 pr-2">
                {l.name}
              </h3>
              <span className={`px-2 py-0.5 text-xs rounded-md border flex-shrink-0 ${statusColors[l.status_abbrev] ?? 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                {l.status_abbrev}
              </span>
            </div>

            {/* Details */}
            <div className="space-y-1.5 text-sm flex-1">
              {l.vehicle && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Vehicle</span>
                  <span className="text-slate-300 font-mono text-xs">{l.vehicle}</span>
                </div>
              )}
              {l.agency && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Agency</span>
                  <span className="text-slate-300">{l.agency}</span>
                </div>
              )}
              {l.orbit && (
                <div className="flex justify-between">
                  <span className="text-slate-500 flex items-center gap-1"><Globe className="w-3 h-3" />Orbit</span>
                  <span className="text-slate-300">{l.orbit}</span>
                </div>
              )}
              {l.launch_site && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Site</span>
                  <span className="text-slate-400 text-xs text-right max-w-[150px] leading-tight">{l.launch_site}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-1 text-sm">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span className={`font-mono font-semibold ${l.status_abbrev === 'Go' ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {formatCountdown(l.net)}
                </span>
              </div>
              <div className="flex gap-3">
                {l.status_abbrev === 'Failure' && l.image_url && (
                  <a href={l.image_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors">
                    Failure Image <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {l.webcast_url && (
                  <a href={l.webcast_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                    Webcast <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MissionDashboard;
