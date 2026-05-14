import React, { useEffect, useState } from 'react';
import { FileWarning, RefreshCw, Zap, AlertTriangle, XCircle } from 'lucide-react';
import apiClient from '../api/client';
import ExplainButton from '../components/ui/ExplainButton';

interface FailureData {
  id: number;
  mission_name: string;
  date: string;
  agency: string;
  vehicle: string;
  failure_phase: string;
  primary_cause: string;
  root_cause_category: string;
  failure_mode_detail: string;
  outcome: string;
  crew_involved: boolean;
  severity: string;
  lessons_learned: string;
}

const severityConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  catastrophic: { color: 'border-red-500/50 bg-red-950/20', icon: <XCircle className="w-4 h-4 text-red-500" />, label: 'Catastrophic' },
  major: { color: 'border-orange-500/50 bg-orange-950/10', icon: <AlertTriangle className="w-4 h-4 text-orange-400" />, label: 'Major' },
  minor: { color: 'border-yellow-500/50 bg-yellow-950/10', icon: <Zap className="w-4 h-4 text-yellow-400" />, label: 'Minor' },
};

const causeColors: Record<string, string> = {
  software: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  structural: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  propulsion: 'bg-red-500/20 text-red-400 border-red-500/30',
  human_error: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  thermal: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

const phaseColors: Record<string, string> = {
  pad: 'text-slate-400',
  ascent: 'text-orange-400',
  separation: 'text-yellow-400',
  orbit: 'text-blue-400',
  're-entry': 'text-red-400',
};

const FailureIntelligence: React.FC = () => {
  const [failures, setFailures] = useState<FailureData[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterCause, setFilterCause] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  const fetchFailures = () => {
    setLoading(true);
    apiClient.get('/failures/?limit=50')
      .then(res => setFailures(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchFailures(); }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await apiClient.post('/failures/seed');
      fetchFailures();
    } catch (e) { console.error(e); }
    finally { setSeeding(false); }
  };

  const filtered = failures
    .filter(f => !filterSeverity || f.severity === filterSeverity)
    .filter(f => !filterCause || f.root_cause_category === filterCause);

  const stats = {
    total: failures.length,
    catastrophic: failures.filter(f => f.severity === 'catastrophic').length,
    crewLoss: failures.filter(f => f.outcome === 'crew_lost').length,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileWarning className="w-8 h-8 text-red-400" />
            Failure Intelligence Engine
          </h1>
          <p className="text-slate-400 mt-1">Historical space mission failures with root cause analysis.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-3 py-2 text-sm outline-none">
            <option value="">All Severity</option>
            <option value="catastrophic">Catastrophic</option>
            <option value="major">Major</option>
            <option value="minor">Minor</option>
          </select>
          <select value={filterCause} onChange={e => setFilterCause(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-3 py-2 text-sm outline-none">
            <option value="">All Causes</option>
            <option value="software">Software</option>
            <option value="structural">Structural</option>
            <option value="propulsion">Propulsion</option>
            <option value="human_error">Human Error</option>
          </select>
          {failures.length === 0 && (
            <button onClick={handleSeed} disabled={seeding}
              className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg transition-colors font-medium disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
              Seed Data
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-slate-200">{stats.total}</p>
          <p className="text-xs text-slate-500 mt-1">Total Failures</p>
        </div>
        <div className="bg-slate-900 border border-red-900/30 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{stats.catastrophic}</p>
          <p className="text-xs text-slate-500 mt-1">Catastrophic</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-orange-400">{stats.crewLoss}</p>
          <p className="text-xs text-slate-500 mt-1">Crew Losses</p>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-slate-900 rounded-xl border border-slate-800 p-5 animate-pulse h-32" />
          ))
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800">
            <p>No failures found. Click "Seed Data" to load historical failures.</p>
          </div>
        ) : filtered.map(f => {
          const sev = severityConfig[f.severity] ?? { color: 'border-slate-700', icon: null, label: f.severity };
          const isExpanded = expanded === f.id;
          return (
            <div key={f.id} className={`rounded-xl border p-5 transition-all ${sev.color}`}>
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {sev.icon}
                    <h3 className="text-lg font-bold text-slate-100">{f.mission_name}</h3>
                    {f.crew_involved && (
                      <span className="px-2 py-0.5 text-xs bg-red-500/30 text-red-300 border border-red-500/30 rounded-md">Crew Involved</span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-400 mb-3">
                    <span>{f.date}</span>
                    <span>{f.agency}</span>
                    <span>{f.vehicle}</span>
                    <span className={`font-medium ${phaseColors[f.failure_phase] ?? 'text-slate-400'}`}>Phase: {f.failure_phase}</span>
                  </div>

                  <p className="text-sm text-slate-300"><span className="font-semibold text-slate-200">Cause: </span>{f.primary_cause}</p>
                </div>

                <div className="flex gap-2 items-start flex-shrink-0">
                  {f.root_cause_category && (
                    <span className={`px-2 py-1 text-xs rounded-md border ${causeColors[f.root_cause_category] ?? 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                      {f.root_cause_category.replace('_', ' ')}
                    </span>
                  )}
                  <button
                    onClick={() => setExpanded(isExpanded ? null : f.id)}
                    className="px-3 py-1 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
                  >
                    {isExpanded ? 'Less' : 'Details'}
                  </button>
                </div>
              </div>

              {/* Expanded */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-3">
                  {f.failure_mode_detail && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Failure Mode Detail</p>
                      <p className="text-sm text-slate-300 leading-relaxed">{f.failure_mode_detail}</p>
                    </div>
                  )}
                  {f.lessons_learned && (
                    <div>
                      <p className="text-xs font-semibold text-emerald-500 mb-1 uppercase tracking-wider">Lessons Learned</p>
                      <p className="text-sm text-slate-300 leading-relaxed">{f.lessons_learned}</p>
                    </div>
                  )}
                  <ExplainButton 
                    topic={`Spaceflight Failure: ${f.mission_name} (${f.vehicle})`} 
                    context={`Phase: ${f.failure_phase}. Cause: ${f.primary_cause}. Mode: ${f.failure_mode_detail || 'Unknown'}`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FailureIntelligence;
