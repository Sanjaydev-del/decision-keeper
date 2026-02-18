import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import DecisionCard from '../components/DecisionCard';
import DecisionForm from '../components/DecisionForm';
import { LogOut, LayoutGrid, Plus, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Decision {
  id: number;
  title: string;
  description: string;
  category: string;
  created_at: string;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchDecisions();
  }, []);

  const fetchDecisions = async () => {
    try {
      const response = await axios.get('/api/decisions');
      setDecisions(response.data);
    } catch (error) {
      console.error('Failed to fetch decisions', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDecisionAdded = (newDecision: Decision) => {
    setDecisions([newDecision, ...decisions]);
    if (window.innerWidth < 1024) setIsFormOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this decision?')) return;
    try {
      await axios.delete(`/api/decisions/${id}`);
      setDecisions(decisions.filter((d) => d.id !== id));
    } catch (error) {
      console.error('Failed to delete decision', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <LayoutGrid className="text-white w-6 h-6" />
            </div>
            <h1 className="font-bold text-lg sm:text-xl tracking-tight text-slate-900 leading-none">
              Decision Keeper
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-900">{user?.email?.split('@')[0]}</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold text-right">Pro Member</span>
            </div>
            <button
              onClick={logout}
              className="text-slate-400 hover:text-red-500 transition-colors p-2.5 rounded-xl hover:bg-red-50"
              title="Log out"
            >
              <LogOut size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10">
        <div className="lg:grid lg:grid-cols-12 lg:gap-10">

          {/* Mobile Add Button */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              {isFormOpen ? 'Cancel' : 'New Decision'}
            </button>
          </div>

          {/* Form Column */}
          <div className={`lg:col-span-4 mb-8 lg:mb-0 ${isFormOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-28">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">Creation Hub</h2>
              <DecisionForm onDecisionAdded={handleDecisionAdded} />
            </div>
          </div>

          {/* List Column */}
          <div className="lg:col-span-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Your Vault</h2>
                <p className="text-slate-500 mt-1">Reflect, refine, and evolve.</p>
              </div>
              <div className="relative group min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search decisions..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
                />
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="grid gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 bg-slate-100 rounded-3xl animate-pulse" />
                  ))}
                </div>
              ) : decisions.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200"
                >
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LayoutGrid className="text-slate-300 w-8 h-8" />
                  </div>
                  <p className="text-slate-600 font-semibold mb-1">Your vault is empty</p>
                  <p className="text-sm text-slate-400">Time to log your first major choice.</p>
                </motion.div>
              ) : (
                <div className="grid gap-5">
                  <AnimatePresence mode="popLayout">
                    {decisions.map((decision) => (
                      <motion.div
                        key={decision.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <DecisionCard decision={decision} onDelete={handleDelete} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
