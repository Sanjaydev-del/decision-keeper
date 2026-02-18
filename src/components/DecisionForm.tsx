import React, { useState } from 'react';
import axios from 'axios';
import { Plus } from 'lucide-react';

interface Props {
  onDecisionAdded: (decision: any) => void;
}

export default function DecisionForm({ onDecisionAdded }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Personal');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    }
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full bg-white border-2 border-dashed border-slate-200 rounded-2xl p-6 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-all flex items-center justify-center gap-2 font-medium"
      >
        <Plus size={20} />
        Log a new decision
      </button>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800">New Decision</h3>
        <button 
          onClick={() => setIsExpanded(false)}
          className="text-slate-400 hover:text-slate-600 text-sm"
        >
          Cancel
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            placeholder="What did you decide?"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
            >
              <option value="Career">Career</option>
              <option value="Health">Health</option>
              <option value="Finance">Finance</option>
              <option value="Personal">Personal</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Description (Optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all h-24 resize-none"
            placeholder="Add context, reasoning, or expected outcomes..."
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            Save Decision
          </button>
        </div>
      </form>
    </div>
  );
}
