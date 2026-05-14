import React, { useEffect, useState } from 'react';
import { CloudLightning, RefreshCw, Zap, Wind, Compass, Image as ImageIcon, Orbit } from 'lucide-react';
import apiClient from '../api/client';

interface WeatherSnapshot {
  id: number;
  kp_index: number;
  solar_wind_speed: number;
  solar_wind_density: number;
  bz_component: number;
  x_ray_flux: number;
  storm_level: string;
  aurora_visibility: string;
  ai_summary: string;
  fetched_at: string;
}

function kpColor(kp: number): string {
  if (kp < 4) return 'text-emerald-400';
  if (kp < 5) return 'text-yellow-400';
  if (kp < 6) return 'text-orange-400';
  if (kp < 7) return 'text-orange-500';
  return 'text-red-400';
}

function kpBg(kp: number): string {
  if (kp < 4) return 'border-emerald-500/30 bg-emerald-500/5';
  if (kp < 5) return 'border-yellow-500/30 bg-yellow-500/5';
  if (kp < 6) return 'border-orange-500/30 bg-orange-500/5';
  return 'border-red-500/30 bg-red-500/5';
}

const SpaceWeather: React.FC = () => {
  const [latest, setLatest] = useState<WeatherSnapshot | null>(null);
  const [history, setHistory] = useState<WeatherSnapshot[]>([]);
  const [apod, setApod] = useState<any>(null);
  const [asteroids, setAsteroids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      apiClient.get('/space-weather/latest'),
      apiClient.get('/space-weather/history?limit=12'),
      apiClient.get('/space-weather/apod'),
      apiClient.get('/space-weather/asteroids')
    ])
      .then(([latestRes, historyRes, apodRes, astRes]) => {
        setLatest(latestRes.data?.kp_index !== undefined ? latestRes.data : null);
        setHistory(historyRes.data);
        setApod(apodRes.data);
        setAsteroids(astRes.data?.slice(0, 4) || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await apiClient.post('/space-weather/sync');
      setTimeout(fetchData, 3000);
    } catch (e) { console.error(e); }
    finally { setSyncing(false); }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <CloudLightning className="w-8 h-8 text-fuchsia-400" />
            Space Weather Monitor
          </h1>
          <p className="text-slate-400 mt-1">Real-time NOAA SWPC solar storm & geomagnetic activity data.</p>
        </div>
        <button onClick={handleSync} disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 bg-fuchsia-700 hover:bg-fuchsia-600 text-white rounded-lg transition-colors font-medium disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          Sync NOAA
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-slate-900 rounded-xl border border-slate-800 p-5 animate-pulse h-28" />
          ))}
        </div>
      ) : !latest ? (
        <div className="py-20 text-center text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800">
          <CloudLightning className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>No space weather data yet. Click "Sync NOAA" to fetch from NOAA SWPC.</p>
        </div>
      ) : (
        <>
          {/* KP Index hero */}
          <div className={`rounded-2xl border p-6 flex flex-col md:flex-row gap-6 items-center ${kpBg(latest.kp_index ?? 0)}`}>
            <div className="text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">KP Index</p>
              <p className={`text-7xl font-black ${kpColor(latest.kp_index ?? 0)}`}>
                {latest.kp_index?.toFixed(1) ?? '—'}
              </p>
              <p className="text-sm text-slate-400 mt-1">{latest.storm_level}</p>
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-sm font-semibold text-slate-300">🌌 Aurora Visibility</p>
              <p className="text-sm text-slate-400">{latest.aurora_visibility}</p>
              <p className="text-xs text-slate-600 mt-2">Last updated: {new Date(latest.fetched_at).toLocaleString()}</p>
            </div>
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Wind className="w-5 h-5 text-cyan-400" />, label: 'Solar Wind Speed', value: latest.solar_wind_speed ? `${latest.solar_wind_speed.toFixed(0)} km/s` : '—', color: 'text-cyan-400' },
              { icon: <Zap className="w-5 h-5 text-yellow-400" />, label: 'Wind Density', value: latest.solar_wind_density ? `${latest.solar_wind_density.toFixed(2)} p/cm³` : '—', color: 'text-yellow-400' },
              { icon: <Compass className="w-5 h-5 text-fuchsia-400" />, label: 'Bz Component', value: latest.bz_component ? `${latest.bz_component.toFixed(2)} nT` : '—', color: latest.bz_component && latest.bz_component < 0 ? 'text-red-400' : 'text-emerald-400' },
              { icon: <CloudLightning className="w-5 h-5 text-orange-400" />, label: 'Storm Level', value: latest.storm_level || '—', color: 'text-orange-400' },
            ].map(m => (
              <div key={m.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">{m.icon}<span className="text-xs text-slate-500">{m.label}</span></div>
                <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* KP history chart */}
          {history.length > 1 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 text-slate-200">KP Index History</h2>
              <div className="flex items-end gap-1 h-24">
                {history.slice().reverse().map((snap, i) => {
                  const kp = snap.kp_index ?? 0;
                  const heightPct = Math.min((kp / 9) * 100, 100);
                  return (
                    <div key={i} title={`KP: ${kp.toFixed(1)} — ${new Date(snap.fetched_at).toLocaleTimeString()}`}
                      className="flex-1 rounded-sm transition-all hover:opacity-80 cursor-default"
                      style={{
                        height: `${Math.max(heightPct, 4)}%`,
                        backgroundColor: kp < 4 ? '#10b981' : kp < 6 ? '#f59e0b' : '#ef4444',
                      }}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-slate-600 mt-2">
                <span>Oldest</span><span>Latest</span>
              </div>
            </div>
          )}

          {/* NASA APOD & Asteroids */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {apod && !apod.error && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                <div className="p-4 border-b border-slate-800 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-indigo-400" />
                  <h2 className="font-semibold text-slate-200">Astronomy Picture of the Day</h2>
                </div>
                {apod.media_type === 'image' ? (
                  <img src={apod.url} alt={apod.title} className="w-full h-64 object-cover" />
                ) : (
                  <iframe src={apod.url} title={apod.title} className="w-full h-64" />
                )}
                <div className="p-4">
                  <h3 className="font-bold text-slate-200 mb-2">{apod.title}</h3>
                  <p className="text-sm text-slate-400 line-clamp-3">{apod.explanation}</p>
                </div>
              </div>
            )}

            {asteroids.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
                  <Orbit className="w-5 h-5 text-amber-500" />
                  <h2 className="font-semibold text-slate-200">Near Earth Asteroids (Next 3 Days)</h2>
                </div>
                <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                  {asteroids.map((ast: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                      <div>
                        <p className="font-medium text-slate-200">{ast.name}</p>
                        <p className="text-xs text-slate-400 mt-1">Approach: {ast.close_approach_date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-rose-400">{ast.miss_distance_km} km</p>
                        {ast.is_hazardous && <span className="text-[10px] uppercase bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full mt-1 inline-block">Hazardous</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SpaceWeather;
