// Client-side local storage store for TaskFlow demo and static deployments
const STORAGE_PREFIX = 'taskflow_data_';

const now = new Date();
const futureDate = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
const pastDate = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

export const initialUsers = [
  {
    _id: 'user_naresh',
    name: 'Naresh Kumar',
    email: 'naresh@projectflow.dev',
    role: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  },
  {
    _id: 'user_alex',
    name: 'Alex Rivera',
    email: 'alex@taskflow.dev',
    role: 'Project Lead',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
  },
  {
    _id: 'user_sarah',
    name: 'Sarah Chen',
    email: 'sarah@taskflow.dev',
    role: 'Lead Architect',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
  },
  {
    _id: 'user_michael',
    name: 'Michael Davis',
    email: 'michael@taskflow.dev',
    role: 'Backend Engineer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
  },
  {
    _id: 'user_elena',
    name: 'Elena Rostova',
    email: 'elena@taskflow.dev',
    role: 'Product Designer',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
  },
  {
    _id: 'user_priya',
    name: 'Priya Sharma',
    email: 'priya@taskflow.dev',
    role: 'DevOps & QA',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
  },
];

export const initialProjects = [
  {
    _id: 'proj_1',
    name: 'Elevate Careers Platform',
    description: 'Modern recruitment platform connecting engineering talent with high-growth startups across India with live salary calculators.',
    category: 'Full-Stack Web App',
    status: 'Active',
    priority: 'High',
    budget: '₹4,50,000',
    client: 'Elevate Tech Inc',
    startDate: pastDate(14),
    deadline: futureDate(10),
    ownerId: initialUsers[1],
    memberIds: [initialUsers[0], initialUsers[1], initialUsers[2], initialUsers[5]],
    createdAt: pastDate(14),
  },
  {
    _id: 'proj_2',
    name: 'FORME E-Commerce Store',
    description: 'Premium modern e-commerce storefront with shopping cart, stripe integration, and dynamic catalog.',
    category: 'E-Commerce Platform',
    status: 'Active',
    priority: 'Medium',
    budget: '₹3,00,000',
    client: 'FORME Retail',
    startDate: pastDate(20),
    deadline: futureDate(15),
    ownerId: initialUsers[1],
    memberIds: [initialUsers[1], initialUsers[3], initialUsers[4]],
    createdAt: pastDate(20),
  },
  {
    _id: 'proj_3',
    name: 'SwasthScan AI Health Engine',
    description: 'Ingredient safety inspection and food product nutritional disclosure analyzer with OCR scan.',
    category: 'AI & HealthTech',
    status: 'Active',
    priority: 'Urgent',
    budget: '₹5,00,000',
    client: 'HealthTech Labs',
    startDate: pastDate(7),
    deadline: futureDate(5),
    ownerId: initialUsers[1],
    memberIds: [initialUsers[0], initialUsers[1], initialUsers[2], initialUsers[4]],
    createdAt: pastDate(7),
  },
  {
    _id: 'proj_4',
    name: 'Developer Portfolio Hub',
    description: 'High-performance interactive portfolio showcasing projects, GitHub contributions, and interactive widgets.',
    category: 'Frontend Engineering',
    status: 'Completed',
    priority: 'Low',
    budget: '₹1,00,000',
    client: 'Internal Portfolio',
    startDate: pastDate(30),
    deadline: pastDate(2),
    ownerId: initialUsers[1],
    memberIds: [initialUsers[0], initialUsers[1]],
    createdAt: pastDate(30),
  },
];

