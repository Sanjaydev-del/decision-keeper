import React, { useState } from 'react';
import axios from 'axios';
import { Plus, Sparkles, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  onDecisionAdded: (decision: any) => void;
}

export default function DecisionForm({ onDecisionAdded }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Personal');
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('/api/decisions', {
        title,
        description,
        category,
      });
      onDecisionAdded(response.data);
      setTitle('');
      setDescription('');
      setCategory('Personal');
      setIsExpanded(false);
    } catch (error) {
      console.error('Failed to add decision', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.button
            key="collapsed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={() => setIsExpanded(true)}
            className="w-full h-16 sm:h-20 bg-white border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-3 font-bold group"
          >
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
              <Plus size={18} />
            </div>
            Log a new decision
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="glass p-6 sm:p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-500/10 border-indigo-100"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="text-indigo-600 w-5 h-5" />
                <h3 className="text-lg font-bold text-slate-800">New Entry</h3>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
                title="Cancel"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-600 ml-1">Decision Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                  placeholder="What's the verdict?"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-600 ml-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input-field appearance-none cursor-pointer"
                >
                  <option value="Career">💼 Career</option>
                  <option value="Health">💪 Health</option>
                  <option value="Finance">💰 Finance</option>
                  <option value="Personal">🏠 Personal</option>
                  <option value="Other">🌀 Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-600 ml-1">Notes & Context</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field min-h-[120px] py-4 resize-none"
                  placeholder="The reasoning behind the choice..."
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 group"
                >
                  {loading ? 'Saving Entry...' : (
                    <>
                      Save to Vault
                      <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
