import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import KanbanBoard from '../components/KanbanBoard';
import CreateTaskModal from '../components/CreateTaskModal';
import ConfirmModal from '../components/ConfirmModal';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  LayoutGrid,
  List,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

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
  const [assignedFilter, setAssignedFilter] = useState('All'); // 'All', 'me', 'unassigned'
  const [onlyOverdue, setOnlyOverdue] = useState(false);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'

  // Modal states
  const [editingTask, setEditingTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchTasksAndProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedProject !== 'All') params.append('projectId', selectedProject);
      if (selectedPriority !== 'All') params.append('priority', selectedPriority);
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
  }, [search, selectedProject, selectedPriority, assignedFilter, onlyOverdue]);

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
      toast.success(`Task status moved to ${newStatus}`);
      window.dispatchEvent(new CustomEvent('taskflow_data_changed'));
    } catch (err) {
      toast.error('Failed to update task status');
      fetchTasksAndProjects();
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-charcoal tracking-tight">Tasks Board</h1>
          <p className="text-xs text-charcoal-400 mt-1">
            Organize workflow stages, assignees, and deadlines
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
              placeholder="Search tasks by title or description..."
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
        <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle border-b border-border uppercase font-bold text-charcoal-400 text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Task</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tasks.map((task) => (
                  <tr key={task._id} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-charcoal">{task.title}</td>
                    <td className="py-3 px-4 text-charcoal-500">{task.projectId?.name || '-'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-surface-muted border border-border">
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        className="text-xs font-bold py-1 px-2 rounded-lg bg-surface-muted border border-border text-charcoal focus:outline-none"
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Review">Review</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-charcoal-500">
                      {task.assignedTo?.name || 'Unassigned'}
                    </td>
                    <td className="py-3 px-4 text-charcoal-500">
                      {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingTask(task);
                            setIsTaskModalOpen(true);
                          }}
                          className="p-1 text-charcoal-400 hover:text-charcoal"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(task)}
                          className="p-1 text-charcoal-400 hover:text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {tasks.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-charcoal-400">
                      No tasks found matching your filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Task Modal */}
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        projects={projects}
        initialData={editingTask}
        onSuccess={() => {
          fetchTasksAndProjects();
          window.dispatchEvent(new CustomEvent('taskflow_data_changed'));
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingTask(null);
        }}
        onConfirm={confirmDeleteTask}
        title="Delete Task"
        message={`Are you sure you want to permanently delete task "${deletingTask?.title}"?`}
        confirmText="Delete Task"
      />
    </div>
  );
}
