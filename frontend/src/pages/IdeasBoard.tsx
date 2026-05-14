import React, { useEffect, useState } from 'react';
import { Lightbulb, Plus, ThumbsUp } from 'lucide-react';
import apiClient from '../api/client';

interface Idea {
  id: number;
  title: string;
  description: string;
  category: string;
  vote_count: number;
  status: string;
  owner_comment: string;
}

const categories = ['Visualization', 'Failure Analysis', 'New Rocket', 'UI/UX', 'Data Source', 'Feature Request', 'Bug Report'];

const categoryColors: Record<string, string> = {
  'Visualization': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Failure Analysis': 'bg-red-500/10 text-red-400 border-red-500/20',
  'New Rocket': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'UI/UX': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Data Source': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Feature Request': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Bug Report': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
};

const IdeasBoard: React.FC = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [voting, setVoting] = useState<number | null>(null);
  const [filterCat, setFilterCat] = useState('');
  const [form, setForm] = useState({ title: '', description: '', category: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fetchIdeas = () => {
    setLoading(true);
    apiClient.get('/ideas/')
      .then(res => setIdeas(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchIdeas(); }, []);

  const handleVote = async (id: number) => {
    setVoting(id);
    try {
      await apiClient.post(`/ideas/${id}/vote`);
      fetchIdeas();
    } catch (e) { console.error(e); }
    finally { setVoting(null); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post('/ideas/', form);
      setForm({ title: '', description: '', category: '' });
      setShowForm(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const filtered = filterCat ? ideas.filter(i => i.category === filterCat) : ideas;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Lightbulb className="w-8 h-8 text-yellow-400" />
            Community Ideas Board
          </h1>
          <p className="text-slate-400 mt-1">Vote on features and submit your ideas anonymously.</p>
        </div>
        <div className="flex gap-3">
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-3 py-2 text-sm outline-none">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition-colors font-medium">
            <Plus className="w-4 h-4" /> Submit Idea
          </button>
        </div>
      </div>

      {/* Submit form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-yellow-900/30 rounded-xl p-5 space-y-4">
          <h2 className="text-lg font-semibold">Submit an Idea</h2>
          <p className="text-xs text-slate-500">Ideas are anonymous and reviewed by the owner before appearing publicly.</p>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="Idea title *" required
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-yellow-500" />
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Describe your idea in detail *" rows={3} required
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-yellow-500 resize-none" />
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-yellow-500">
            <option value="">Select category (optional)</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex gap-3">
            <button type="submit" disabled={submitting}
              className="px-5 py-2 bg-yellow-600 hover:bg-yellow-500 text-white text-sm rounded-lg transition-colors font-medium disabled:opacity-50">
              {submitting ? 'Submitting…' : 'Submit Idea'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {/* Success message */}
      {submitted && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-5 py-3 text-sm">
          ✓ Your idea has been submitted and is pending review. Thank you!
        </div>
      )}

      {/* Ideas grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-slate-900 rounded-xl border border-slate-800 p-5 animate-pulse h-36" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800">
          <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>No approved ideas yet.</p>
          <p className="text-sm mt-1">Be the first — submit an idea above!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.sort((a, b) => b.vote_count - a.vote_count).map(idea => (
            <div key={idea.id} className="bg-slate-900 border border-slate-800 hover:border-yellow-500/30 rounded-xl p-5 transition-all group">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-slate-100 group-hover:text-yellow-300 transition-colors flex-1 pr-4">{idea.title}</h3>
                {idea.category && (
                  <span className={`px-2 py-0.5 text-[10px] rounded-md border flex-shrink-0 ${categoryColors[idea.category] ?? 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                    {idea.category}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">{idea.description}</p>
              {idea.owner_comment && (
                <div className="mt-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-3 py-2">
                  <p className="text-xs text-emerald-400 font-semibold mb-0.5">Owner comment</p>
                  <p className="text-xs text-slate-300">{idea.owner_comment}</p>
                </div>
              )}
              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={() => handleVote(idea.id)}
                  disabled={voting === idea.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-yellow-500/10 hover:border-yellow-500/30 border border-slate-700 rounded-lg text-sm text-slate-400 hover:text-yellow-400 transition-all disabled:opacity-50"
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${voting === idea.id ? 'animate-bounce' : ''}`} />
                  <span className="font-semibold">{idea.vote_count}</span> votes
                </button>
                <span className="text-xs text-slate-600 capitalize">{idea.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IdeasBoard;
