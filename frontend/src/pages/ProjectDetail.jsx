import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import KanbanBoard from '../components/KanbanBoard';
import ProgressBar from '../components/ProgressBar';
import CreateTaskModal from '../components/CreateTaskModal';
import CreateProjectModal from '../components/CreateProjectModal';
import AssignMemberModal from '../components/AssignMemberModal';
import ConfirmModal from '../components/ConfirmModal';
import ActivityFeed from '../components/ActivityFeed';
import {
  ArrowLeft,
  Calendar,
  Users,
  Plus,
  Edit,
  Trash2,
  UserPlus,
  Clock,
  Layers,
  LayoutGrid,
  List
} from 'lucide-react';
import { format } from 'date-fns';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState(null);
  const [isDeleteTaskOpen, setIsDeleteTaskOpen] = useState(false);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const [projRes, tasksRes, actRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?projectId=${id}`),
        api.get(`/activities?projectId=${id}&limit=10`)
      ]);

      if (projRes.success) setProject(projRes.project);
      if (tasksRes.success) setTasks(tasksRes.tasks);
      if (actRes.success) setActivities(actRes.activities);
    } catch (err) {
      toast.error('Failed to load project details');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
      );

      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      toast.success(`Task moved to ${newStatus}`);

      // Refresh project stats & activities
      const [projRes, actRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/activities?projectId=${id}&limit=10`)
      ]);
      if (projRes.success) setProject(projRes.project);
      if (actRes.success) setActivities(actRes.activities);
    } catch (err) {
      toast.error('Failed to update task status');
      fetchProjectData();
    }
  };

  const handleDeleteTask = (task) => {
    setDeletingTask(task);
    setIsDeleteTaskOpen(true);
  };

  const confirmDeleteTask = async () => {
    if (!deletingTask) return;
    try {
      await api.delete(`/tasks/${deletingTask._id}`);
      toast.success('Task removed');
      setTasks((prev) => prev.filter((t) => t._id !== deletingTask._id));
      fetchProjectData();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const confirmDeleteProject = async () => {
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      navigate('/projects');
    } catch (err) {
      toast.error('Failed to delete project');
    }
  };

  if (loading || !project) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 bg-charcoal-100 rounded w-24" />
        <div className="h-40 bg-charcoal-100 rounded-2xl" />
        <div className="h-96 bg-charcoal-100 rounded-2xl" />
      </div>
    );
  }

  const statusColors = {
    Active: 'bg-lime/30 text-charcoal border-lime-dark/30 font-bold',
    Planning: 'bg-blue-50 text-blue-700 border-blue-200 font-semibold',
    'On Hold': 'bg-charcoal-100 text-charcoal-600 border-charcoal-200 font-semibold',
    Completed: 'bg-charcoal text-white font-bold'
  };

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-charcoal-400 hover:text-charcoal transition-colors mb-2"
        >
          <ArrowLeft size={14} />
          <span>Back to Projects</span>
        </Link>
      </div>

      {/* Project Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-border shadow-card space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className={`px-2.5 py-1 rounded-full text-xs border ${statusColors[project.status] || statusColors.Active}`}>
                {project.status}
              </span>
              <span className="text-xs font-semibold text-charcoal-400">
                Created {format(new Date(project.createdAt), 'MMM d, yyyy')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-charcoal tracking-tight">
              {project.name}
            </h1>
            <p className="text-sm text-charcoal-500 leading-relaxed">
              {project.description || 'No description provided.'}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsMemberModalOpen(true)}
              className="p-2.5 rounded-xl border border-border hover:bg-surface-muted text-charcoal text-xs font-bold transition-all shadow-subtle flex items-center gap-1.5"
              title="Manage Team Members"
            >
              <UserPlus size={15} />
              <span className="hidden sm:inline">Team</span>
            </button>
            <button
              onClick={() => setIsEditProjectOpen(true)}
              className="p-2.5 rounded-xl border border-border hover:bg-surface-muted text-charcoal text-xs font-bold transition-all shadow-subtle flex items-center gap-1.5"
              title="Edit Project"
            >
              <Edit size={15} />
              <span className="hidden sm:inline">Edit</span>
            </button>
            {project.isOwner && (
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="p-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold transition-all shadow-subtle flex items-center gap-1.5"
                title="Delete Project"
              >
                <Trash2 size={15} />
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}
          </div>
        </div>

        {/* Project Metrics & Timeline Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-border">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-400">Progress</span>
            <div className="mt-1">
              <ProgressBar value={project.progress || 0} size="sm" />
            </div>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-400">Timeline</span>
            <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-charcoal">
              <Calendar size={14} className="text-charcoal-400" />
              <span>
                {project.deadline
                  ? format(new Date(project.deadline), 'MMM d, yyyy')
                  : 'No deadline'}
              </span>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-400">Tasks</span>
            <div className="flex items-center gap-2 mt-1 text-xs font-bold text-charcoal">
              <span>{project.completedTasks} completed</span>
              <span className="text-charcoal-300">/</span>
              <span>{project.totalTasks} total</span>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-400">Team</span>
            <div className="flex items-center -space-x-1.5 mt-1">
              {project.memberIds?.slice(0, 4).map((m) => (
                <div
                  key={m._id}
                  className="w-6 h-6 rounded-full bg-charcoal text-lime text-[10px] font-bold flex items-center justify-center ring-2 ring-white"
                  title={m.name}
                >
                  {m.name.charAt(0).toUpperCase()}
                </div>
              ))}
              {(project.memberIds?.length || 0) > 4 && (
                <div className="w-6 h-6 rounded-full bg-surface-muted text-charcoal text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                  +{(project.memberIds?.length || 0) - 4}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Controls: Add Task & View Switcher */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-charcoal">Tasks ({tasks.length})</h2>
          <div className="flex items-center bg-white border border-border rounded-xl p-0.5">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-charcoal text-white shadow-2xs'
                  : 'text-charcoal-400 hover:text-charcoal'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-charcoal text-white shadow-2xs'
                  : 'text-charcoal-400 hover:text-charcoal'
              }`}
              title="List View"
            >
              <List size={15} />
            </button>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingTask(null);
            setIsTaskModalOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-lime hover:bg-lime-hover text-charcoal text-xs font-black transition-all shadow-subtle flex items-center gap-1.5"
        >
          <Plus size={15} />
          <span>Add Task</span>
        </button>
      </div>

      {/* Tasks View: Kanban or List */}
      {viewMode === 'kanban' ? (
        <KanbanBoard
          tasks={tasks}
          onStatusChange={handleStatusChange}
          onEditTask={(task) => {
            setEditingTask(task);
            setIsTaskModalOpen(true);
          }}
          onDeleteTask={handleDeleteTask}
          onQuickAddTask={(columnStatus) => {
            setEditingTask({ status: columnStatus });
            setIsTaskModalOpen(true);
          }}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle border-b border-border uppercase font-bold text-charcoal-400 text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Task</th>
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
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task)}
                          className="p-1 text-charcoal-400 hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {tasks.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-charcoal-400">
                      No tasks created for this project yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Project Activity Log Section */}
      <div className="p-6 rounded-2xl bg-white border border-border shadow-card mt-8">
        <h3 className="text-sm font-bold text-charcoal mb-4">Project Activity</h3>
        <ActivityFeed activities={activities} />
      </div>

      {/* Modals */}
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        defaultProjectId={id}
        projects={[project]}
        initialData={editingTask}
        onSuccess={() => {
          fetchProjectData();
          window.dispatchEvent(new CustomEvent('taskflow_data_changed'));
        }}
      />

      <CreateProjectModal
        isOpen={isEditProjectOpen}
        onClose={() => setIsEditProjectOpen(false)}
        initialData={project}
        onSuccess={(updated) => {
          setProject(updated);
          window.dispatchEvent(new CustomEvent('taskflow_data_changed'));
        }}
      />

      <AssignMemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        project={project}
        onSuccess={(updated) => setProject(updated)}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteProject}
        title="Delete Project"
        message={`Are you sure you want to permanently delete "${project.name}"? All associated tasks will be removed.`}
        confirmText="Delete Project"
      />

      <ConfirmModal
        isOpen={isDeleteTaskOpen}
        onClose={() => {
          setIsDeleteTaskOpen(false);
          setDeletingTask(null);
        }}
        onConfirm={confirmDeleteTask}
        title="Delete Task"
        message={`Are you sure you want to delete task "${deletingTask?.title}"?`}
        confirmText="Delete Task"
      />
    </div>
  );
}
