import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import CreateTaskModal from './CreateTaskModal';
import CreateProjectModal from './CreateProjectModal';
import api from '../services/api';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);

  // Pre-fetch user's projects for quick modal usage
  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      if (res.success) {
        setProjects(res.projects);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenTaskModal = () => {
    fetchProjects();
    setIsTaskModalOpen(true);
  };

  const handleOpenProjectModal = () => {
    setIsProjectModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-charcoal flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onQuickCreate={handleOpenTaskModal}
      />

      {/* Main content wrapper */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Navbar
          onOpenSidebar={() => setSidebarOpen(true)}
          onNewProject={handleOpenProjectModal}
          onNewTask={handleOpenTaskModal}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ openTaskModal: handleOpenTaskModal, openProjectModal: handleOpenProjectModal }} />
        </main>
      </div>

      {/* Quick Create Task Modal */}
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        projects={projects}
        onSuccess={() => {
          // Trigger custom event so active pages can re-fetch
          window.dispatchEvent(new CustomEvent('taskflow_data_changed'));
        }}
      />

      {/* Quick Create Project Modal */}
      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSuccess={() => {
          window.dispatchEvent(new CustomEvent('taskflow_data_changed'));
        }}
      />
    </div>
  );
}