export const initialTasks = [
  {
    _id: 'task_1',
    projectId: 'proj_1',
    title: 'Design Salary Intelligence Calculator',
    description: 'Build real-time compensation estimation component using 2026 tech benchmarks across Indian hubs.',
    status: 'Completed',
    priority: 'High',
    tags: ['Frontend', 'UI/UX', 'Feature'],
    checklist: [
      { id: 'c1', text: 'Gather Indian tech salary benchmark dataset', completed: true },
      { id: 'c2', text: 'Build interactive slider and city multiplier', completed: true },
      { id: 'c3', text: 'Integrate dynamic chart rendering', completed: true },
    ],
    estimatedHours: 12,
    assignedToId: initialUsers[2],
    dueDate: pastDate(3),
    createdAt: pastDate(10),
  },
  {
    _id: 'task_2',
    projectId: 'proj_1',
    title: 'Setup GitHub Actions CI/CD Pipeline',
    description: 'Automate build, artifact verification, and GitHub Pages continuous deployment for main branch.',
    status: 'Completed',
    priority: 'High',
    tags: ['DevOps', 'CI/CD'],
    checklist: [
      { id: 'c4', text: 'Configure Node 18 GitHub action runner', completed: true },
      { id: 'c5', text: 'Split build and deploy into two distinct jobs', completed: true },
      { id: 'c6', text: 'Verify 404 spa redirect fallback', completed: true },
    ],
    estimatedHours: 6,
    assignedToId: initialUsers[1],
    dueDate: pastDate(1),
    createdAt: pastDate(9),
  },
  {
    _id: 'task_3',
    projectId: 'proj_1',
    title: 'Implement Application Modal & Resume Upload',
    description: 'Create multi-step modal for candidates to apply with resume preview and cover letter input.',
    status: 'In Progress',
    priority: 'Medium',
    tags: ['Frontend', 'Feature'],
    checklist: [
      { id: 'c7', text: 'File drag-and-drop validation', completed: true },
      { id: 'c8', text: 'Form state persistence with toast alerts', completed: true },
      { id: 'c9', text: 'Application confirmation screen', completed: false },
    ],
    estimatedHours: 8,
    assignedToId: initialUsers[3],
    dueDate: futureDate(4),
    createdAt: pastDate(5),
  },
  {
    _id: 'task_4',
    projectId: 'proj_1',
    title: 'Audit Mobile Responsiveness on Safari & Chrome',
    description: 'Ensure touch targets, drawer menus, and hero text scale fluidly down to 360px viewports.',
    status: 'To Do',
    priority: 'Low',
    tags: ['Testing', 'UI/UX'],
    checklist: [
      { id: 'c10', text: 'Inspect viewport breakpoints on mobile devices', completed: false },
      { id: 'c11', text: 'Fix navigation drawer cutoff on iOS Safari', completed: false },
    ],
    estimatedHours: 4,
    assignedToId: initialUsers[4],
    dueDate: futureDate(8),
    createdAt: pastDate(2),
  },
  {
    _id: 'task_5',
    projectId: 'proj_2',
    title: 'Build Interactive Product Filter Grid',
    description: 'Category pills, price sliders, sorting by popularity, and instant keyword search.',
    status: 'Review',
    priority: 'High',
    tags: ['Frontend', 'Feature'],
    checklist: [
      { id: 'c12', text: 'Search input debouncing', completed: true },
      { id: 'c13', text: 'Multi-category filter badges', completed: true },
      { id: 'c14', text: 'Sort by price & rating', completed: true },
    ],
    estimatedHours: 10,
    assignedToId: initialUsers[4],
    dueDate: futureDate(2),
    createdAt: pastDate(6),
  },
  {
    _id: 'task_6',
    projectId: 'proj_2',
    title: 'Integrate Shopping Cart State & LocalStorage',
    description: 'Persist cart items across browser sessions with quantity increment/decrement controls.',
    status: 'Completed',
    priority: 'Medium',
    tags: ['Frontend', 'State'],
    checklist: [
      { id: 'c15', text: 'CartContext setup', completed: true },
      { id: 'c16', text: 'Local storage sync on every change', completed: true },
      { id: 'c17', text: 'Order summary calculation', completed: true },
    ],
    estimatedHours: 6,
    assignedToId: initialUsers[1],
    dueDate: pastDate(2),
    createdAt: pastDate(8),
  },
  {
    _id: 'task_7',
    projectId: 'proj_3',
    title: 'OCR Label Parsing Accuracy Tuning',
    description: 'Optimize bounding box detection for curved consumer food packages and low-light shots.',
    status: 'In Progress',
    priority: 'Urgent',
    tags: ['AI/ML', 'Backend', 'OCR'],
    checklist: [
      { id: 'c18', text: 'Preprocess raw photos with contrast normalization', completed: true },
      { id: 'c19', text: 'Parse multi-column nutrition facts', completed: false },
      { id: 'c20', text: 'Add allergen regex detector', completed: false },
    ],
    estimatedHours: 16,
    assignedToId: initialUsers[2],
    dueDate: futureDate(3),
    createdAt: pastDate(4),
  },
  {
    _id: 'task_8',
    projectId: 'proj_3',
    title: 'Nutritional Risk Scoring Algorithm',
    description: 'Map processed additives against WHO safety limits to generate consumer-friendly health grades.',
    status: 'To Do',
    priority: 'High',
    tags: ['Algorithm', 'Backend'],
    checklist: [
      { id: 'c21', text: 'Compile WHO additive safety index', completed: false },
      { id: 'c22', text: 'Implement grade calculation (A to E)', completed: false },
    ],
    estimatedHours: 8,
    assignedToId: initialUsers[3],
    dueDate: futureDate(5),
    createdAt: pastDate(3),
  },
  {
    _id: 'task_9',
    projectId: 'proj_4',
    title: 'Deploy Snake Contribution Animation',
    description: 'Configure automated Platane snk workflow to render GitHub contribution grid daily.',
    status: 'Completed',
    priority: 'Low',
    tags: ['DevOps', 'GitHub'],
    checklist: [
      { id: 'c23', text: 'Add GitHub action workflow', completed: true },
      { id: 'c24', text: 'Render SVG dark-mode grid', completed: true },
    ],
    estimatedHours: 2,
    assignedToId: initialUsers[0],
    dueDate: pastDate(5),
    createdAt: pastDate(20),
  },
];

