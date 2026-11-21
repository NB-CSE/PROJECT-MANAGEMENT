import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { Plus, X, Tag, CheckSquare, Clock } from 'lucide-react';

const COMMON_TAGS = [
  'Frontend',
  'Backend',
  'UI/UX',
  'Feature',
  'Bug',
  'Testing',
  'DevOps',
  'Database',
  'Security',
  'AI/ML'
];

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
  const [subtaskInput, setSubtaskInput] = useState('');
  const [customTagInput, setCustomTagInput] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    assignedTo: '',
    priority: 'Medium',
    status: 'To Do',
    dueDate: '',
    estimatedHours: '',
    tags: [],
    checklist: []
  });

  // Reset or initialize form
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        projectId: initialData.projectId?._id || initialData.projectId || defaultProjectId || '',
        assignedTo: initialData.assignedTo?._id || initialData.assignedTo || initialData.assignedToId?._id || initialData.assignedToId || '',
        priority: initialData.priority || 'Medium',
        status: initialData.status || 'To Do',
        dueDate: initialData.dueDate ? initialData.dueDate.substring(0, 10) : '',
        estimatedHours: initialData.estimatedHours || '',
        tags: Array.isArray(initialData.tags) ? [...initialData.tags] : [],
        checklist: Array.isArray(initialData.checklist) ? [...initialData.checklist] : []
      });
    } else {
      setFormData({
        title: '',
        description: '',
        projectId: defaultProjectId || (projects.length > 0 ? projects[0]._id : ''),
        assignedTo: '',
        priority: 'Medium',
        status: 'To Do',
        dueDate: '',
        estimatedHours: '',
        tags: [],
        checklist: []
      });
    }
  }, [initialData, defaultProjectId, projects, isOpen]);

  // Load project members when projectId changes
  useEffect(() => {
    const fetchMembers = async () => {
      const pid = formData.projectId;
      if (!pid) return;

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

  const handleAddSubtask = () => {
    if (!subtaskInput.trim()) return;
    const newItem = {
      id: 'chk_' + Date.now(),
      text: subtaskInput.trim(),
      completed: false
    };
    setFormData((prev) => ({
      ...prev,
      checklist: [...prev.checklist, newItem]
    }));
    setSubtaskInput('');
  };

  const handleRemoveSubtask = (id) => {
    setFormData((prev) => ({
      ...prev,
      checklist: prev.checklist.filter((c) => c.id !== id)
    }));
  };

  const toggleTag = (tag) => {
    setFormData((prev) => {
      const exists = prev.tags.includes(tag);
      return {
        ...prev,
        tags: exists ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag]
      };
    });
  };

  const handleAddCustomTag = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!customTagInput.trim()) return;
      const tag = customTagInput.trim();
      if (!formData.tags.includes(tag)) {
        setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
      }
      setCustomTagInput('');
    }
  };

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
        dueDate: formData.dueDate || null,
        estimatedHours: formData.estimatedHours ? Number(formData.estimatedHours) : 0
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
      title={initialData?._id ? 'Edit Task' : 'Create New Task'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto px-1">
        {/* Title */}
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

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            rows={2}
            placeholder="Add specific details, acceptance criteria, or links..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl border border-border bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent transition-all placeholder:text-charcoal-300 resize-none"
          />
        </div>

        {/* Project & Assignee */}
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

        {/* Priority, Status, Due Date */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

        {/* Estimated Hours */}
        <div>
          <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Clock size={13} />
            <span>Estimated Effort (Hours)</span>
          </label>
          <input
            type="number"
            min="0"
            max="200"
            placeholder="e.g. 8"
            value={formData.estimatedHours}
            onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-border bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent transition-all placeholder:text-charcoal-300"
          />
        </div>

        {/* Tags Selection */}
        <div>
          <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Tag size={13} />
            <span>Tags & Labels</span>
          </label>
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            {COMMON_TAGS.map((tag) => {
              const selected = formData.tags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                    selected
                      ? 'bg-lime text-charcoal border-lime-dark/40 shadow-2xs'
                      : 'bg-surface-subtle text-charcoal-500 border-border hover:border-charcoal-300'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
          <input
            type="text"
            placeholder="Type custom tag and press Enter..."
            value={customTagInput}
            onChange={(e) => setCustomTagInput(e.target.value)}
            onKeyDown={handleAddCustomTag}
            className="w-full px-3 py-1.5 rounded-lg border border-border bg-white text-charcoal text-xs focus:outline-none focus:ring-2 focus:ring-lime placeholder:text-charcoal-300"
          />
        </div>

        {/* Checklist Subtasks Builder */}
        <div>
          <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <CheckSquare size={13} />
            <span>Checklist / Subtasks</span>
          </label>

          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              placeholder="Add a checklist item..."
              value={subtaskInput}
              onChange={(e) => setSubtaskInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSubtask();
                }
              }}
              className="flex-1 px-3 py-1.5 rounded-xl border border-border bg-white text-charcoal text-xs focus:outline-none focus:ring-2 focus:ring-lime placeholder:text-charcoal-300"
            />
            <button
              type="button"
              onClick={handleAddSubtask}
              className="px-3 py-1.5 rounded-xl bg-charcoal text-white text-xs font-bold hover:bg-charcoal-800 transition-colors flex items-center gap-1"
            >
              <Plus size={13} />
              <span>Add</span>
            </button>
          </div>

          {formData.checklist.length > 0 && (
            <div className="space-y-1.5 max-h-32 overflow-y-auto p-2 rounded-xl bg-surface-subtle border border-border">
              {formData.checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white border border-border text-xs"
                >
                  <span className="font-semibold text-charcoal truncate">{item.text}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(item.id)}
                    className="p-1 text-charcoal-400 hover:text-red-500 rounded transition-colors"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
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
            className="px-5 py-2.5 rounded-xl bg-lime hover:bg-lime-hover text-charcoal font-black text-sm transition-all shadow-subtle disabled:opacity-50"
          >
            {loading ? 'Saving...' : initialData?._id ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
