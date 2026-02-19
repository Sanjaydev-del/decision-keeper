import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  LogOut,
  Sparkles,
  LayoutGrid,
  Clock,
  User,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DecisionCard from '../components/DecisionCard';
import DecisionForm from '../components/DecisionForm';

interface User {
  id: number;
  email: string;
}

interface Decision {
  id: number;
  title: string;
  description: string;
  category: 'Career' | 'Health' | 'Finance' | 'Personal' | 'Other';
  created_at: string;
}

const Dashboard: React.FC = () => {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meRes, decRes] = await Promise.all([
          axios.get('/api/me'),
          axios.get('/api/decisions')
        ]);
        setUser(meRes.data.user);
        setDecisions(decRes.data);
      } catch (err) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post('/api/logout');
      navigate('/login');
    } catch (err) {
      console.error('Logout failed');
    }
  };

  const filteredDecisions = decisions.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen relative pb-32">
      <div className="aurora-bg" />

      {/* Hero Header */}
      <header className="px-6 pt-12 pb-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-2 text-indigo-400 font-bold mb-2 tracking-wider uppercase text-sm">
              <Sparkles className="w-4 h-4" />
              Aurora Hub
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">
              Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Path</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed">
              Every choice is a star in your personal galaxy. Review, reflect, and evolve.
            </p>
          </motion.div>

          {/* Search Bar - Integrated into layout */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full md:w-80"
          >
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Search your path..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-6 py-4 rounded-3xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all backdrop-blur-md"
            />
          </motion.div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-64 rounded-[2.5rem] bg-white/5 animate-pulse" />
            ))
          ) : filteredDecisions.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {filteredDecisions.map((decision) => (
                <DecisionCard
                  key={decision.id}
                  decision={decision}
                  onDelete={(id) => setDecisions(prev => prev.filter(d => d.id !== id))}
                />
              ))}
            </AnimatePresence>
          ) : (
            <div className="col-span-full py-24 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6 float-slow">
                <Sparkles className="w-12 h-12 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">The galaxy is quiet</h2>
              <p className="text-slate-400">Add your first decision to light up the hub.</p>
            </div>
          )}
        </div>
      </main>

      {/* Action Island - The centerpiece of navigation */}
      <div className="action-island">
        <div className="flex items-center px-4 gap-6">
          <button
            onClick={() => setShowForm(true)}
            className="w-12 h-12 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white flex items-center justify-center transition-all active:scale-90 shadow-lg shadow-indigo-500/40"
          >
            <Plus className="w-6 h-6" />
          </button>

          <div className="h-6 w-px bg-white/10" />

          <div className="flex items-center gap-4 text-slate-400">
            <button className="p-2 hover:text-white transition-colors" title="Grid View">
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button className="p-2 hover:text-white transition-colors" title="Recent Activity">
              <Clock className="w-5 h-5" />
            </button>
          </div>

          <div className="h-6 w-px bg-white/10" />

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Active Voyager</span>
              <span className="text-sm font-semibold truncate max-w-[120px]">{user?.email.split('@')[0]}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-3 rounded-full hover:bg-white/5 text-slate-400 hover:text-rose-400 transition-all"
              title="End Session"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[60]"
            />
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              className="fixed inset-0 m-auto w-full max-w-2xl h-fit z-[70] px-6"
            >
              <DecisionForm
                onSuccess={(newDec) => {
                  setDecisions(prev => [newDec, ...prev]);
                  setShowForm(false);
                }}
                onCancel={() => setShowForm(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
