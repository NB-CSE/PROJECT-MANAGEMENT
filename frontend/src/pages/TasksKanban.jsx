import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import KanbanBoard from '../components/KanbanBoard';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskDetailModal from '../components/TaskDetailModal';
import ConfirmModal from '../components/ConfirmModal';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  LayoutGrid,
  List,
  AlertCircle,
  Tag,
  RotateCcw
} from 'lucide-react';
import { format } from 'date-fns';

const TAG_OPTIONS = ['All', 'Frontend', 'Backend', 'UI/UX', 'Feature', 'Bug', 'Testing', 'DevOps', 'AI/ML'];

export default function TasksKanban() {
  const { openTaskModal } = useOutletContext();
  const { toast } = useToast();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedTag, setSelectedTag] = useState('All');
  const [assignedFilter, setAssignedFilter] = useState('All');
  const [onlyOverdue, setOnlyOverdue] = useState(false);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'

  // Modals state
  const [editingTask, setEditingTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [viewingTask, setViewingTask] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchTasksAndProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedProject !== 'All') params.append('projectId', selectedProject);
      if (selectedPriority !== 'All') params.append('priority', selectedPriority);
      if (selectedTag !== 'All') params.append('tag', selectedTag);
      if (assignedFilter !== 'All') params.append('assignedTo', assignedFilter);
      if (onlyOverdue) params.append('overdue', 'true');

      const [tasksRes, projRes] = await Promise.all([
        api.get(`/tasks?${params.toString()}`),
        api.get('/projects')
      ]);

      if (tasksRes.success) setTasks(tasksRes.tasks);
      if (projRes.success) setProjects(projRes.projects);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasksAndProjects();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, selectedProject, selectedPriority, selectedTag, assignedFilter, onlyOverdue]);

  useEffect(() => {
    const handleUpdate = () => fetchTasksAndProjects();
    window.addEventListener('taskflow_data_changed', handleUpdate);
    return () => window.removeEventListener('taskflow_data_changed', handleUpdate);
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
      );

      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      toast.success(`Task moved to ${newStatus}`);
      window.dispatchEvent(new CustomEvent('taskflow_data_changed'));
    } catch (err) {
      toast.error('Failed to update task status');
      fetchTasksAndProjects();
    }
  };

  const handleViewDetails = (task) => {
    setViewingTask(task);
    setIsDetailModalOpen(true);
  };

  const handleDeleteClick = (task) => {
    setDeletingTask(task);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteTask = async () => {
    if (!deletingTask) return;
    try {
      await api.delete(`/tasks/${deletingTask._id}`);
      toast.success('Task deleted');
      setTasks((prev) => prev.filter((t) => t._id !== deletingTask._id));
      window.dispatchEvent(new CustomEvent('taskflow_data_changed'));
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedProject('All');
    setSelectedPriority('All');
    setSelectedTag('All');
    setAssignedFilter('All');
    setOnlyOverdue(false);
  };

  const hasActiveFilters =
    search ||
    selectedProject !== 'All' ||
    selectedPriority !== 'All' ||
    selectedTag !== 'All' ||
    assignedFilter !== 'All' ||
    onlyOverdue;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-charcoal tracking-tight">Tasks Board & Kanban</h1>
          <p className="text-xs text-charcoal-400 mt-1">
            Organize stages, assignees, subtask checklists, and delivery milestones
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-border rounded-xl p-0.5">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-charcoal text-white shadow-2xs'
                  : 'text-charcoal-400 hover:text-charcoal'
              }`}
              title="Kanban View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-charcoal text-white shadow-2xs'
                  : 'text-charcoal-400 hover:text-charcoal'
              }`}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>

          <button
            onClick={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-lime hover:bg-lime-hover text-charcoal text-xs font-black transition-all shadow-subtle flex items-center gap-1.5"
          >
            <Plus size={16} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-border shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 text-charcoal-300" size={17} />
            <input
              type="text"
              placeholder="Search tasks by title, tag, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-surface-subtle text-charcoal text-xs focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent transition-all placeholder:text-charcoal-400"
            />
          </div>

          {/* Project dropdown */}
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="py-2 px-3 rounded-xl border border-border bg-surface-subtle text-charcoal text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-lime"
          >
            <option value="All">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Priority dropdown */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="py-2 px-3 rounded-xl border border-border bg-surface-subtle text-charcoal text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-lime"
          >
            <option value="All">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Tag Filter */}
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="py-2 px-3 rounded-xl border border-border bg-surface-subtle text-charcoal text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-lime"
          >
            <option value="All">All Tags</option>
            {TAG_OPTIONS.filter((t) => t !== 'All').map((tag) => (
              <option key={tag} value={tag}>
                #{tag}
              </option>
            ))}
          </select>

          {/* Assignee filter */}
          <select
            value={assignedFilter}
            onChange={(e) => setAssignedFilter(e.target.value)}
            className="py-2 px-3 rounded-xl border border-border bg-surface-subtle text-charcoal text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-lime"
          >
            <option value="All">All Assignees</option>
            <option value="me">Assigned to Me</option>
            <option value="unassigned">Unassigned</option>
          </select>

          {/* Overdue toggle */}
          <button
            onClick={() => setOnlyOverdue(!onlyOverdue)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shrink-0 ${
              onlyOverdue
                ? 'bg-red-50 text-red-600 border-red-200 shadow-2xs'
                : 'text-charcoal-500 border-border bg-surface-subtle hover:bg-surface-muted'
            }`}
          >
            <AlertCircle size={14} />
            <span>Overdue only</span>
          </button>

          {/* Reset button if active */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="p-2 text-charcoal-400 hover:text-charcoal hover:bg-surface-muted rounded-xl transition-colors"
              title="Reset all filters"
            >
              <RotateCcw size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Board or List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-96 bg-charcoal-100 rounded-2xl" />
          ))}
        </div>
      ) : viewMode === 'kanban' ? (
        <KanbanBoard
          tasks={tasks}
          onStatusChange={handleStatusChange}
          onViewDetails={handleViewDetails}
          onEditTask={(task) => {
            setEditingTask(task);
            setIsTaskModalOpen(true);
          }}
          onDeleteTask={handleDeleteClick}
          onQuickAddTask={(colStatus) => {
            setEditingTask({ status: colStatus });
            setIsTaskModalOpen(true);
          }}
          showProject={true}
        />
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle border-b border-border text-charcoal-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Task</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Checklist</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tasks.map((task) => {
                  const checklist = task.checklist || [];
                  const completedChecklist = checklist.filter((c) => c.completed).length;

                  return (
                    <tr
                      key={task._id}
                      onClick={() => handleViewDetails(task)}
                      className="hover:bg-surface-subtle/80 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-bold text-charcoal">
                        <div>{task.title}</div>
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            {task.tags.map((t, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-surface-muted text-charcoal-500 px-1.5 py-0.5 rounded font-semibold"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-charcoal-500 font-medium">
                        {task.projectId?.name || '—'}
                      </td>
                      <td className="py-3.5 px-4 font-bold">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            task.priority === 'Urgent'
                              ? 'bg-red-50 text-red-600'
                              : task.priority === 'High'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-charcoal-100 text-charcoal'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-lime/20 text-charcoal border border-lime-dark/30">
                          {task.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-charcoal-400 font-semibold">
                        {checklist.length > 0
                          ? `${completedChecklist}/${checklist.length}`
                          : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        {task.assignedTo?.name || 'Unassigned'}
                      </td>
                      <td className="py-3.5 px-4 text-charcoal-400">
                        {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(task);
                          }}
                          className="p-1 text-charcoal-400 hover:text-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {viewingTask && (
        <TaskDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setViewingTask(null);
          }}
          task={viewingTask}
          onEdit={(t) => {
            setEditingTask(t);
            setIsTaskModalOpen(true);
          }}
          onDelete={handleDeleteClick}
          onTaskUpdated={(updated) => {
            setViewingTask(updated);
            setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
            window.dispatchEvent(new CustomEvent('taskflow_data_changed'));
          }}
        />
      )}

      {/* Create / Edit Modal */}
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        initialData={editingTask}
        projects={projects}
        onSuccess={() => {
          fetchTasksAndProjects();
          window.dispatchEvent(new CustomEvent('taskflow_data_changed'));
        }}
      />

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingTask(null);
        }}
        onConfirm={confirmDeleteTask}
        title="Delete Task"
        message={`Are you sure you want to delete task "${deletingTask?.title}"? This action cannot be undone.`}
        confirmText="Delete Task"
      />
    </div>
  );
}
