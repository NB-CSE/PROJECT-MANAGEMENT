import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { UserPlus, UserX, Mail, ShieldCheck } from 'lucide-react';

export default function AssignMemberModal({ isOpen, onClose, project, onSuccess }) {
  const { toast } = useToast();
  const [emailInput, setEmailInput] = useState('');
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      if (res.success) {
        setRegisteredUsers(res.users);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (userIdOrEmail) => {
    if (!project?._id) return;
    try {
      setSubmitting(true);
      const isEmail = typeof userIdOrEmail === 'string' && userIdOrEmail.includes('@');
      const payload = isEmail ? { email: userIdOrEmail } : { userId: userIdOrEmail };

      const res = await api.post(`/projects/${project._id}/members`, payload);
      toast.success(res.message || 'Member added');
      setEmailInput('');
      if (onSuccess) onSuccess(res.project);
    } catch (err) {
      toast.error(err.message || 'Failed to add member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!project?._id) return;
    try {
      setSubmitting(true);
      const res = await api.delete(`/projects/${project._id}/members/${userId}`);
      toast.success(res.message || 'Member removed');
      if (onSuccess) onSuccess(res.project);
    } catch (err) {
      toast.error(err.message || 'Failed to remove member');
    } finally {
      setSubmitting(false);
    }
  };

  const currentMemberIds = project?.memberIds ? project.memberIds.map(m => m._id || m) : [];
  const ownerId = project?.ownerId?._id || project?.ownerId;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Project Team" maxWidth="max-w-lg">
      <div className="space-y-6">
        {/* Add by email form */}
        <div>
          <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-2">
            Add Team Member by Email
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3.5 top-3 text-charcoal-300" size={17} />
              <input
                type="email"
                placeholder="colleague@taskflow.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent transition-all"
              />
            </div>
            <button
              onClick={() => handleAddMember(emailInput)}
              disabled={submitting || !emailInput.trim()}
              className="px-4 py-2.5 rounded-xl bg-lime hover:bg-lime-hover text-charcoal font-bold text-sm transition-all shadow-subtle disabled:opacity-50 flex items-center gap-1.5"
            >
              <UserPlus size={16} />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Current Members List */}
        <div>
          <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider mb-3">
            Current Members ({project?.memberIds?.length || 0})
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {project?.memberIds?.map((member) => {
              const isOwner = member._id === ownerId;
              return (
                <div
                  key={member._id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-surface-subtle"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-charcoal text-lime font-bold text-xs flex items-center justify-center">
                      {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-charcoal flex items-center gap-1.5">
                        <span>{member.name}</span>
                        {isOwner && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-lime text-charcoal font-bold">
                            Owner
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-charcoal-400">{member.email}</div>
                    </div>
                  </div>
                  {!isOwner && (
                    <button
                      onClick={() => handleRemoveMember(member._id)}
                      disabled={submitting}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      title="Remove member"
                    >
                      <UserX size={16} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Directory (Other registered users not yet in project) */}
        <div>
          <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider mb-3">
            Quick Add from Directory
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {registeredUsers
              .filter((u) => !currentMemberIds.includes(u._id))
              .map((u) => (
                <div
                  key={u._id}
                  className="flex items-center justify-between p-2 rounded-xl border border-border hover:border-charcoal-300 transition-colors bg-white"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-surface-muted text-charcoal font-bold text-xs flex items-center justify-center">
                      {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-charcoal">{u.name}</div>
                      <div className="text-[11px] text-charcoal-400">{u.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddMember(u._id)}
                    disabled={submitting}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-charcoal text-white hover:bg-charcoal-800 transition-colors flex items-center gap-1"
                  >
                    <UserPlus size={12} />
                    <span>Invite</span>
                  </button>
                </div>
              ))}
            {registeredUsers.filter((u) => !currentMemberIds.includes(u._id)).length === 0 && (
              <p className="text-xs text-charcoal-400 italic">All registered users are already in this project.</p>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-border flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-surface-muted text-charcoal hover:bg-charcoal-100 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}
