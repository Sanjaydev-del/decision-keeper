import React from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  HeartPulse,
  Coins,
  User,
  Shapes,
  Trash2,
  Calendar,
  ArrowUpRight
} from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';

interface Decision {
  id: number;
  title: string;
  description: string;
  category: 'Career' | 'Health' | 'Finance' | 'Personal' | 'Other';
  created_at: string;
}

const categoryConfig = {
  Career: { icon: Briefcase, color: 'text-indigo-400', bg: 'bg-indigo-500/10', aura: 'aura-career' },
  Health: { icon: HeartPulse, color: 'text-emerald-400', bg: 'bg-emerald-500/10', aura: 'aura-health' },
  Finance: { icon: Coins, color: 'text-amber-400', bg: 'bg-amber-500/10', aura: 'aura-finance' },
  Personal: { icon: User, color: 'text-pink-400', bg: 'bg-pink-500/10', aura: 'aura-personal' },
  Other: { icon: Shapes, color: 'text-slate-400', bg: 'bg-slate-500/10', aura: 'aura-other' },
};

const DecisionCard: React.FC<{ decision: Decision; onDelete: (id: number) => void }> = ({ decision, onDelete }) => {
  const config = categoryConfig[decision.category] || categoryConfig.Other;
  const Icon = config.icon;

  const handleDelete = async () => {
    if (window.confirm('Dissolve this decision?')) {
      try {
        await axios.delete(`/api/decisions/${decision.id}`);
        onDelete(decision.id);
      } catch (err) {
        alert('Failed to delete');
      }
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02, rotateY: 5, rotateX: -5 }}
      style={{ perspective: 1000 }}
      className={`glass-card p-8 group relative flex flex-col h-full ${config.aura}`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-2xl ${config.bg} transition-colors group-hover:bg-white/10`}>
          <Icon className={`w-6 h-6 ${config.color}`} />
        </div>
        <button
          onClick={handleDelete}
          className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-grow">
        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">
          {decision.title}
        </h3>
        <p className="text-slate-400 leading-relaxed line-clamp-3 mb-6">
          {decision.description}
        </p>
      </div>

      <div className="pt-6 border-t border-white/5 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
          <Calendar className="w-4 h-4" />
          {format(new Date(decision.created_at), 'MMM dd, yyyy')}
        </div>

        <div className="flex items-center gap-1 text-xs font-bold text-indigo-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
          Details
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </div>

      {/* Subtle Glowing Background - Corner Aura */}
      <div className={`absolute -right-4 -top-4 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-all duration-700 pointer-events-none ${config.bg}`} />
    </motion.div>
  );
};

export default DecisionCard;
