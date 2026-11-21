import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import ActivityFeed from '../components/ActivityFeed';
import InviteMemberModal from '../components/InviteMemberModal';
import {
  Users,
  Search,
  Mail,
  Shield,
  FolderKanban,
  CheckSquare,
  Sparkles,
  UserPlus,
  CheckCircle2,
  Clock,
  Layers
} from 'lucide-react';
import { format } from 'date-fns';

export default function Team() {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const [usersRes, actRes, tasksRes] = await Promise.all([
        api.get('/users'),
        api.get('/activities?limit=15'),
        api.get('/tasks')
      ]);

      if (usersRes.success) setUsers(usersRes.users);
      if (actRes.success) setActivities(actRes.activities);
      if (tasksRes.success) setTasks(tasksRes.tasks);
    } catch (err) {
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, []);

  const roles = ['All', 'Admin', 'Project Lead', 'Lead Architect', 'Backend Engineer', 'Product Designer', 'DevOps & QA', 'Developer'];

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = selectedRole === 'All' || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-charcoal tracking-tight">Team Collaboration Roster</h1>
          <p className="text-xs text-charcoal-400 mt-1">
            Registered team members, capacity allocation, and real-time collaboration stream
          </p>
        </div>

        <button
          onClick={() => setIsInviteOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-lime hover:bg-lime-hover text-charcoal text-xs font-black transition-all shadow-subtle flex items-center gap-1.5 self-start sm:self-auto"
        >
          <UserPlus size={16} />
          <span>Add Member</span>
        </button>
      </div>

      {/* Grid: Team Directory & Team Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Directory */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search bar & Role Filters */}
          <div className="p-4 rounded-2xl bg-white border border-border shadow-xs space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 text-charcoal-300" size={17} />
              <input
                type="text"
                placeholder="Search team members by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface-subtle text-charcoal text-xs focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent transition-all placeholder:text-charcoal-400"
              />
            </div>

            {/* Role Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRole(r)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    selectedRole === r
                      ? 'bg-charcoal text-white shadow-2xs'
                      : 'text-charcoal-400 hover:text-charcoal hover:bg-surface-muted'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Members list */}
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 bg-charcoal-100 rounded-3xl" />
              ))}
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredUsers.map((member) => {
                const memberTasks = tasks.filter(
                  (t) => (t.assignedTo?._id || t.assignedTo) === member._id || (t.assignedToId?._id || t.assignedToId) === member._id
                );
                const completedTasks = memberTasks.filter((t) => t.status === 'Completed').length;
                const activeTasks = memberTasks.length - completedTasks;

                return (
                  <div
                    key={member._id}
                    className="p-5 rounded-3xl bg-white border border-border shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-charcoal text-lime font-black text-base flex items-center justify-center shrink-0 ring-2 ring-lime/30 shadow-subtle">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-sm font-bold text-charcoal truncate">{member.name}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-surface-muted text-charcoal-600 border border-border">
                            {member.role || 'Member'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-charcoal-400 mt-1 truncate">
                          <Mail size={12} className="shrink-0" />
                          <span className="truncate">{member.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Member workload stats */}
                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-charcoal">{activeTasks} Active</span>
                        <span className="text-charcoal-300">•</span>
                        <span className="text-[11px] font-bold text-charcoal-400">{completedTasks} Done</span>
                      </div>
                      <span className="text-[10px] font-semibold text-charcoal-400">
                        Joined {member.createdAt ? format(new Date(member.createdAt), 'MMM yyyy') : 'Recent'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-10 text-center bg-white rounded-3xl border border-dashed border-border">
              <Users size={32} className="mx-auto text-charcoal-300 mb-2" />
              <p className="text-xs text-charcoal-400">No members found matching filters</p>
            </div>
          )}
        </div>

        {/* Right Col: Team Collaboration Activity Feed */}
        <div>
          <div className="p-6 rounded-3xl bg-white border border-border shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-lime-dark" />
              <h3 className="text-sm font-bold text-charcoal">Live Activity Audit</h3>
            </div>
            <ActivityFeed activities={activities} loading={loading} />
          </div>
        </div>
      </div>

      {/* Invite Member Modal */}
      <InviteMemberModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onSuccess={() => fetchTeamData()}
      />
    </div>
  );
}
