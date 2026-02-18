import React from 'react';
import { format } from 'date-fns';
import { Trash2, Calendar, Tag } from 'lucide-react';

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

const categoryColors: Record<string, string> = {
  Career: 'bg-blue-50 text-blue-700 border-blue-100',
  Health: 'bg-green-50 text-green-700 border-green-100',
  Finance: 'bg-amber-50 text-amber-700 border-amber-100',
  Personal: 'bg-purple-50 text-purple-700 border-purple-100',
  Other: 'bg-slate-50 text-slate-700 border-slate-100',
};

export default function DecisionCard({ decision, onDelete }: Props) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative">
      <div className="flex justify-between items-start mb-3">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${categoryColors[decision.category] || categoryColors.Other}`}>
          {decision.category}
        </span>
        <button
          onClick={() => onDelete(decision.id)}
          className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
          title="Delete decision"
        >
          <Trash2 size={18} />
        </button>
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">{decision.title}</h3>
      {decision.description && (
        <p className="text-slate-600 text-sm mb-4 leading-relaxed">{decision.description}</p>
      )}
      <div className="flex items-center text-slate-400 text-xs mt-auto pt-4 border-t border-slate-50">
        <Calendar size={14} className="mr-1.5" />
        {new Date(decision.created_at).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </div>
    </div>
  );
}
