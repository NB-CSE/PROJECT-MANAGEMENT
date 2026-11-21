import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, CheckCircle2, Clock, MoreVertical, Edit, Trash2, UserPlus, Tag, Briefcase } from 'lucide-react';
import { format, isPast } from 'date-fns';
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

  const priorityStyles = {
    Urgent: 'bg-red-50 text-red-600 border-red-200',
    High: 'bg-amber-50 text-amber-700 border-amber-200',
    Medium: 'bg-blue-50 text-blue-700 border-blue-200',
    Low: 'bg-charcoal-100 text-charcoal-600 border-charcoal-200'
  };

  const members = project.memberIds || [];
  const maxVisibleMembers = 4;

  return (
    <div className="bg-white rounded-3xl border border-border p-6 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between group relative overflow-hidden">
      <div>
        {/* Top bar: Status + Category + Priority + Actions */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`px-2.5 py-1 rounded-full text-xs border ${
                statusStyles[project.status] || statusStyles.Active
              }`}
            >
              {project.status}
            </span>
            {project.category && (
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-surface-muted text-charcoal-500 border border-border">
                {project.category}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onManageMembers && (
              <button
                type="button"
                onClick={() => onManageMembers(project)}
                className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal hover:bg-surface-muted transition-colors"
                title="Manage Team"
              >
                <UserPlus size={15} />
              </button>
            )}
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(project)}
                className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal hover:bg-surface-muted transition-colors"
                title="Edit Project"
              >
                <Edit size={15} />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
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
          <h3 className="text-base font-extrabold text-charcoal hover:underline tracking-tight mb-1.5 leading-snug">
            {project.name}
          </h3>
        </Link>
        <p className="text-xs text-charcoal-400 line-clamp-2 leading-relaxed mb-4">
          {project.description || 'No description provided.'}
        </p>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[11px] font-bold text-charcoal-500 mb-1">
            <span>Milestone Completion</span>
            <span>{project.progress || 0}%</span>
          </div>
          <ProgressBar value={project.progress || 0} size="sm" />
        </div>
      </div>

      {/* Footer Metrics */}
      <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-charcoal-400">
        {/* Deadline & Budget */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className={isOverdue ? 'text-red-500' : 'text-charcoal-400'} />
            {project.deadline ? (
              <span className={isOverdue ? 'text-red-600 font-bold' : 'text-charcoal font-semibold text-[11px]'}>
                {format(new Date(project.deadline), 'MMM d, yyyy')}
              </span>
            ) : (
              <span className="text-[11px]">No deadline</span>
            )}
          </div>

          {project.budget && project.budget !== '—' && (
            <span className="text-[11px] font-bold text-charcoal-600 bg-surface-subtle px-2 py-0.5 rounded border border-border">
              {project.budget}
            </span>
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
