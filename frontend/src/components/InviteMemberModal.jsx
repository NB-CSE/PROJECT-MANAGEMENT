import React, { useState } from 'react';
import Modal from './Modal';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { User, Mail, Shield, Plus } from 'lucide-react';

const ROLES = [
  'Developer',
  'Lead Architect',
  'Product Designer',
  'Backend Engineer',
  'DevOps & QA',
  'Project Manager',
  'Member'
];

export default function InviteMemberModal({ isOpen, onClose, onSuccess }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Developer'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/users', formData);
      toast.success(res.message || 'Team member added successfully!');
      if (onSuccess) onSuccess(res.user);
      onClose();
      setFormData({ name: '', email: '', role: 'Developer' });
    } catch (err) {
      toast.error(err.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite New Team Member" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <User size={13} />
            <span>Full Name</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent transition-all placeholder:text-charcoal-300"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Mail size={13} />
            <span>Email Address</span>
          </label>
          <input
            type="email"
            required
            placeholder="john@taskflow.dev"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent transition-all placeholder:text-charcoal-300"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Shield size={13} />
            <span>Workspace Role</span>
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent transition-all"
          >
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-charcoal-500 hover:text-charcoal hover:bg-surface-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-lime hover:bg-lime-hover text-charcoal font-black text-sm transition-all shadow-subtle disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Member'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
