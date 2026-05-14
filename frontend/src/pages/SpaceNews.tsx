import React, { useEffect, useState } from 'react';
import { Newspaper, RefreshCw, ExternalLink } from 'lucide-react';
import apiClient from '../api/client';

interface Article {
  id: number;
  title: string;
  url: string;
  source: string;
  published_at: string;
  summary: string;
  image_url: string;
  category: string;
}

const categoryColors: Record<string, string> = {
  'Launch News': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Science Discovery': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'Commercial Space': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Policy & Funding': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Failure & Anomaly': 'bg-red-500/20 text-red-400 border-red-500/30',
  'Mission Update': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};

const SpaceNews: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [digest, setDigest] = useState('');
  const [filterCat, setFilterCat] = useState('');

  const fetchArticles = () => {
    setLoading(true);
    apiClient.get('/news/?limit=30')
      .then(res => setArticles(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const fetchDigest = () => {
    apiClient.get('/news/digest')
      .then(res => setDigest(res.data.digest))
      .catch(console.error);
  };

  useEffect(() => {
    fetchArticles();
    fetchDigest();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await apiClient.post('/news/sync');
      setTimeout(() => { fetchArticles(); fetchDigest(); }, 3000);
    } catch (e) { console.error(e); }
    finally { setSyncing(false); }
  };

  const filtered = filterCat ? articles.filter(a => a.category === filterCat) : articles;
  const categories = [...new Set(articles.map(a => a.category).filter(Boolean))];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Newspaper className="w-8 h-8 text-yellow-400" />
            Space News
          </h1>
          <p className="text-slate-400 mt-1">AI-summarised spaceflight news from around the galaxy.</p>
        </div>
        <div className="flex gap-3">
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-3 py-2 text-sm outline-none">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={handleSync} disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition-colors font-medium disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            Sync News
          </button>
        </div>
      </div>

      {/* AI Digest */}
      {digest && (
        <div className="bg-gradient-to-r from-yellow-950/30 to-amber-950/30 border border-yellow-900/30 rounded-xl p-5">
          <p className="text-xs font-semibold text-yellow-500 uppercase tracking-wider mb-2">🤖 Today in Space — AI Digest</p>
          <p className="text-sm text-slate-300 leading-relaxed">{digest}</p>
        </div>
      )}

      {/* Articles grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading ? (
          Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bg-slate-900 rounded-xl border border-slate-800 p-5 animate-pulse h-52" />
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800">
            <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No articles yet. Click "Sync News" to fetch from Spaceflight News API.</p>
          </div>
        ) : filtered.map(a => (
          <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer"
            className="group bg-slate-900 rounded-xl border border-slate-800 hover:border-yellow-500/30 overflow-hidden transition-all hover:-translate-y-0.5 flex flex-col">
            {a.image_url && (
              <div className="h-40 overflow-hidden bg-slate-800">
                <img src={a.image_url} alt={a.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}
            <div className="p-4 flex flex-col flex-1">
              <div className="flex justify-between items-start gap-2 mb-2">
                {a.category && (
                  <span className={`px-2 py-0.5 text-[10px] rounded-md border flex-shrink-0 ${categoryColors[a.category] ?? 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                    {a.category}
                  </span>
                )}
                <span className="text-[10px] text-slate-600 ml-auto">{a.published_at?.slice(0, 10)}</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-100 group-hover:text-yellow-300 transition-colors mb-2 leading-snug line-clamp-2">
                {a.title}
              </h3>
              {a.summary && (
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 flex-1">{a.summary}</p>
              )}
              <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-800">
                <span className="text-[10px] text-slate-600">{a.source}</span>
                <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-yellow-400 transition-colors" />
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default SpaceNews;
