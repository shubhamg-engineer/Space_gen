import React, { useState } from 'react';
import { Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import apiClient from '../../api/client';

interface ExplainButtonProps {
  topic: string;
  context?: string;
  className?: string;
  compact?: boolean;
}

const ExplainButton: React.FC<ExplainButtonProps> = ({ topic, context = '', className = '', compact = false }) => {
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleExplain = async () => {
    if (explanation) {
      setIsOpen(!isOpen);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.post('/ai/explain', { topic, context, level: 'general' });
      setExplanation(res.data.text);
      setConfidence(res.data.confidence);
      setIsOpen(true);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to generate explanation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`mt-2 ${className}`}>
      <button
        onClick={handleExplain}
        disabled={loading}
        className={compact
          ? "flex items-center gap-1 px-2 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs rounded border border-indigo-500/20 transition-colors disabled:opacity-50"
          : "flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-medium rounded-md border border-indigo-500/20 transition-colors disabled:opacity-50"
        }
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
        {!compact && (explanation ? (isOpen ? 'Hide AI Explanation' : 'Show AI Explanation') : 'Explain This with AI')}
      </button>

      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}

      {isOpen && explanation && (
        <div className="mt-3 bg-indigo-950/20 border border-indigo-900/50 rounded-lg p-4 space-y-2 relative">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-indigo-900/50">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-indigo-300">AI Explanation (Groq LLaMA 3)</span>
            {confidence && (
              <span className="ml-auto text-[10px] flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                {confidence}% Verified
              </span>
            )}
          </div>
          <div className="text-sm text-slate-300 leading-relaxed space-y-2 whitespace-pre-wrap">
            {explanation}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplainButton;
