import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import ProjectCard from '../components/ProjectCard';
import CreateProjectModal from '../components/CreateProjectModal';
import AssignMemberModal from '../components/AssignMemberModal';
import ConfirmModal from '../components/ConfirmModal';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Archive
} from 'lucide-react';

export default function Projects() {
  const { openProjectModal } = useOutletContext();
  const { toast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals state
  const [editingProject, setEditingProject] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [managingProject, setManagingProject] = useState(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter && statusFilter !== 'All') params.append('status', statusFilter);

      const res = await api.get(`/projects?${params.toString()}`);
      if (res.success) {
        setProjects(res.projects);
      }
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    const handleUpdate = () => fetchProjects();
    window.addEventListener('taskflow_data_changed', handleUpdate);
    return () => window.removeEventListener('taskflow_data_changed', handleUpdate);
  }, []);

  const handleEditClick = (project) => {
    setEditingProject(project);
    setIsEditModalOpen(true);
  };

  const handleManageMembersClick = (project) => {
    setManagingProject(project);
    setIsMemberModalOpen(true);
  };

  const handleDeleteClick = (project) => {
    setDeletingProject(project);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteProject = async () => {
    if (!deletingProject) return;
    try {
      await api.delete(`/projects/${deletingProject._id}`);
      toast.success('Project deleted successfully');
      setProjects((prev) => prev.filter((p) => p._id !== deletingProject._id));
      window.dispatchEvent(new CustomEvent('taskflow_data_changed'));
    } catch (err) {
      toast.error(err.message || 'Failed to delete project');
    }
  };

  const filterOptions = ['All', 'Active', 'Planning', 'On Hold', 'Completed'];

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-charcoal tracking-tight">Projects</h1>
          <p className="text-xs text-charcoal-400 mt-1">
            Organize, monitor, and deliver key company milestones
          </p>
        </div>

        <button
          onClick={openProjectModal}
          className="px-4 py-2.5 rounded-xl bg-lime hover:bg-lime-hover text-charcoal text-xs font-black transition-all shadow-subtle flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-border shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-2.5 text-charcoal-300" size={17} />
          <input
            type="text"
            placeholder="Search projects by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-surface-subtle text-charcoal text-xs focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent transition-all placeholder:text-charcoal-400"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {filterOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setStatusFilter(opt)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                statusFilter === opt
                  ? 'bg-charcoal text-white shadow-2xs'
                  : 'text-charcoal-400 hover:text-charcoal hover:bg-surface-muted'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 bg-charcoal-100 rounded-2xl" />
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onManageMembers={handleManageMembersClick}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-border">
          <FolderKanban size={40} className="mx-auto text-charcoal-300 mb-3" />
          <h3 className="text-base font-bold text-charcoal">No projects found</h3>
          <p className="text-xs text-charcoal-400 mt-1 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'All'
              ? 'Try modifying your search query or status filter.'
              : 'Create your first project to start managing tasks with your team.'}
          </p>
          {!searchTerm && statusFilter === 'All' && (
            <button
              onClick={openProjectModal}
              className="mt-4 px-4 py-2 rounded-xl bg-lime text-charcoal font-bold text-xs inline-flex items-center gap-1.5 shadow-subtle"
            >
              <Plus size={15} />
              <span>Create Project</span>
            </button>
          )}
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <CreateProjectModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingProject(null);
          }}
          initialData={editingProject}
          onSuccess={() => {
            fetchProjects();
            window.dispatchEvent(new CustomEvent('taskflow_data_changed'));
          }}
        />
      )}

      {/* Manage Members Modal */}
      {managingProject && (
        <AssignMemberModal
          isOpen={isMemberModalOpen}
          onClose={() => {
            setIsMemberModalOpen(false);
            setManagingProject(null);
          }}
          project={managingProject}
          onSuccess={(updatedProject) => {
            setProjects((prev) =>
              prev.map((p) => (p._id === updatedProject._id ? { ...p, ...updatedProject } : p))
            );
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingProject(null);
        }}
        onConfirm={confirmDeleteProject}
        title="Delete Project"
        message={`Are you sure you want to permanently delete "${deletingProject?.name}"? All associated tasks and activity records will be deleted.`}
        confirmText="Delete Project"
      />
    </div>
  );
}
