import React from 'react';
import { format } from 'date-fns';
import { Trash2, Calendar, Tag, MoreVertical } from 'lucide-react';

interface Decision {
  id: number;
  title: string;
  description: string;
  category: string;
  created_at: string;
}

interface Props {
  decision: Decision;
  onDelete: (id: number) => void | Promise<void>;
  key?: React.Key;
}

const categoryStyles: Record<string, { bg: string; text: string; icon: string }> = {
  Career: { bg: 'bg-blue-50/50', text: 'text-blue-700', icon: '💼' },
  Health: { bg: 'bg-emerald-50/50', text: 'text-emerald-700', icon: '💪' },
  Finance: { bg: 'bg-amber-50/50', text: 'text-amber-700', icon: '💰' },
  Personal: { bg: 'bg-purple-50/50', text: 'text-purple-700', icon: '🏠' },
  Other: { bg: 'bg-slate-50/50', text: 'text-slate-700', icon: '🌀' },
};

export default function DecisionCard({ decision, onDelete }: Props) {
  const style = categoryStyles[decision.category] || categoryStyles.Other;

  return (
    <div className="glass p-6 sm:p-7 rounded-[2rem] hover:shadow-xl hover:shadow-indigo-500/5 transition-all group relative border-white/40">
      <div className="flex justify-between items-start mb-5">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${style.bg} ${style.text} border border-white/50`}>
          <span>{style.icon}</span>
          <span className="uppercase tracking-wider">{decision.category}</span>
        </div>
        <button
          onClick={() => onDelete(decision.id)}
          className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all sm:opacity-0 group-hover:opacity-100"
          title="Delete entry"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight">{decision.title}</h3>

      {decision.description && (
        <p className="text-slate-500 text-sm mb-6 leading-relaxed line-clamp-3">
          {decision.description}
        </p>
      )}

      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-auto pt-5 border-t border-slate-100/50">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-indigo-400" />
          {format(new Date(decision.created_at), 'MMMM d, yyyy')}
        </div>
        <div className="sm:opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-slate-300">
          ID: {decision.id}
        </div>
      </div>
    </div>
  );
}
