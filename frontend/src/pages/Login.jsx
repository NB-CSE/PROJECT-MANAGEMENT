import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Lock, Mail, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      toast.success('Welcome back to TaskFlow');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('alex@taskflow.dev');
    setPassword('Password123');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 selection:bg-lime">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-lime items-center justify-center shadow-card mb-4">
            <span className="font-black text-charcoal text-2xl tracking-tighter">TF</span>
          </div>
          <h1 className="text-2xl font-black text-charcoal tracking-tight">TaskFlow</h1>
          <p className="text-sm text-charcoal-400 mt-1">Sign in to your project management workspace</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 border border-border shadow-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 text-charcoal-300" size={18} />
                <input
                  type="email"
                  required
                  placeholder="alex@taskflow.dev"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent transition-all placeholder:text-charcoal-300"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 text-charcoal-300" size={18} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent transition-all placeholder:text-charcoal-300"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-charcoal text-white hover:bg-charcoal-800 font-bold text-sm transition-all shadow-subtle flex items-center justify-center gap-2 group disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight size={16} className="text-lime group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Quick Demo Access */}
          <div className="mt-6 pt-5 border-t border-border text-center">
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="text-xs font-semibold text-charcoal-500 hover:text-charcoal bg-surface-muted hover:bg-charcoal-100 px-3 py-1.5 rounded-lg transition-colors inline-block"
            >
              Use Demo Credentials (alex@taskflow.dev)
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-charcoal-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-charcoal hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
