import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, CheckCircle2, Clock, MoreVertical, Edit, Trash2, UserPlus } from 'lucide-react';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import ProgressBar from './ProgressBar';

export default function ProjectCard({
  project,
  onEdit,
  onDelete,
  onManageMembers
}) {
  const isOverdue =
    project.deadline &&
    project.status !== 'Completed' &&
    isPast(new Date(project.deadline));

  const statusStyles = {
    Active: 'bg-lime/30 text-charcoal border-lime-dark/30 font-bold',
    Planning: 'bg-blue-50 text-blue-700 border-blue-200 font-semibold',
    'On Hold': 'bg-charcoal-100 text-charcoal-600 border-charcoal-200 font-semibold',
    Completed: 'bg-charcoal text-white font-bold'
  };

  const members = project.memberIds || [];
  const maxVisibleMembers = 3;

  return (
    <div className="bg-white rounded-2xl border border-border p-5 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Top bar: Status + Actions */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`px-2.5 py-1 rounded-full text-xs border ${
              statusStyles[project.status] || statusStyles.Active
            }`}
          >
            {project.status}
          </span>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onManageMembers && (
              <button
                onClick={() => onManageMembers(project)}
                className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal hover:bg-surface-muted transition-colors"
                title="Manage Team"
              >
                <UserPlus size={15} />
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(project)}
                className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal hover:bg-surface-muted transition-colors"
                title="Edit Project"
              >
                <Edit size={15} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(project)}
                className="p-1.5 rounded-lg text-charcoal-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Delete Project"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Project Name & Description */}
        <Link to={`/projects/${project._id}`} className="block group-hover:text-charcoal-900">
          <h3 className="text-base font-bold text-charcoal hover:underline tracking-tight mb-1.5">
            {project.name}
          </h3>
        </Link>
        <p className="text-xs text-charcoal-400 line-clamp-2 leading-relaxed mb-4">
          {project.description || 'No description provided.'}
        </p>

        {/* Progress bar */}
        <div className="mb-4">
          <ProgressBar value={project.progress || 0} size="sm" />
        </div>
      </div>

      {/* Footer Metrics */}
      <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-charcoal-400">
        {/* Deadline */}
        <div className="flex items-center gap-1.5">
          <Calendar size={13} className={isOverdue ? 'text-red-500' : ''} />
          {project.deadline ? (
            <span className={isOverdue ? 'text-red-600 font-semibold' : ''}>
              {format(new Date(project.deadline), 'MMM d, yyyy')}
            </span>
          ) : (
            <span>No deadline</span>
          )}
        </div>

        {/* Member Avatars Stack */}
        <div className="flex items-center -space-x-1.5 overflow-hidden">
          {members.slice(0, maxVisibleMembers).map((member, i) => (
            <div
              key={member._id || i}
              className="w-6 h-6 rounded-full bg-charcoal text-lime text-[10px] font-bold flex items-center justify-center ring-2 ring-white"
              title={member.name || 'Member'}
            >
              {(member.name || 'U').charAt(0).toUpperCase()}
            </div>
          ))}
          {members.length > maxVisibleMembers && (
            <div className="w-6 h-6 rounded-full bg-surface-muted text-charcoal text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
              +{members.length - maxVisibleMembers}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
