import React, { useState } from 'react';
import Modal from './Modal';
import {
  Calendar,
  User,
  Clock,
  CheckSquare,
  Square,
  Tag,
  FolderKanban,
  AlertCircle,
  Edit,
  Trash2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function TaskDetailModal({
  isOpen,
  onClose,
  task,
  onEdit,
  onDelete,
  onTaskUpdated,
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  if (!task) return null;

  const isOverdue =
    task.dueDate &&
    task.status !== 'Completed' &&
    isPast(new Date(task.dueDate)) &&
    !isToday(new Date(task.dueDate));

  const priorityStyles = {
    Urgent: 'bg-red-50 text-red-700 border-red-200',
    High: 'bg-amber-50 text-amber-800 border-amber-200',
    Medium: 'bg-blue-50 text-blue-800 border-blue-200',
    Low: 'bg-charcoal-50 text-charcoal-700 border-charcoal-200',
  };

  const statusList = ['To Do', 'In Progress', 'Review', 'Completed'];

  const checklist = task.checklist || [];
  const completedChecklistCount = checklist.filter((c) => c.completed).length;
  const checklistPercent =
    checklist.length > 0 ? Math.round((completedChecklistCount / checklist.length) * 100) : 0;

  const handleToggleSubtask = async (checkId) => {
    try {
      const res = await api.post(`/tasks/${task._id}/checklist/${checkId}`);
      if (res.success && res.task) {
        if (onTaskUpdated) onTaskUpdated(res.task);
      }
    } catch (err) {
      toast.error('Failed to update subtask');
    }
  };

  const handleQuickStatusChange = async (newStatus) => {
    try {
      setLoading(true);
      const res = await api.patch(`/tasks/${task._id}/status`, { status: newStatus });
      toast.success(`Task moved to ${newStatus}`);
      if (onTaskUpdated) onTaskUpdated({ ...task, status: newStatus });
    } catch (err) {
      toast.error('Failed to change status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Task Overview" maxWidth="max-w-xl">
      <div className="space-y-6">
        {/* Top Badges: Project, Priority, Status */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {task.projectId?.name && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-surface-muted text-charcoal border border-border">
                <FolderKanban size={13} className="text-charcoal-400" />
                <span>{task.projectId.name}</span>
              </span>
            )}
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                priorityStyles[task.priority] || priorityStyles.Medium
              }`}
            >
              {task.priority} Priority
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                onClose();
                if (onEdit) onEdit(task);
              }}
              className="p-1.5 rounded-lg border border-border hover:bg-surface-muted text-charcoal text-xs font-semibold transition-all flex items-center gap-1"
              title="Edit Task Details"
            >
              <Edit size={14} />
              <span className="text-xs">Edit</span>
            </button>
            <button
              onClick={() => {
                onClose();
                if (onDelete) onDelete(task);
              }}
              className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold transition-all flex items-center gap-1"
              title="Delete Task"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Task Title */}
        <div>
          <h2 className="text-xl font-extrabold text-charcoal tracking-tight leading-snug">
            {task.title}
          </h2>
          {task.description ? (
            <p className="text-sm text-charcoal-500 mt-2 leading-relaxed bg-surface-subtle p-3 rounded-xl border border-border">
              {task.description}
            </p>
          ) : (
            <p className="text-xs text-charcoal-400 italic mt-1">No detailed description provided.</p>
          )}
        </div>

        {/* Quick Status Bar */}
        <div>
          <span className="block text-[11px] font-bold text-charcoal-400 uppercase tracking-wider mb-2">
            Workflow Stage
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {statusList.map((st) => (
              <button
                key={st}
                onClick={() => handleQuickStatusChange(st)}
                disabled={loading}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                  task.status === st
                    ? 'bg-charcoal text-white border-charcoal shadow-2xs ring-2 ring-lime/40'
                    : 'bg-white text-charcoal-500 border-border hover:border-charcoal-300 hover:text-charcoal'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Details Grid: Assignee, Due Date, Estimated Hours */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-surface-subtle border border-border">
          {/* Assignee */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400">
              Assigned To
            </span>
            <div className="flex items-center gap-2 mt-1">
              {task.assignedTo ? (
                <>
                  <div className="w-6 h-6 rounded-full bg-charcoal text-lime text-[10px] font-bold flex items-center justify-center shrink-0">
                    {task.assignedTo.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-charcoal truncate">
                    {task.assignedTo.name}
                  </span>
                </>
              ) : (
                <span className="text-xs text-charcoal-400 font-medium">Unassigned</span>
              )}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400">
              Deadline
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <Calendar
                size={14}
                className={isOverdue ? 'text-red-500' : 'text-charcoal-400'}
              />
              <span
                className={`text-xs font-bold ${
                  isOverdue ? 'text-red-600' : 'text-charcoal'
                }`}
              >
                {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No deadline'}
              </span>
            </div>
          </div>

          {/* Time Estimate */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400">
              Estimate
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-charcoal">
              <Clock size={14} className="text-charcoal-400" />
              <span>{task.estimatedHours ? `${task.estimatedHours} hrs` : 'Flexible'}</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div>
            <span className="block text-[11px] font-bold text-charcoal-400 uppercase tracking-wider mb-2">
              Tags & Labels
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {task.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-lime/20 text-charcoal border border-lime-dark/30 flex items-center gap-1"
                >
                  <Tag size={11} className="text-charcoal-500" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Checklist Section */}
        {checklist.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-charcoal-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckSquare size={14} />
                <span>Checklist Subtasks</span>
              </span>
              <span className="text-xs font-bold text-charcoal">
                {completedChecklistCount} of {checklist.length} ({checklistPercent}%)
              </span>
            </div>

            {/* Checklist progress bar */}
            <div className="h-2 w-full bg-charcoal-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-lime transition-all duration-300"
                style={{ width: `${checklistPercent}%` }}
              />
            </div>

            {/* Subtask items */}
            <div className="space-y-2 pt-1">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleSubtask(item.id)}
                  className={`p-2.5 rounded-xl border transition-all flex items-center gap-3 cursor-pointer select-none ${
                    item.completed
                      ? 'bg-lime/10 border-lime-dark/30 text-charcoal'
                      : 'bg-white border-border hover:border-charcoal-300 text-charcoal'
                  }`}
                >
                  {item.completed ? (
                    <CheckSquare size={18} className="text-charcoal shrink-0" />
                  ) : (
                    <Square size={18} className="text-charcoal-300 shrink-0" />
                  )}
                  <span
                    className={`text-xs font-semibold ${
                      item.completed ? 'line-through text-charcoal-400' : 'text-charcoal'
                    }`}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-charcoal text-white text-xs font-bold hover:bg-charcoal-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}
