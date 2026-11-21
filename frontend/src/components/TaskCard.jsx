import React from 'react';
import { Calendar, User, MoreHorizontal, AlertCircle, Edit, Trash2, CheckSquare, Tag } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  onViewDetails,
  showProject = false,
  isDraggable = true
}) {
  const isOverdue =
    task.dueDate &&
    task.status !== 'Completed' &&
    isPast(new Date(task.dueDate)) &&
    !isToday(new Date(task.dueDate));

  const priorityColors = {
    Urgent: 'bg-red-50 text-red-700 border-red-200',
    High: 'bg-amber-50 text-amber-800 border-amber-200',
    Medium: 'bg-blue-50 text-blue-800 border-blue-200',
    Low: 'bg-charcoal-50 text-charcoal-700 border-charcoal-200'
  };

  const checklist = task.checklist || [];
  const completedChecklistCount = checklist.filter((c) => c.completed).length;

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', task._id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCardClick = (e) => {
    // Avoid triggering when interacting with dropdown or action buttons
    if (e.target.closest('button') || e.target.closest('select')) return;
    if (onViewDetails) {
      onViewDetails(task);
    }
  };

  return (
    <div
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onClick={handleCardClick}
      className="p-4 rounded-2xl bg-white border border-border hover:border-charcoal-400 shadow-subtle hover:shadow-card transition-all group cursor-pointer active:cursor-grabbing relative"
    >
      {/* Top row: Priority tag & project name + actions */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${
              priorityColors[task.priority] || priorityColors.Medium
            }`}
          >
            {task.priority}
          </span>
          {showProject && task.projectId?.name && (
            <span className="text-[11px] font-semibold text-charcoal-500 bg-surface-muted px-2 py-0.5 rounded-md truncate max-w-[130px]">
              {task.projectId.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              className="p-1 text-charcoal-400 hover:text-charcoal rounded hover:bg-surface-muted transition-colors"
              title="Edit Task"
            >
              <Edit size={13} />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task);
              }}
              className="p-1 text-charcoal-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
              title="Delete Task"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Task Title */}
      <h4 className="text-sm font-bold text-charcoal mb-1 leading-snug group-hover:text-charcoal-900">
        {task.title}
      </h4>

      {/* Description snippet if present */}
      {task.description && (
        <p className="text-xs text-charcoal-400 line-clamp-2 mb-2.5 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Tags if any */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
          {task.tags.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface-muted text-charcoal-600 border border-border"
            >
              #{tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="text-[10px] text-charcoal-400 font-bold">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Checklist Mini Indicator if present */}
      {checklist.length > 0 && (
        <div className="mb-2.5 flex items-center gap-2">
          <div className="flex items-center gap-1 text-[11px] font-bold text-charcoal-500">
            <CheckSquare size={13} className="text-charcoal-400" />
            <span>
              {completedChecklistCount}/{checklist.length}
            </span>
          </div>
          <div className="h-1.5 flex-1 bg-charcoal-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-lime"
              style={{
                width: `${Math.round((completedChecklistCount / checklist.length) * 100)}%`
              }}
            />
          </div>
        </div>
      )}

      {/* Bottom details: Due date, Assignee, and Quick Status select */}
      <div className="pt-2 mt-2 border-t border-border/70 flex items-center justify-between gap-2 text-xs">
        {/* Due Date */}
        <div
          className={`flex items-center gap-1 font-medium ${
            isOverdue
              ? 'text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded'
              : 'text-charcoal-400'
          }`}
          title={isOverdue ? 'Overdue Deadline' : 'Due date'}
        >
          {isOverdue ? <AlertCircle size={13} /> : <Calendar size={13} />}
          <span className="text-[11px]">
            {task.dueDate
              ? format(new Date(task.dueDate), 'MMM d')
              : 'No date'}
          </span>
        </div>

        {/* Assignee & Status */}
        <div className="flex items-center gap-2">
          {task.assignedTo ? (
            <div
              className="w-6 h-6 rounded-full bg-charcoal text-lime text-[10px] font-bold flex items-center justify-center ring-1 ring-border"
              title={`Assigned to: ${task.assignedTo.name}`}
            >
              {task.assignedTo.name.charAt(0).toUpperCase()}
            </div>
          ) : (
            <div
              className="w-6 h-6 rounded-full bg-surface-muted text-charcoal-400 text-[10px] flex items-center justify-center"
              title="Unassigned"
            >
              <User size={12} />
            </div>
          )}

          {/* Quick status selector */}
          <select
            value={task.status}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              e.stopPropagation();
              if (onStatusChange) onStatusChange(task._id, e.target.value);
            }}
            className="text-[11px] font-bold py-0.5 px-1.5 rounded-lg bg-surface-muted border border-border text-charcoal focus:outline-none hover:border-charcoal-300 transition-colors"
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Review">Review</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>
    </div>
  );
}
