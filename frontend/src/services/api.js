import { clientStore, initialUsers } from './mockStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Check if running in purely static environment (e.g. GitHub Pages)
const isStaticHost =
  typeof window !== 'undefined' &&
  (window.location.hostname.includes('github.io') ||
    (!import.meta.env.VITE_API_URL && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'));

// Offline Mock Fallback Handler
const handleMockRequest = (endpoint, options = {}) => {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};
  const cleanEndpoint = endpoint.split('?')[0];
  const urlParams = new URLSearchParams(endpoint.split('?')[1] || '');

  // 1. Auth routes
  if (cleanEndpoint === '/auth/login' || cleanEndpoint === 'auth/login') {
    const user = initialUsers.find((u) => u.email === (body.email || '').toLowerCase()) || initialUsers[1];
    return {
      success: true,
      token: 'taskflow_demo_jwt_token_2026',
      user,
      message: 'Logged in successfully (Offline Demo Mode)',
    };
  }

  if (cleanEndpoint === '/auth/register' || cleanEndpoint === 'auth/register') {
    const newUser = {
      _id: 'user_' + Date.now(),
      name: body.name || 'Demo User',
      email: body.email,
      role: 'Member',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    };
    return {
      success: true,
      token: 'taskflow_demo_jwt_token_2026',
      user: newUser,
      message: 'Account registered successfully',
    };
  }

  if (cleanEndpoint === '/auth/me' || cleanEndpoint === 'auth/me') {
    const saved = localStorage.getItem('taskflow_user');
    return {
      success: true,
      user: saved ? JSON.parse(saved) : initialUsers[1],
    };
  }

  // 2. Dashboard
  if (cleanEndpoint === '/dashboard' || cleanEndpoint === 'dashboard') {
    return {
      success: true,
      data: clientStore.getDashboardData(),
    };
  }

  // 3. Projects
  if (cleanEndpoint === '/projects' || cleanEndpoint === 'projects') {
    if (method === 'GET') {
      let list = clientStore.getEnrichedProjects();
      const status = urlParams.get('status');
      const search = urlParams.get('search');
      if (status && status !== 'All') {
        list = list.filter((p) => p.status === status);
      }
      if (search) {
        const q = search.toLowerCase();
        list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
      }
      return { success: true, count: list.length, projects: list };
    }
    if (method === 'POST') {
      const created = clientStore.createProject(body);
      return { success: true, project: created };
    }
  }

  if (cleanEndpoint.startsWith('/projects/') || cleanEndpoint.startsWith('projects/')) {
    const id = cleanEndpoint.replace(/^\/?projects\//, '');
    if (method === 'GET') {
      const projects = clientStore.getEnrichedProjects();
      const project = projects.find((p) => p._id === id) || projects[0];
      const tasks = clientStore.getTasks().filter((t) => (t.projectId?._id || t.projectId) === id);
      return { success: true, project, tasks };
    }
    if (method === 'PUT') {
      const updated = clientStore.updateProject(id, body);
      return { success: true, project: updated };
    }
    if (method === 'DELETE') {
      clientStore.deleteProject(id);
      return { success: true, message: 'Project removed' };
    }
  }

  // 4. Tasks
  if (cleanEndpoint === '/tasks' || cleanEndpoint === 'tasks') {
    if (method === 'GET') {
      let list = clientStore.getTasks();
      const projectId = urlParams.get('projectId');
      const status = urlParams.get('status');
      if (projectId) {
        list = list.filter((t) => (t.projectId?._id || t.projectId) === projectId);
      }
      if (status) {
        list = list.filter((t) => t.status === status);
      }
      return { success: true, count: list.length, tasks: list };
    }
    if (method === 'POST') {
      const created = clientStore.createTask(body);
      return { success: true, task: created };
    }
  }

  if (cleanEndpoint.startsWith('/tasks/') || cleanEndpoint.startsWith('tasks/')) {
    const parts = cleanEndpoint.replace(/^\/?tasks\//, '').split('/');
    const id = parts[0];
    const subAction = parts[1];

    if (subAction === 'status' && (method === 'PATCH' || method === 'PUT')) {
      const updated = clientStore.updateTaskStatus(id, body.status);
      return { success: true, task: updated };
    }
    if (method === 'PUT') {
      const updated = clientStore.updateTask(id, body);
      return { success: true, task: updated };
    }
    if (method === 'DELETE') {
      clientStore.deleteTask(id);
      return { success: true, message: 'Task deleted' };
    }
  }

  // 5. Users
  if (cleanEndpoint === '/users' || cleanEndpoint === 'users') {
    return { success: true, users: clientStore.getUsers() };
  }

  // 6. Activities
  if (cleanEndpoint === '/activities' || cleanEndpoint === 'activities') {
    return { success: true, activities: clientStore.getActivities() };
  }

  return { success: true, data: {} };
};

export const request = async (endpoint, options = {}) => {
  // If static hosting without remote VITE_API_URL, resolve from offline client store
  if (isStaticHost && !import.meta.env.VITE_API_URL) {
    return handleMockRequest(endpoint, options);
  }

  const token = localStorage.getItem('taskflow_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('taskflow_token');
        localStorage.removeItem('taskflow_user');
      }
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    // If backend is unreachable, gracefully fall back to client store
    console.info('TaskFlow: backend unreachable, using offline client store fallback.');
    return handleMockRequest(endpoint, options);
  }
};

export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};

export default api;
