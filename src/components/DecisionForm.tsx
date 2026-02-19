import React, { useState } from 'react';
import axios from 'axios';
import {
  X,
  Send,
  Sparkles,
  Briefcase,
  HeartPulse,
  Coins,
  User,
  Shapes
} from 'lucide-react';
import { motion } from 'framer-motion';

interface DecisionFormProps {
  onSuccess: (decision: any) => void;
  onCancel: () => void;
}

const categories = [
  { value: 'Career', icon: Briefcase, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { value: 'Health', icon: HeartPulse, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { value: 'Finance', icon: Coins, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { value: 'Personal', icon: User, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  { value: 'Other', icon: Shapes, color: 'text-slate-400', bg: 'bg-slate-500/10' },
];

const DecisionForm: React.FC<DecisionFormProps> = ({ onSuccess, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('Career');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/decisions', { title, description, category });
      onSuccess(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'The star failed to ignite. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-8 md:p-12 relative overflow-hidden">
      {/* Decorative Aura */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -z-10" />

      <div className="flex justify-between items-center mb-10">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-bold mb-1 tracking-wider uppercase text-xs">
            <Sparkles className="w-3 h-3" />
            New Astral Decision
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">Record Your Path</h2>
        </div>
        <button
          onClick={onCancel}
          className="p-3 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-all"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">
            Decision Title
          </label>
          <input
            autoFocus
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field text-xl font-bold"
            placeholder="What weight balances your mind?"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">
            Details & Contemplation
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field min-h-[140px] resize-none text-lg"
            placeholder="Describe the context, the stakes, and your intuition..."
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">
            Essence Category
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = category === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${isActive
                      ? `${cat.bg} border-indigo-500/50 scale-[1.05] shadow-lg shadow-indigo-500/10`
                      : 'border-white/5 bg-white/5 grayscale hover:grayscale-0 hover:bg-white/10'
                    }`}
                >
                  <Icon className={`w-6 h-6 ${isActive ? cat.color : 'text-slate-500'}`} />
                  <span className={`text-[10px] font-black tracking-widest uppercase ${isActive ? 'text-white' : 'text-slate-500'}`}>
                    {cat.value}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-center font-bold text-sm"
          >
            {error}
          </motion.div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full group overflow-hidden relative"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? 'Recording to memory...' : (
                <>
                  Seal Decision
                  <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default DecisionForm;
