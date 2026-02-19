import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, User, Lock, Mail, ShieldCheck } from 'lucide-react';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Password ciphers do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/register', { email, password });
      login(response.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Identity creation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-6 overflow-hidden">
      <div className="aurora-bg" />

      {/* Decorative Elements */}
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-500/10 blur-[130px] rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-cyan-500/10 blur-[150px] rounded-full -z-10 animate-pulse" style={{ animationDelay: '3s' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md my-12"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: -3 }}
            transition={{ type: 'spring', damping: 12 }}
            className="w-20 h-20 bg-purple-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-purple-500/20"
          >
            <ShieldCheck className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Join the Nebula</h1>
          <p className="text-slate-400">Begin your journey of high-stakes choices.</p>
        </div>

        <div className="glass-card p-10 relative overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">
                New Astral Address
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
                  placeholder="At least 6 characters"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">
                Confirm Cipher
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <ShieldCheck className="w-5 h-5 text-slate-600" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field pl-12"
                  placeholder="Re-enter your cipher"
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
              className="btn-primary w-full group relative overflow-hidden py-5 !bg-purple-600 hover:!bg-purple-500 shadow-purple-500/20"
            >
              <span className="relative z-10 flex items-center justify-center gap-2 text-lg">
                {loading ? 'Transmitting...' : (
                  <>
                    Initialize Identity
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </button>
          </form>

          <p className="text-center mt-10 text-slate-500 text-sm">
            Already have a path?{' '}
            <Link to="/login" className="text-purple-400 font-bold hover:text-purple-300 transition-colors inline-flex items-center gap-1 group">
              Resume voyage
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
