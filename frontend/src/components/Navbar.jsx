import React from 'react';
import { Menu, Plus, FolderPlus, Bell, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onOpenSidebar, onNewProject, onNewTask }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-border px-4 sm:px-6 flex items-center justify-between">
      {/* Left side: Mobile Menu + Quick greeting */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg text-charcoal-400 hover:text-charcoal hover:bg-surface-muted transition-colors"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>
        <div>
          <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider text-charcoal-400">Workspace</span>
          <h2 className="text-base sm:text-lg font-bold text-charcoal leading-none">TaskFlow Hub</h2>
        </div>
      </div>

      {/* Right side: Actions & User pill */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onNewProject && (
          <button
            onClick={onNewProject}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-white hover:bg-surface-muted text-charcoal text-xs font-semibold transition-all shadow-2xs"
          >
            <FolderPlus size={14} className="text-charcoal-500" />
            <span>New Project</span>
          </button>
        )}

        {onNewTask && (
          <button
            onClick={onNewTask}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-lime hover:bg-lime-hover text-charcoal text-xs font-bold transition-all shadow-subtle"
          >
            <Plus size={15} />
            <span>Add Task</span>
          </button>
        )}

        <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

        <div className="flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-full bg-charcoal text-lime flex items-center justify-center font-bold text-xs ring-2 ring-lime/40">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-charcoal leading-tight">{user?.name}</div>
            <div className="text-[10px] text-charcoal-400 leading-none">{user?.role || 'Member'}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
