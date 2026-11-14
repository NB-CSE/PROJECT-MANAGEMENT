import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function CreateTaskModal({
  isOpen,
  onClose,
  onSuccess,
  initialData = null,
  defaultProjectId = null,
  projects = []
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [projectMembers, setProjectMembers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    assignedTo: '',
    priority: 'Medium',
    status: 'To Do',
    dueDate: ''
  });

  // Reset or initialize form
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        projectId: initialData.projectId?._id || initialData.projectId || defaultProjectId || '',
        assignedTo: initialData.assignedTo?._id || initialData.assignedTo || '',
        priority: initialData.priority || 'Medium',
        status: initialData.status || 'To Do',
        dueDate: initialData.dueDate ? initialData.dueDate.substring(0, 10) : ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        projectId: defaultProjectId || (projects.length > 0 ? projects[0]._id : ''),
        assignedTo: '',
        priority: 'Medium',
        status: 'To Do',
        dueDate: ''
      });
    }
  }, [initialData, defaultProjectId, projects, isOpen]);

  // Load project members when projectId changes
  useEffect(() => {
    const fetchMembers = async () => {
      const pid = formData.projectId;
      if (!pid) return;

      // Find in projects list if available
      const foundProject = projects.find((p) => p._id === pid);
      if (foundProject && foundProject.memberIds) {
        setProjectMembers(foundProject.memberIds);
        return;
      }

      try {
        const res = await api.get(`/projects/${pid}`);
        if (res.success && res.project) {
          const members = [];
          if (res.project.ownerId) members.push(res.project.ownerId);
          if (res.project.memberIds) {
            res.project.memberIds.forEach((m) => {
              if (!members.some((existing) => existing._id === m._id)) {
                members.push(m);
              }
            });
          }
          setProjectMembers(members);
        }
      } catch (err) {
        console.error('Failed to fetch members for task modal:', err);
      }
    };

    fetchMembers();
  }, [formData.projectId, projects]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Task title is required');
      return;
    }
    if (!formData.projectId) {
      toast.error('Please select a project');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        assignedTo: formData.assignedTo || null,
        dueDate: formData.dueDate || null
      };

      if (initialData?._id) {
        // Update
        const res = await api.put(`/tasks/${initialData._id}`, payload);
        toast.success(res.message || 'Task updated successfully');
        if (onSuccess) onSuccess(res.task);
      } else {
        // Create
        const res = await api.post('/tasks', payload);
        toast.success(res.message || 'Task created successfully');
        if (onSuccess) onSuccess(res.task);
      }
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Task' : 'Create New Task'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
            Task Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Design responsive navbar component"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent transition-all placeholder:text-charcoal-300"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Add specific details, acceptance criteria, or links..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent transition-all placeholder:text-charcoal-300 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
              Project <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value, assignedTo: '' })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent transition-all"
            >
              <option value="" disabled>Select a project</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
              Assignee
            </label>
            <select
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent transition-all"
            >
              <option value="">Unassigned</option>
              {projectMembers.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name} ({member.email})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-border bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent transition-all"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-border bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent transition-all"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Review">Review</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-border bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-charcoal-500 hover:text-charcoal hover:bg-surface-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-lime hover:bg-lime-hover text-charcoal transition-all shadow-subtle disabled:opacity-50"
          >
            {loading ? 'Saving...' : initialData ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