export const initialActivities = [
  {
    _id: 'act_1',
    userId: initialUsers[1],
    action: 'Completed task: Setup GitHub Actions CI/CD Pipeline',
    createdAt: pastDate(1),
  },
  {
    _id: 'act_2',
    userId: initialUsers[2],
    action: 'Completed task: Design Salary Intelligence Calculator',
    createdAt: pastDate(2),
  },
  {
    _id: 'act_3',
    userId: initialUsers[4],
    action: 'Submitted task for Review: Build Interactive Product Filter Grid',
    createdAt: pastDate(2),
  },
  {
    _id: 'act_4',
    userId: initialUsers[1],
    action: 'Created new project: SwasthScan AI Health Engine',
    createdAt: pastDate(7),
  },
];

// Helper to access and store local JSON data
const getStore = (key, fallback) => {
  try {
    const val = localStorage.getItem(STORAGE_PREFIX + key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
};

const setStore = (key, val) => {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(val));
    window.dispatchEvent(new Event('taskflow_data_changed'));
  } catch (e) {
    console.error(e);
  }
};

export const clientStore = {
  getUsers: () => getStore('users', initialUsers),
  getProjects: () => getStore('projects', initialProjects),
  getTasks: () => {
    const tasks = getStore('tasks', initialTasks);
    const users = clientStore.getUsers();
    const projects = clientStore.getProjects();

    // Populate relations
    return tasks.map((t) => {
      const assigned = t.assignedTo || (t.assignedToId ? users.find((u) => u._id === (t.assignedToId?._id || t.assignedToId)) : null);
      const project = t.projectId && typeof t.projectId === 'object' ? t.projectId : projects.find((p) => p._id === t.projectId) || { _id: t.projectId, name: 'Project' };
      return {
        ...t,
        assignedTo: assigned,
        projectId: project,
        checklist: t.checklist || [],
        tags: t.tags || [],
      };
    });
  },
  getActivities: () => getStore('activities', initialActivities),

  resetToDefault: () => {
    try {
      localStorage.removeItem(STORAGE_PREFIX + 'projects');
      localStorage.removeItem(STORAGE_PREFIX + 'tasks');
      localStorage.removeItem(STORAGE_PREFIX + 'activities');
      localStorage.removeItem(STORAGE_PREFIX + 'users');
      window.dispatchEvent(new Event('taskflow_data_changed'));
      return true;
    } catch {
      return false;
    }
  },

  // Calculate project progress dynamically
  getEnrichedProjects: () => {
    const projects = clientStore.getProjects();
    const tasks = clientStore.getTasks();

    return projects.map((p) => {
      const projTasks = tasks.filter((t) => (t.projectId?._id || t.projectId) === p._id);
      const totalTasks = projTasks.length;
      const completedTasks = projTasks.filter((t) => t.status === 'Completed').length;
      const inProgressTasks = projTasks.filter((t) => t.status === 'In Progress').length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        ...p,
        totalTasks,
        completedTasks,
        inProgressTasks,
        progress,
      };
    });
  },

  createProject: (data) => {
    const projects = clientStore.getProjects();
    const users = clientStore.getUsers();
    const newProj = {
      _id: 'proj_' + Date.now(),
      name: data.name,
      description: data.description || '',
      category: data.category || 'General',
      status: data.status || 'Active',
      priority: data.priority || 'Medium',
      budget: data.budget || '—',
      client: data.client || 'Internal',
      startDate: data.startDate || new Date().toISOString(),
      deadline: data.deadline || futureDate(14),
      ownerId: users[1] || users[0],
      memberIds: (data.memberIds || []).map((id) => users.find((u) => u._id === id)).filter(Boolean),
      createdAt: new Date().toISOString(),
    };
    projects.unshift(newProj);
    setStore('projects', projects);

    clientStore.addActivity(`Created new project: ${newProj.name}`);
    return newProj;
  },

  updateProject: (id, data) => {
    const projects = clientStore.getProjects();
    const idx = projects.findIndex((p) => p._id === id);
    if (idx !== -1) {
      projects[idx] = { ...projects[idx], ...data, updatedAt: new Date().toISOString() };
      setStore('projects', projects);
      return projects[idx];
    }
    return null;
  },

  deleteProject: (id) => {
    let projects = clientStore.getProjects();
    const toDelete = projects.find((p) => p._id === id);
    projects = projects.filter((p) => p._id !== id);
    setStore('projects', projects);

    let tasks = clientStore.getTasks();
    tasks = tasks.filter((t) => (t.projectId?._id || t.projectId) !== id);
    setStore('tasks', tasks);

    if (toDelete) clientStore.addActivity(`Deleted project: ${toDelete.name}`);
    return true;
  },

  createTask: (data) => {
    const tasks = getStore('tasks', initialTasks);
    const users = clientStore.getUsers();
    const projects = clientStore.getProjects();

    const assignedId = data.assignedTo?._id || data.assignedTo || data.assignedToId;
    const assigned = users.find((u) => u._id === assignedId) || users[1];
    const projId = data.projectId?._id || data.projectId;
    const project = projects.find((p) => p._id === projId) || projects[0];

    const newTask = {
      _id: 'task_' + Date.now(),
      projectId: project._id,
      title: data.title,
      description: data.description || '',
      status: data.status || 'To Do',
      priority: data.priority || 'Medium',
      tags: data.tags || [],
      checklist: data.checklist || [],
      estimatedHours: data.estimatedHours ? Number(data.estimatedHours) : 0,
      assignedToId: assigned._id,
      dueDate: data.dueDate || futureDate(7),
      createdAt: new Date().toISOString(),
    };
    tasks.unshift(newTask);
    setStore('tasks', tasks);

    clientStore.addActivity(`Created task: ${newTask.title}`);
    return {
      ...newTask,
      assignedTo: assigned,
      projectId: project,
    };
  },

  updateTaskStatus: (id, status) => {
    const tasks = getStore('tasks', initialTasks);
    const idx = tasks.findIndex((t) => t._id === id);
    if (idx !== -1) {
      tasks[idx].status = status;
      setStore('tasks', tasks);
      clientStore.addActivity(`Moved task "${tasks[idx].title}" to ${status}`);
      return tasks[idx];
    }
    return null;
  },

  updateTask: (id, data) => {
    const tasks = getStore('tasks', initialTasks);
    const idx = tasks.findIndex((t) => t._id === id);
    if (idx !== -1) {
      const assignedId = data.assignedTo?._id || data.assignedTo || data.assignedToId || tasks[idx].assignedToId;
      const projId = data.projectId?._id || data.projectId || tasks[idx].projectId;

      tasks[idx] = {
        ...tasks[idx],
        ...data,
        assignedToId: assignedId,
        projectId: projId,
        tags: data.tags || tasks[idx].tags || [],
        checklist: data.checklist || tasks[idx].checklist || [],
        updatedAt: new Date().toISOString(),
      };
      setStore('tasks', tasks);
      return tasks[idx];
    }
    return null;
  },

  toggleChecklistItem: (taskId, checklistItemId) => {
    const tasks = getStore('tasks', initialTasks);
    const task = tasks.find((t) => t._id === taskId);
    if (task && task.checklist) {
      const item = task.checklist.find((c) => c.id === checklistItemId);
      if (item) {
        item.completed = !item.completed;
        setStore('tasks', tasks);
        return task;
      }
    }
    return null;
  },

  deleteTask: (id) => {
    let tasks = getStore('tasks', initialTasks);
    const task = tasks.find((t) => t._id === id);
    tasks = tasks.filter((t) => t._id !== id);
    setStore('tasks', tasks);
    if (task) clientStore.addActivity(`Deleted task: ${task.title}`);
    return true;
  },

  addMember: (data) => {
    const users = clientStore.getUsers();
    const newUser = {
      _id: 'user_' + Date.now(),
      name: data.name,
      email: data.email,
      role: data.role || 'Member',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80`,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    setStore('users', users);
    clientStore.addActivity(`Added team member: ${newUser.name} (${newUser.role})`);
    return newUser;
  },

  addActivity: (action) => {
    const acts = clientStore.getActivities();
    const users = clientStore.getUsers();
    acts.unshift({
      _id: 'act_' + Date.now(),
      userId: users[1] || users[0],
      action,
      createdAt: new Date().toISOString(),
    });
    setStore('activities', acts.slice(0, 25));
  },

  getDashboardData: () => {
    const projects = clientStore.getEnrichedProjects();
    const tasks = clientStore.getTasks();
    const activities = clientStore.getActivities();
    const users = clientStore.getUsers();

    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) => p.status === 'Active').length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'Completed').length;

    const overdueTasks = tasks.filter((t) => {
      if (t.status === 'Completed') return false;
      return t.dueDate && new Date(t.dueDate) < new Date();
    }).length;

    const taskStatusSummary = {
      'To Do': tasks.filter((t) => t.status === 'To Do').length,
      'In Progress': tasks.filter((t) => t.status === 'In Progress').length,
      'Review': tasks.filter((t) => t.status === 'Review').length,
      'Completed': completedTasks,
    };

    const upcomingDeadlines = tasks
      .filter((t) => t.status !== 'Completed' && t.dueDate)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 6);

    // Calculate priority distribution
    const priorityBreakdown = {
      Urgent: tasks.filter((t) => t.priority === 'Urgent').length,
      High: tasks.filter((t) => t.priority === 'High').length,
      Medium: tasks.filter((t) => t.priority === 'Medium').length,
      Low: tasks.filter((t) => t.priority === 'Low').length,
    };

    // Calculate team workload
    const teamWorkload = users.map((u) => {
      const userTasks = tasks.filter((t) => (t.assignedTo?._id || t.assignedTo) === u._id || (t.assignedToId?._id || t.assignedToId) === u._id);
      const done = userTasks.filter((t) => t.status === 'Completed').length;
      return {
        user: u,
        totalAssigned: userTasks.length,
        completed: done,
        active: userTasks.length - done,
      };
    });

    return {
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      overdueTasks,
      taskStatusSummary,
      priorityBreakdown,
      teamWorkload,
      recentProjects: projects.slice(0, 4),
      upcomingDeadlines,
      recentActivities: activities.slice(0, 8),
    };
  },
};
