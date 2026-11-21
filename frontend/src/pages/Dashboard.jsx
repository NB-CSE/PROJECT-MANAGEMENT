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
  Sparkles,
  Download,
  RotateCcw,
  BarChart3,
  Users,
  TrendingUp,
  Flame,
  Zap,
  CheckSquare
} from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { useToast } from '../context/ToastContext';

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
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

  // Export workspace report to CSV
  const handleExportCSV = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        api.get('/projects'),
        api.get('/tasks')
      ]);

      const projects = projRes.projects || [];
      const tasks = taskRes.tasks || [];

      let csvContent = 'data:text/csv;charset=utf-8,';
      csvContent += 'Type,Title/Name,Status,Priority,Due Date,Assignee,Details\n';

      projects.forEach((p) => {
        csvContent += `"Project","${p.name.replace(/"/g, '""')}","${p.status}","${p.priority || 'Normal'}","${p.deadline || ''}","${p.ownerId?.name || ''}","Progress: ${p.progress || 0}%"\n`;
      });

      tasks.forEach((t) => {
        const assigned = t.assignedTo?.name || 'Unassigned';
        csvContent += `"Task","${t.title.replace(/"/g, '""')}","${t.status}","${t.priority}","${t.dueDate || ''}","${assigned}","Project: ${t.projectId?.name || ''}"\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `TaskFlow_Workspace_Report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Workspace report downloaded successfully!');
    } catch (err) {
      toast.error('Failed to export workspace report');
    }
  };

  // Reset workspace to fresh demo data
  const handleResetData = async () => {
    if (window.confirm('Reset workspace to fresh demo data? This will restore sample projects, tasks and members.')) {
      try {
        await api.post('/workspace/reset');
        toast.success('Workspace data restored to default demo state!');
        fetchDashboardData();
      } catch (err) {
        toast.error('Failed to reset workspace');
      }
    }
  };

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
    priorityBreakdown = {},
    teamWorkload = [],
    recentProjects = [],
    upcomingDeadlines = [],
    recentActivities = []
  } = data || {};

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Mock weekly velocity data for chart
  const weeklyDays = [
    { day: 'Mon', completed: 3, created: 4 },
    { day: 'Tue', completed: 5, created: 2 },
    { day: 'Wed', completed: 4, created: 6 },
    { day: 'Thu', completed: 6, created: 3 },
    { day: 'Fri', completed: 8, created: 5 },
    { day: 'Sat', completed: 2, created: 1 },
    { day: 'Sun', completed: 3, created: 2 }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white border border-border shadow-card relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime/30 text-charcoal text-xs font-bold mb-3 border border-lime-dark/20">
            <Sparkles size={13} />
            <span>TaskFlow Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
            Good day, {user?.name?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-sm text-charcoal-400 mt-1 max-w-xl">
            You have <span className="font-bold text-charcoal">{activeProjects} active projects</span> and{' '}
            <span className={`font-bold ${overdueTasks > 0 ? 'text-red-600' : 'text-charcoal'}`}>
              {overdueTasks} overdue tasks
            </span>{' '}
            requiring attention. Overall milestone completion is at{' '}
            <span className="font-bold text-charcoal">{completionRate}%</span>.
          </p>
        </div>

        {/* Quick Actions & Workspace Export */}
        <div className="flex items-center gap-2.5 relative z-10 shrink-0 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl border border-border bg-white hover:bg-surface-muted text-charcoal text-xs font-bold transition-all shadow-subtle flex items-center gap-1.5"
            title="Export CSV Report"
          >
            <Download size={15} />
            <span className="hidden md:inline">Export CSV</span>
          </button>
          <button
            onClick={handleResetData}
            className="px-3.5 py-2.5 rounded-xl border border-border bg-white hover:bg-surface-muted text-charcoal-500 hover:text-charcoal text-xs font-bold transition-all shadow-subtle flex items-center gap-1.5"
            title="Restore Demo Data"
          >
            <RotateCcw size={15} />
          </button>
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

        {/* Decorative subtle background gradient */}
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
          subtitle={`${taskStatusSummary['In Progress'] || 0} in active sprint`}
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

      {/* Analytics Row: Velocity Trends & Priority Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Sprint Velocity Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-border shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-charcoal" />
                <h3 className="text-base font-bold text-charcoal">Weekly Delivery Velocity</h3>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-md bg-lime" />
                  <span className="text-charcoal-500">Completed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-md bg-charcoal-300" />
                  <span className="text-charcoal-500">Created</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-charcoal-400 mb-6">
              Task burnup across the past 7 days showing team momentum and throughput
            </p>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-44 flex items-end justify-between gap-3 pt-6 border-b border-border pb-2">
            {weeklyDays.map((d, idx) => {
              const maxVal = 10;
              const completedH = (d.completed / maxVal) * 100;
              const createdH = (d.created / maxVal) * 100;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1.5 h-full">
                    <div
                      style={{ height: `${createdH}%` }}
                      className="w-3 sm:w-4 bg-charcoal-200 group-hover:bg-charcoal-300 rounded-t-md transition-all relative"
                      title={`Created: ${d.created}`}
                    />
                    <div
                      style={{ height: `${completedH}%` }}
                      className="w-3 sm:w-4 bg-lime group-hover:bg-lime-hover rounded-t-md transition-all relative shadow-2xs"
                      title={`Completed: ${d.completed}`}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-charcoal-400 group-hover:text-charcoal">
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between pt-3 text-xs text-charcoal-400 font-semibold">
            <span>Average velocity: 4.5 tasks/day</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <TrendingUp size={13} />
              <span>+18% vs last sprint</span>
            </span>
          </div>
        </div>

        {/* Right Col: Priority Breakdown Card */}
        <div className="p-6 rounded-3xl bg-white border border-border shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-charcoal flex items-center gap-2">
                <Flame size={18} className="text-red-500" />
                <span>Priority Index</span>
              </h3>
              <span className="text-xs font-bold text-charcoal-400">{totalTasks} tasks</span>
            </div>
            <p className="text-xs text-charcoal-400 mb-5">
              Workload urgency categorization across all workspace projects
            </p>

            {/* Priority Bars */}
            <div className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-red-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                    Urgent
                  </span>
                  <span>{priorityBreakdown.Urgent || 0} tasks</span>
                </div>
                <div className="h-2 w-full bg-charcoal-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500"
                    style={{ width: `${totalTasks > 0 ? ((priorityBreakdown.Urgent || 0) / totalTasks) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-amber-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                    High
                  </span>
                  <span>{priorityBreakdown.High || 0} tasks</span>
                </div>
                <div className="h-2 w-full bg-charcoal-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500"
                    style={{ width: `${totalTasks > 0 ? ((priorityBreakdown.High || 0) / totalTasks) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-blue-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                    Medium
                  </span>
                  <span>{priorityBreakdown.Medium || 0} tasks</span>
                </div>
                <div className="h-2 w-full bg-charcoal-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${totalTasks > 0 ? ((priorityBreakdown.Medium || 0) / totalTasks) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-charcoal-500 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-charcoal-400 inline-block" />
                    Low
                  </span>
                  <span>{priorityBreakdown.Low || 0} tasks</span>
                </div>
                <div className="h-2 w-full bg-charcoal-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-charcoal-400"
                    style={{ width: `${totalTasks > 0 ? ((priorityBreakdown.Low || 0) / totalTasks) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border mt-4">
            <Link
              to="/tasks"
              className="text-xs font-bold text-charcoal hover:underline flex items-center justify-between"
            >
              <span>View priority backlog</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Projects & Task Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Projects & Task Status Summary */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Projects Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-charcoal tracking-tight">Active Projects</h2>
                <p className="text-xs text-charcoal-400">Current initiatives with progress and deadlines</p>
              </div>
              <Link
                to="/projects"
                className="text-xs font-bold text-charcoal hover:underline flex items-center gap-1"
              >
                <span>View all ({totalProjects})</span>
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
          <div className="p-6 rounded-3xl bg-white border border-border shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-charcoal">Task Pipeline Distribution</h3>
              <Link to="/tasks" className="text-xs font-bold text-charcoal hover:underline flex items-center gap-1">
                <span>Open Kanban Board</span>
                <ArrowRight size={13} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-2xl bg-charcoal-50 border border-border">
                <span className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider">To Do</span>
                <div className="text-2xl font-black text-charcoal mt-1">
                  {taskStatusSummary['To Do'] || 0}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">In Progress</span>
                <div className="text-2xl font-black text-amber-900 mt-1">
                  {taskStatusSummary['In Progress'] || 0}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200">
                <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">Review</span>
                <div className="text-2xl font-black text-purple-900 mt-1">
                  {taskStatusSummary['Review'] || 0}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-lime/20 border border-lime-dark/30">
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

          {/* Team Workload Matrix Preview */}
          {teamWorkload.length > 0 && (
            <div className="p-6 rounded-3xl bg-white border border-border shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-charcoal flex items-center gap-2">
                  <Users size={16} />
                  <span>Team Workload Allocation</span>
                </h3>
                <Link to="/team" className="text-xs font-bold text-charcoal hover:underline">
                  Full Roster
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {teamWorkload.slice(0, 6).map((m) => (
                  <div key={m.user._id} className="p-3 rounded-2xl border border-border bg-surface-subtle flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-charcoal text-lime font-black text-xs flex items-center justify-center shrink-0">
                      {m.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-charcoal truncate">{m.user.name}</div>
                      <div className="text-[11px] text-charcoal-400 mt-0.5 flex items-center gap-1.5">
                        <span className="font-semibold text-charcoal">{m.active} active</span>
                        <span>•</span>
                        <span>{m.completed} done</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Upcoming Deadlines & Recent Activity Feed */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <div className="p-6 rounded-3xl bg-white border border-border shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-charcoal flex items-center gap-2">
                <Clock size={16} className="text-charcoal-400" />
                <span>Upcoming Deadlines</span>
              </h3>
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
                      className="p-3 rounded-2xl border border-border bg-surface-subtle hover:border-charcoal-300 transition-colors flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-charcoal truncate">{task.title}</h4>
                        <p className="text-[11px] text-charcoal-400 truncate mt-0.5">
                          {task.projectId?.name || 'Project'}
                        </p>
                      </div>
                      <div
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-lg whitespace-nowrap shrink-0 ${
                          isTaskOverdue
                            ? 'bg-red-50 text-red-600 border border-red-200'
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
          <div className="p-6 rounded-3xl bg-white border border-border shadow-card">
            <h3 className="text-sm font-bold text-charcoal mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-lime-dark" />
              <span>Real-Time Activity Audit</span>
            </h3>
            <ActivityFeed activities={recentActivities} />
          </div>
        </div>
      </div>
    </div>
  );
}
