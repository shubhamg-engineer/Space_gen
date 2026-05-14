import React, { useEffect, useState } from 'react';
import { Users, RefreshCw, Globe } from 'lucide-react';
import apiClient from '../api/client';

interface Astronaut {
  id: number;
  name: string;
  nationality: string;
  agency: string;
  status: string;
  total_missions: number;
  total_time_in_space_hours: number;
  current_location: string;
  bio: string;
}

interface InSpaceData {
  count: number;
  people: Array<{ name: string; craft: string }>;
  source: string;
}

const AstronautModule: React.FC = () => {
  const [astronauts, setAstronauts] = useState<Astronaut[]>([]);
  const [inSpace, setInSpace] = useState<InSpaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      apiClient.get('/astronauts/?limit=50'),
      apiClient.get('/astronauts/in-space'),
    ])
      .then(([astRes, inSpaceRes]) => {
        setAstronauts(astRes.data);
        setInSpace(inSpaceRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await apiClient.post('/astronauts/sync');
      setTimeout(fetchData, 2000);
    } catch (e) { console.error(e); }
    finally { setSyncing(false); }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="w-8 h-8 text-violet-400" />
            Astronaut Intelligence
          </h1>
          <p className="text-slate-400 mt-1">Current crew in space and astronaut database.</p>
        </div>
        <button onClick={handleSync} disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 bg-violet-700 hover:bg-violet-600 text-white rounded-lg transition-colors font-medium disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          Sync Live Crew
        </button>
      </div>

      {/* Currently in space */}
      {inSpace && (
        <div className="bg-gradient-to-r from-violet-950/30 to-indigo-950/30 border border-violet-900/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-6 h-6 text-violet-400" />
            <h2 className="text-xl font-semibold">Currently in Space</h2>
            <span className="px-2 py-0.5 text-lg font-bold text-violet-300 bg-violet-500/20 rounded-md">{inSpace.count}</span>
            <span className="text-xs text-slate-500">people</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {inSpace.people.map((p, i) => (
              <div key={i} className="bg-slate-900/60 border border-violet-900/20 rounded-xl p-3 text-center">
                <div className="w-10 h-10 bg-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg">👨‍🚀</span>
                </div>
                <p className="text-sm font-semibold text-slate-200">{p.name}</p>
                <p className="text-xs text-violet-400 mt-0.5">{p.craft}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-600 mt-3">Source: {inSpace.source}</p>
        </div>
      )}

      {/* Astronaut DB */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Astronaut Database</h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-slate-900 rounded-xl border border-slate-800 p-5 animate-pulse h-36" />
            ))}
          </div>
        ) : astronauts.length === 0 ? (
          <div className="py-16 text-center text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No astronauts in database yet.</p>
            <p className="text-sm mt-1">Click "Sync Live Crew" to pull current crew from Launch Library 2.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {astronauts.map(a => (
              <div key={a.id} className="bg-slate-900 border border-slate-800 hover:border-violet-500/30 rounded-xl p-5 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-100">{a.name}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{a.agency ?? 'Unknown Agency'} · {a.nationality}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded-md border ${
                    a.status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-700/50 text-slate-400 border-slate-700'
                  }`}>
                    {a.status ?? 'unknown'}
                  </span>
                </div>
                {a.current_location && (
                  <div className="flex items-center gap-1.5 text-xs text-violet-400 mb-3">
                    <Globe className="w-3 h-3" />
                    {a.current_location}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  {a.total_missions > 0 && (
                    <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-500">Missions</p>
                      <p className="text-sm font-bold text-slate-200">{a.total_missions}</p>
                    </div>
                  )}
                  {a.total_time_in_space_hours > 0 && (
                    <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-500">Hours in Space</p>
                      <p className="text-sm font-bold text-slate-200">{a.total_time_in_space_hours.toFixed(0)}</p>
                    </div>
                  )}
                </div>
                {a.bio && (
                  <p className="text-xs text-slate-500 mt-3 line-clamp-2 leading-relaxed">{a.bio}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AstronautModule;
