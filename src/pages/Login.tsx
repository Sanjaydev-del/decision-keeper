import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, User, Lock, Mail } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post('/api/login', { email, password });
      login(response.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-6 overflow-hidden">
      <div className="aurora-bg" />

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500/10 blur-[120px] rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 blur-[140px] rounded-full -z-10 animate-pulse" style={{ animationDelay: '2s' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12 }}
            className="w-20 h-20 bg-indigo-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-indigo-500/20 rotate-3"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Welcome Back</h1>
          <p className="text-slate-400">Continue your decision voyage.</p>
        </div>

        <div className="glass-card p-10 relative overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">
                Astral Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-slate-600" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-12"
                  placeholder="name@nexus.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">
                Security Cipher
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-600" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-12"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm font-bold text-center"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full group relative overflow-hidden py-5"
            >
              <span className="relative z-10 flex items-center justify-center gap-2 text-lg">
                {loading ? 'Decrypting...' : (
                  <>
                    Enter the Hub
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </button>
          </form>

          <p className="text-center mt-10 text-slate-500 text-sm">
            New to the galaxy?{' '}
            <Link to="/register" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors inline-flex items-center gap-1 group">
              Create an identity
              <Sparkles className="w-3 h-3 group-hover:rotate-12 transition-transform" />
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
