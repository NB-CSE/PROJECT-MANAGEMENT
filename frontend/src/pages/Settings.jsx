import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { User, Lock, Mail, Shield, CheckCircle, Database } from 'lucide-react';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    try {
      setLoading(true);
      const payload = { name, email };
      if (password) {
        if (password.length < 6) {
          toast.error('New password must be at least 6 characters');
          setLoading(false);
          return;
        }
        payload.password = password;
      }

      const res = await api.put('/auth/profile', payload);
      if (res.success) {
        updateUser(res.user);
        setPassword('');
        toast.success('Profile updated successfully');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-black text-charcoal tracking-tight">Account & Workspace Settings</h1>
        <p className="text-xs text-charcoal-400 mt-1">Manage personal credentials and security preferences</p>
      </div>

      {/* Profile Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-border shadow-card">
        <h2 className="text-base font-bold text-charcoal mb-4 flex items-center gap-2">
          <User size={18} />
          <span>Profile Information</span>
        </h2>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
              New Password (leave blank to keep current)
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent transition-all"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-lime hover:bg-lime-hover text-charcoal font-bold text-xs transition-all shadow-subtle disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* System Architecture Specifications */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-border shadow-card">
        <h2 className="text-base font-bold text-charcoal mb-4 flex items-center gap-2">
          <Database size={18} />
          <span>System Environment & Tech Stack</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-surface-subtle border border-border">
            <span className="text-charcoal-400 font-semibold block">Frontend Architecture</span>
            <span className="font-bold text-charcoal text-sm mt-0.5 block">React 18 + Vite + Tailwind CSS</span>
          </div>
          <div className="p-3.5 rounded-xl bg-surface-subtle border border-border">
            <span className="text-charcoal-400 font-semibold block">Backend Architecture</span>
            <span className="font-bold text-charcoal text-sm mt-0.5 block">Node.js + Express REST API</span>
          </div>
          <div className="p-3.5 rounded-xl bg-surface-subtle border border-border">
            <span className="text-charcoal-400 font-semibold block">Database Layer</span>
            <span className="font-bold text-charcoal text-sm mt-0.5 block">MongoDB Atlas + Mongoose ODM</span>
          </div>
          <div className="p-3.5 rounded-xl bg-surface-subtle border border-border">
            <span className="text-charcoal-400 font-semibold block">Authentication Protocol</span>
            <span className="font-bold text-charcoal text-sm mt-0.5 block">JWT + bcrypt password hashing</span>
          </div>
        </div>
      </div>
    </div>
  );
}
