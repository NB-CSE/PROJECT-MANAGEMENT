import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatCard from '../components/StatCard';
import ProjectCard from '../components/ProjectCard';
import ActivityFeed from '../components/ActivityFeed';
import ProgressBar from '../components/ProgressBar';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  ArrowRight,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();
  const { openTaskModal, openProjectModal } = useOutletContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/dashboard');
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const handleUpdate = () => fetchDashboardData();
    window.addEventListener('taskflow_data_changed', handleUpdate);
    return () => window.removeEventListener('taskflow_data_changed', handleUpdate);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-charcoal-100 rounded-xl w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-charcoal-100 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const {
    totalProjects = 0,
    activeProjects = 0,
    totalTasks = 0,
    completedTasks = 0,
    overdueTasks = 0,
    taskStatusSummary = {},
    recentProjects = [],
    upcomingDeadlines = [],
    recentActivities = []
  } = data || {};

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white border border-border shadow-card relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime/30 text-charcoal text-xs font-bold mb-3 border border-lime-dark/20">
            <Sparkles size={13} />
            <span>Welcome to TaskFlow</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
            Good day, {user?.name?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-sm text-charcoal-400 mt-1 max-w-xl">
            You have <span className="font-bold text-charcoal">{activeProjects} active projects</span> and{' '}
            <span className={`font-bold ${overdueTasks > 0 ? 'text-red-600' : 'text-charcoal'}`}>
              {overdueTasks} overdue tasks
            </span>{' '}
            requiring your attention.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={openProjectModal}
            className="px-4 py-2.5 rounded-xl border border-border bg-white hover:bg-surface-muted text-charcoal text-xs font-bold transition-all shadow-subtle flex items-center gap-1.5"
          >
            <FolderKanban size={15} />
            <span>New Project</span>
          </button>
          <button
            onClick={openTaskModal}
            className="px-4 py-2.5 rounded-xl bg-lime hover:bg-lime-hover text-charcoal text-xs font-black transition-all shadow-subtle flex items-center gap-1.5"
          >
            <Plus size={16} />
            <span>Add Task</span>
          </button>
        </div>

        {/* Decorative subtle background shape */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-lime/10 to-transparent pointer-events-none" />
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Total Projects"
          value={totalProjects}
          subtitle={`${activeProjects} currently active`}
          icon={FolderKanban}
        />
        <StatCard
          title="Completed Tasks"
          value={completedTasks}
          subtitle={`${completionRate}% overall completion rate`}
          icon={CheckCircle2}
          accent={true}
        />
        <StatCard
          title="Tasks in Queue"
          value={(taskStatusSummary['To Do'] || 0) + (taskStatusSummary['In Progress'] || 0)}
          subtitle={`${taskStatusSummary['In Progress'] || 0} in progress`}
          icon={Layers}
        />
        <StatCard
          title="Overdue Tasks"
          value={overdueTasks}
          subtitle={overdueTasks > 0 ? 'Immediate action required' : 'All deadlines in good shape'}
          icon={AlertTriangle}
          badge={
            overdueTasks > 0
              ? { label: 'Status', value: 'Attention Needed' }
              : { label: 'Status', value: 'On Track' }
          }
        />
      </div>

      {/* Main Grid: Projects & Task Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Projects & Task Status Summary */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Projects Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-charcoal tracking-tight">Recent Projects</h2>
                <p className="text-xs text-charcoal-400">Your active workspace initiatives</p>
              </div>
              <Link
                to="/projects"
                className="text-xs font-bold text-charcoal hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {recentProjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recentProjects.map((project) => (
                  <ProjectCard key={project._id} project={project} />
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-white border border-dashed border-border text-center">
                <FolderKanban size={32} className="mx-auto text-charcoal-300 mb-2" />
                <h4 className="text-sm font-bold text-charcoal">No projects created yet</h4>
                <p className="text-xs text-charcoal-400 mt-1 mb-4">
                  Create your first project to start organizing tasks and tracking team progress.
                </p>
                <button
                  onClick={openProjectModal}
                  className="px-4 py-2 rounded-xl bg-lime text-charcoal font-bold text-xs inline-flex items-center gap-1.5 shadow-subtle"
                >
                  <Plus size={15} />
                  <span>Create Project</span>
                </button>
              </div>
            )}
          </div>

          {/* Task Status Breakdown Visual */}
          <div className="p-6 rounded-2xl bg-white border border-border shadow-card">
            <h3 className="text-sm font-bold text-charcoal mb-4">Task Status Breakdown</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 rounded-xl bg-charcoal-50 border border-border">
                <span className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider">To Do</span>
                <div className="text-2xl font-black text-charcoal mt-1">
                  {taskStatusSummary['To Do'] || 0}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">In Progress</span>
                <div className="text-2xl font-black text-amber-900 mt-1">
                  {taskStatusSummary['In Progress'] || 0}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
                <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">Review</span>
                <div className="text-2xl font-black text-purple-900 mt-1">
                  {taskStatusSummary['Review'] || 0}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-lime/20 border border-lime-dark/30">
                <span className="text-[11px] font-bold text-charcoal uppercase tracking-wider">Completed</span>
                <div className="text-2xl font-black text-charcoal mt-1">
                  {taskStatusSummary['Completed'] || 0}
                </div>
              </div>
            </div>

            {/* Visual ratio bar */}
            {totalTasks > 0 && (
              <div className="mt-5 pt-4 border-t border-border">
                <div className="h-3 w-full bg-charcoal-100 rounded-full flex overflow-hidden">
                  <div
                    style={{ width: `${((taskStatusSummary['Completed'] || 0) / totalTasks) * 100}%` }}
                    className="bg-lime"
                    title={`Completed: ${taskStatusSummary['Completed'] || 0}`}
                  />
                  <div
                    style={{ width: `${((taskStatusSummary['Review'] || 0) / totalTasks) * 100}%` }}
                    className="bg-purple-400"
                    title={`Review: ${taskStatusSummary['Review'] || 0}`}
                  />
                  <div
                    style={{ width: `${((taskStatusSummary['In Progress'] || 0) / totalTasks) * 100}%` }}
                    className="bg-amber-400"
                    title={`In Progress: ${taskStatusSummary['In Progress'] || 0}`}
                  />
                  <div
                    style={{ width: `${((taskStatusSummary['To Do'] || 0) / totalTasks) * 100}%` }}
                    className="bg-charcoal-300"
                    title={`To Do: ${taskStatusSummary['To Do'] || 0}`}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Upcoming Deadlines & Recent Activity Feed */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <div className="p-6 rounded-2xl bg-white border border-border shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-charcoal">Upcoming Deadlines</h3>
              <Link to="/tasks" className="text-[11px] font-bold text-charcoal-400 hover:text-charcoal">
                Tasks Board
              </Link>
            </div>

            {upcomingDeadlines.length > 0 ? (
              <div className="space-y-3">
                {upcomingDeadlines.map((task) => {
                  const isTaskOverdue =
                    task.dueDate &&
                    isPast(new Date(task.dueDate)) &&
                    !isToday(new Date(task.dueDate));

                  return (
                    <div
                      key={task._id}
                      className="p-3 rounded-xl border border-border bg-surface-subtle hover:border-charcoal-300 transition-colors flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-charcoal truncate">{task.title}</h4>
                        <p className="text-[11px] text-charcoal-400 truncate mt-0.5">
                          {task.projectId?.name || 'Project'}
                        </p>
                      </div>
                      <div
                        className={`text-[11px] font-bold px-2 py-0.5 rounded whitespace-nowrap shrink-0 ${
                          isTaskOverdue
                            ? 'bg-red-50 text-red-600'
                            : 'bg-charcoal-100 text-charcoal-600'
                        }`}
                      >
                        {format(new Date(task.dueDate), 'MMM d')}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-charcoal-400 py-4 text-center">No upcoming deadlines.</p>
            )}
          </div>

          {/* Activity Feed */}
          <div className="p-6 rounded-2xl bg-white border border-border shadow-card">
            <h3 className="text-sm font-bold text-charcoal mb-4">Recent Activity</h3>
            <ActivityFeed activities={recentActivities} />
          </div>
        </div>
      </div>
    </div>
  );
}
