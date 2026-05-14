import React, { useEffect, useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { ShieldCheck, LogOut, StickyNote, Plus, Rocket, Wifi, WifiOff } from 'lucide-react';
import { useAuthStore } from '../store/useStore';
import apiClient from '../api/client';

interface Note {
  id: number;
  title: string;
  content: string;
  tags: string;
  linked_module: string;
  created_at: string;
}

interface TelemetryData {
  t_time: number;
  altitude_km: number;
  velocity_kmh: number;
  phase: string;
  phase_status: string;
}

const OwnerDashboard: React.FC = () => {
  const { token, username, logout } = useAuthStore();
  const [notes, setNotes] = useState<Note[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', tags: '', linked_module: '' });
  const wsRef = useRef<WebSocket | null>(null);

  const fetchData = () => {
    apiClient.get('/owner/notes').then(res => setNotes(res.data)).catch(console.error);
    apiClient.get('/owner/dashboard').then(res => setDashboard(res.data)).catch(console.error);
  };

  // WebSocket for live telemetry
  useEffect(() => {
    if (!token) return;
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    const wsUrl = baseURL.replace(/^http/, 'ws') + '/launches/live/ws';
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    ws.onopen = () => setWsConnected(true);
    ws.onclose = () => setWsConnected(false);
    ws.onerror = () => setWsConnected(false);
    ws.onmessage = (e) => {
      try { setTelemetry(JSON.parse(e.data)); } catch {}
    };
    return () => ws.close();
  }, [token]);

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  if (!token) return <Navigate to="/login" replace />;

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/owner/notes', newNote);
      setNewNote({ title: '', content: '', tags: '', linked_module: '' });
      setShowNoteForm(false);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleDeleteNote = async (id: number) => {
    try {
      await apiClient.delete(`/owner/notes/${id}`);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const phases = [
    { time: -30, name: 'Terminal Count' },
    { time: 0, name: 'Liftoff' },
    { time: 70, name: 'Max-Q' },
    { time: 140, name: 'MECO' },
    { time: 145, name: 'Stage Sep.' },
    { time: 155, name: 'SES-1' },
    { time: 200, name: 'Fairing Sep.' },
  ];
  const maxTime = 210;
  const progress = telemetry ? Math.max(0, Math.min(((telemetry.t_time + 30) / (maxTime + 30)) * 100, 100)) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-emerald-400" />
          <div>
            <h1 className="text-3xl font-bold text-emerald-400">Owner Intelligence</h1>
            <p className="text-sm text-slate-500">Private module · {username}</p>
          </div>
        </div>
        <button onClick={logout}
          className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg transition-colors">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      {/* Dashboard stats */}
      {dashboard && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">{dashboard.notes_count}</p>
            <p className="text-xs text-slate-500 mt-1">Private Notes</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-orange-400">{dashboard.active_launches}</p>
            <p className="text-xs text-slate-500 mt-1">Active Launches</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{dashboard.upcoming_launches?.length ?? 0}</p>
            <p className="text-xs text-slate-500 mt-1">Upcoming Queued</p>
          </div>
        </div>
      )}

      {/* Live Telemetry */}
      <div className="bg-slate-900 border border-emerald-900/40 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Rocket className="w-5 h-5 text-orange-400" />
            Live Launch Telemetry Simulator
          </h2>
          <div className="flex items-center gap-2 text-sm">
            {wsConnected
              ? <><Wifi className="w-4 h-4 text-emerald-400" /><span className="text-emerald-400">Connected</span></>
              : <><WifiOff className="w-4 h-4 text-slate-500" /><span className="text-slate-500">No feed</span></>
            }
          </div>
        </div>

        {telemetry ? (
          <>
            {/* Phase slider */}
            <div className="mb-5">
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>T{telemetry.t_time < 0 ? '-' : '+'}{Math.abs(telemetry.t_time)}s</span>
                <span className="font-semibold text-emerald-400">{telemetry.phase} — {telemetry.phase_status}</span>
              </div>
              <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {/* Phase markers */}
              <div className="flex justify-between mt-1">
                {phases.map(p => (
                  <div key={p.name} className="text-center">
                    <div className="w-0.5 h-1.5 bg-slate-600 mx-auto" />
                    <span className="text-[9px] text-slate-600 hidden md:block">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Telemetry readings */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Altitude', value: `${telemetry.altitude_km.toFixed(1)} km`, color: 'text-cyan-400' },
                { label: 'Velocity', value: `${telemetry.velocity_kmh.toFixed(0)} km/h`, color: 'text-orange-400' },
                { label: 'Phase', value: telemetry.phase, color: 'text-emerald-400' },
                { label: 'Mission Time', value: `T+${Math.max(0, telemetry.t_time)}s`, color: 'text-blue-400' },
              ].map(r => (
                <div key={r.label} className="bg-slate-800/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500">{r.label}</p>
                  <p className={`text-sm font-bold font-mono mt-1 ${r.color}`}>{r.value}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-600 mt-3 text-center">⚠ Telemetry is simulated via Falcon 9 historical profile</p>
          </>
        ) : (
          <p className="text-slate-500 text-center py-8">Waiting for telemetry stream…</p>
        )}
      </div>

      {/* Upcoming launches */}
      {dashboard?.upcoming_launches?.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-3">Next Launches</h2>
          <div className="space-y-2">
            {dashboard.upcoming_launches.map((l: any) => (
              <div key={l.id} className="flex justify-between items-center py-2 border-b border-slate-800 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-200">{l.name}</p>
                  <p className="text-xs text-slate-500">{l.vehicle} · {l.agency}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-emerald-400">{l.status}</span>
                  <p className="text-xs text-slate-500 mt-0.5">{l.net?.slice(0, 10)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-yellow-400" />
            Private Notes
          </h2>
          <button onClick={() => setShowNoteForm(!showNoteForm)}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> New Note
          </button>
        </div>

        {showNoteForm && (
          <form onSubmit={handleCreateNote} className="mb-5 bg-slate-800/50 rounded-xl p-4 space-y-3 border border-slate-700">
            <input value={newNote.title} onChange={e => setNewNote({ ...newNote, title: e.target.value })}
              placeholder="Note title" required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-emerald-500" />
            <textarea value={newNote.content} onChange={e => setNewNote({ ...newNote, content: e.target.value })}
              placeholder="Note content…" rows={3} required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-emerald-500 resize-none" />
            <div className="flex gap-3">
              <input value={newNote.tags} onChange={e => setNewNote({ ...newNote, tags: e.target.value })}
                placeholder="Tags (comma-separated)"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-emerald-500" />
              <select value={newNote.linked_module} onChange={e => setNewNote({ ...newNote, linked_module: e.target.value })}
                className="bg-slate-950 border border-slate-700 text-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500">
                <option value="">Module (optional)</option>
                {['satellites', 'missions', 'rockets', 'failures', 'launches', 'analytics', 'news', 'space-weather'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg transition-colors">Save Note</button>
              <button type="button" onClick={() => setShowNoteForm(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg transition-colors">Cancel</button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {notes.length === 0 ? (
            <p className="text-slate-500 text-sm col-span-full py-4 text-center">No notes yet. Click "New Note" to create one.</p>
          ) : notes.map(n => (
            <div key={n.id} className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600 transition-all group">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-slate-200 text-sm">{n.title}</h3>
                <button onClick={() => handleDeleteNote(n.id)}
                  className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-xs">✕</button>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{n.content}</p>
              {(n.tags || n.linked_module) && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {n.linked_module && (
                    <span className="px-2 py-0.5 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">{n.linked_module}</span>
                  )}
                  {n.tags && n.tags.split(',').map(t => (
                    <span key={t} className="px-2 py-0.5 text-[10px] bg-slate-700/50 text-slate-400 rounded-md">{t.trim()}</span>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-slate-600 mt-2">{new Date(n.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
