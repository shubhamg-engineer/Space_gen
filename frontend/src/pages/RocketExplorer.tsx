import React, { useEffect, useState } from 'react';
import { Flame, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import apiClient from '../api/client';
import ExplainButton from '../components/ui/ExplainButton';

interface RocketData {
  id: number;
  name: string;
  operator: string;
  country: string;
  height_m: number;
  diameter_m: number;
  mass_kg: number;
  leo_capacity_kg: number;
  gto_capacity_kg: number;
  stages: number;
  reusable: boolean;
  status: string;
  first_flight: string;
  total_launches: number;
  total_successes: number;
  propellant_stage1: string;
  propellant_stage2: string;
  engine_stage1: string;
  engine_stage2: string;
  thrust_kn: number;
  isp_vacuum_s: number;
  description: string;
}

const statusColor: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  retired: 'bg-slate-700/50 text-slate-400 border-slate-600',
  development: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

function successRate(total: number, success: number): number {
  if (!total) return 0;
  return Math.round((success / total) * 100);
}

const RocketCard: React.FC<{ rocket: RocketData }> = ({ rocket }) => {
  const [expanded, setExpanded] = useState(false);
  const rate = successRate(rocket.total_launches, rocket.total_successes);

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 hover:border-orange-500/30 transition-all group">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-bold text-orange-400 group-hover:text-orange-300">{rocket.name}</h3>
            <p className="text-sm text-slate-500">{rocket.operator} · {rocket.country}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`px-2 py-0.5 text-xs rounded-md border ${statusColor[rocket.status?.toLowerCase()] ?? 'bg-slate-700 text-slate-400 border-slate-600'}`}>
              {rocket.status}
            </span>
            {rocket.reusable && (
              <span className="px-2 py-0.5 text-xs rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">♻ Reusable</span>
            )}
          </div>
        </div>

        {/* Key specs row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Height', value: rocket.height_m ? `${rocket.height_m}m` : '—' },
            { label: 'LEO Cap.', value: rocket.leo_capacity_kg ? `${(rocket.leo_capacity_kg / 1000).toFixed(1)}t` : '—' },
            { label: 'Thrust', value: rocket.thrust_kn ? `${rocket.thrust_kn.toLocaleString()} kN` : '—' },
          ].map(s => (
            <div key={s.label} className="bg-slate-800/50 rounded-lg p-2 text-center">
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className="text-sm font-semibold text-slate-200 mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Success rate bar */}
        {rocket.total_launches > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Success Rate</span>
              <span className="font-mono text-slate-300">{rate}% ({rocket.total_successes}/{rocket.total_launches})</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${rate >= 90 ? 'bg-emerald-500' : rate >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${rate}%` }}
              />
            </div>
          </div>
        )}

        {/* Description */}
        {rocket.description && (
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{rocket.description}</p>
        )}

        {/* Expand button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 w-full flex items-center justify-center gap-1 text-xs text-slate-500 hover:text-orange-400 transition-colors py-1"
        >
          {expanded ? <><ChevronUp className="w-3 h-3" /> Less details</> : <><ChevronDown className="w-3 h-3" /> More details</>}
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-slate-800 p-5 space-y-2 text-sm bg-slate-950/50">
          {[
            { label: 'First Flight', value: rocket.first_flight },
            { label: 'Stages', value: rocket.stages },
            { label: 'Mass', value: rocket.mass_kg ? `${(rocket.mass_kg / 1000).toFixed(0)} tonnes` : '—' },
            { label: 'GTO Capacity', value: rocket.gto_capacity_kg ? `${(rocket.gto_capacity_kg / 1000).toFixed(1)} t` : '—' },
            { label: 'Stage 1 Engine', value: rocket.engine_stage1 },
            { label: 'Stage 2 Engine', value: rocket.engine_stage2 },
            { label: 'Propellant S1', value: rocket.propellant_stage1 },
            { label: 'Propellant S2', value: rocket.propellant_stage2 },
            { label: 'Isp (vacuum)', value: rocket.isp_vacuum_s ? `${rocket.isp_vacuum_s}s` : '—' },
          ].filter(r => r.value).map(r => (
            <div key={r.label} className="flex justify-between border-b border-slate-800 pb-1.5 last:border-0">
              <span className="text-slate-500">{r.label}</span>
              <span className="text-slate-300 font-mono text-xs text-right">{r.value}</span>
            </div>
          ))}
          <ExplainButton 
            topic={`Rocket: ${rocket.name}`} 
            context={`Operator: ${rocket.operator}. Propellant: ${rocket.propellant_stage1}. LEO Capacity: ${rocket.leo_capacity_kg} kg.`}
          />
        </div>
      )}
    </div>
  );
};

const RocketExplorer: React.FC = () => {
  const [rockets, setRockets] = useState<RocketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchRockets = () => {
    setLoading(true);
    apiClient.get('/rockets/?limit=50')
      .then(res => setRockets(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRockets(); }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await apiClient.post('/rockets/seed');
      fetchRockets();
    } catch (e) { console.error(e); }
    finally { setSeeding(false); }
  };

  const filtered = filterStatus
    ? rockets.filter(r => r.status?.toLowerCase() === filterStatus.toLowerCase())
    : rockets;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Flame className="w-8 h-8 text-orange-400" />
            Rocket Systems Explorer
          </h1>
          <p className="text-slate-400 mt-1">Full technical specifications for orbital launch vehicles.</p>
        </div>
        <div className="flex gap-3">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-3 py-2 text-sm outline-none">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="retired">Retired</option>
            <option value="development">Development</option>
          </select>
          {rockets.length === 0 && (
            <button onClick={handleSeed} disabled={seeding}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors font-medium disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
              Seed Data
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-slate-900 rounded-xl border border-slate-800 p-5 animate-pulse h-60" />
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800">
            <p>No rockets found. Click "Seed Data" to populate with curated rocket data.</p>
          </div>
        ) : filtered.map(r => (
          <RocketCard key={r.id} rocket={r} />
        ))}
      </div>
    </div>
  );
};

export default RocketExplorer;
