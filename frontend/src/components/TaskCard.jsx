import React from 'react';
import { Calendar, User, MoreHorizontal, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  showProject = false,
  isDraggable = true
}) {
  const isOverdue =
    task.dueDate &&
    task.status !== 'Completed' &&
    isPast(new Date(task.dueDate)) &&
    !isToday(new Date(task.dueDate));

  const priorityColors = {
    Urgent: 'bg-red-100 text-red-700 border-red-200',
    High: 'bg-amber-100 text-amber-800 border-amber-200',
    Medium: 'bg-blue-100 text-blue-800 border-blue-200',
    Low: 'bg-charcoal-100 text-charcoal-700 border-charcoal-200'
  };

  const statusColors = {
    'To Do': 'bg-charcoal-100 text-charcoal-700',
    'In Progress': 'bg-amber-100 text-amber-800',
    'Review': 'bg-purple-100 text-purple-800',
    'Completed': 'bg-lime text-charcoal font-bold'
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', task._id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable={isDraggable}
      onDragStart={handleDragStart}
      className="p-4 rounded-xl bg-white border border-border hover:border-charcoal-300 shadow-subtle hover:shadow-card transition-all group cursor-grab active:cursor-grabbing"
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
            <span className="text-[11px] font-medium text-charcoal-400 bg-surface-muted px-2 py-0.5 rounded-md truncate max-w-[120px]">
              {task.projectId.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="p-1 text-charcoal-400 hover:text-charcoal rounded hover:bg-surface-muted transition-colors"
              title="Edit Task"
            >
              <Edit size={13} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(task)}
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
        <p className="text-xs text-charcoal-400 line-clamp-2 mb-3 leading-relaxed">
          {task.description}
        </p>
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
          title={isOverdue ? 'Overdue' : 'Due date'}
        >
          {isOverdue ? <AlertCircle size={13} /> : <Calendar size={13} />}
          <span>
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
            onChange={(e) => onStatusChange && onStatusChange(task._id, e.target.value)}
            className="text-[11px] font-bold py-0.5 px-1.5 rounded bg-surface-muted border border-border text-charcoal focus:outline-none hover:border-charcoal-300 transition-colors"
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
