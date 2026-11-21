import React, { useState } from 'react';
import TaskCard from './TaskCard';
import { Plus, CheckCircle, Clock, Eye, AlertCircle } from 'lucide-react';

const COLUMNS = [
  { id: 'To Do', title: 'To Do', icon: Clock, color: 'border-t-charcoal-400' },
  { id: 'In Progress', title: 'In Progress', icon: AlertCircle, color: 'border-t-amber-500' },
  { id: 'Review', title: 'Review', icon: Eye, color: 'border-t-purple-500' },
  { id: 'Completed', title: 'Completed', icon: CheckCircle, color: 'border-t-lime-dark' },
];

export default function KanbanBoard({
  tasks = [],
  onStatusChange,
  onEditTask,
  onDeleteTask,
  onQuickAddTask,
  onViewDetails,
  showProject = false
}) {
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDragLeave = (e, columnId) => {
    e.preventDefault();
    if (dragOverColumn === columnId) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId && onStatusChange) {
      onStatusChange(taskId, targetStatus);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start overflow-x-auto pb-4">
      {COLUMNS.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.id);
        const Icon = column.icon;
        const isTargeted = dragOverColumn === column.id;

        return (
          <div
            key={column.id}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={(e) => handleDragLeave(e, column.id)}
            onDrop={(e) => handleDrop(e, column.id)}
            className={`bg-surface-subtle/80 rounded-2xl p-4 border border-border transition-all duration-200 min-h-[480px] flex flex-col ${
              isTargeted ? 'ring-2 ring-lime bg-lime/10 border-lime-dark/40' : ''
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-charcoal">{column.title}</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white text-charcoal-500 border border-border">
                  {columnTasks.length}
                </span>
              </div>
              {onQuickAddTask && (
                <button
                  type="button"
                  onClick={() => onQuickAddTask(column.id)}
                  className="p-1 rounded-lg text-charcoal-400 hover:text-charcoal hover:bg-white transition-colors"
                  title={`Add task to ${column.title}`}
                >
                  <Plus size={16} />
                </button>
              )}
            </div>

            {/* Task list container */}
            <div className="flex-1 space-y-3">
              {columnTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onStatusChange={onStatusChange}
                  onViewDetails={onViewDetails}
                  showProject={showProject}
                />
              ))}

              {columnTasks.length === 0 && (
                <div className="h-32 border-2 border-dashed border-border rounded-xl flex items-center justify-center p-4 text-center">
                  <p className="text-xs text-charcoal-300 font-medium">No tasks in {column.title}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
