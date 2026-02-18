import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import DecisionCard from '../components/DecisionCard';
import DecisionForm from '../components/DecisionForm';
import { LogOut, LayoutGrid } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600">
            <LayoutGrid className="w-6 h-6" />
            <h1 className="font-bold text-xl tracking-tight text-slate-900">Decision Keeper</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 hidden sm:block">{user?.email}</span>
            <button
              onClick={logout}
              className="text-slate-500 hover:text-slate-800 transition-colors p-2 rounded-lg hover:bg-slate-100"
              title="Log out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Your Decisions</h2>
          <p className="text-slate-500">Track and reflect on your choices.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form */}
          <div className="lg:col-span-1">
            <DecisionForm onDecisionAdded={handleDecisionAdded} />
          </div>

          {/* Right Column: List */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="text-center py-12 text-slate-400">Loading decisions...</div>
            ) : decisions.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-500 mb-2">No decisions recorded yet.</p>
                <p className="text-sm text-slate-400">Add your first one to get started!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {decisions.map((decision) => (
                  <DecisionCard key={decision.id} decision={decision} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
