const bcrypt = require('bcryptjs');

// Password hash for demo users (Password: Password123)
const salt = bcrypt.genSaltSync(10);
const passwordHash = bcrypt.hashSync('Password123', salt);

const initialUsers = [
  {
    _id: '665000000000000000000001',
    name: 'Naresh Kumar',
    email: 'naresh@projectflow.dev',
    passwordHash,
    role: 'Admin',
    createdAt: new Date(),
  },
  {
    _id: '665000000000000000000002',
    name: 'Alex Rivera',
    email: 'alex@taskflow.dev',
    passwordHash,
    role: 'Admin',
    createdAt: new Date(),
  },
  {
    _id: '665000000000000000000003',
    name: 'Sarah Chen',
    email: 'sarah@taskflow.dev',
    passwordHash,
    role: 'Manager',
    createdAt: new Date(),
  },
  {
    _id: '665000000000000000000004',
    name: 'Michael Davis',
    email: 'michael@taskflow.dev',
    passwordHash,
    role: 'Member',
    createdAt: new Date(),
  },
  {
    _id: '665000000000000000000005',
    name: 'Elena Rostova',
    email: 'elena@taskflow.dev',
    passwordHash,
    role: 'Member',
    createdAt: new Date(),
  },
];

const now = new Date();
const futureDate = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
const pastDate = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

const nareshId = '665000000000000000000001';
const alexId = '665000000000000000000002';
const sarahId = '665000000000000000000003';
const michaelId = '665000000000000000000004';
const elenaId = '665000000000000000000005';
const allMembers = [nareshId, alexId, sarahId, michaelId, elenaId];

const initialProjects = [
  {
    _id: '665100000000000000000001',
    name: 'Job Board Platform (Elevate Careers)',
    description: 'Full-stack recruitment and talent discovery portal with salary intelligence, resume uploads, and dual employer/candidate dashboards.',
    category: 'Full-Stack Web Application (MERN)',
    githubUrl: 'https://github.com/naresh/job-board-platform',
    liveUrl: 'http://localhost:5173',
    techStack: ['React 19', 'Node.js', 'Express', 'Tailwind CSS', 'MongoDB', 'JWT', 'Multer', 'Nodemailer'],
    ownerId: nareshId,
    memberIds: allMembers,
    startDate: pastDate(14),
    deadline: futureDate(7),
    status: 'Active',
    createdAt: pastDate(14),
  },
  {
    _id: '665100000000000000000002',
    name: 'E-Commerce Web (ShopFlow Platform)',
    description: 'Full-stack shopping platform with product catalog, cart management, checkout flow, Dockerization, and Render deployment.',
    category: 'Full-Stack E-Commerce & Microservices',
    githubUrl: 'https://github.com/naresh/e-com-web',
    liveUrl: 'http://localhost:5175',
    techStack: ['React', 'Vite', 'Node.js', 'Express', 'MongoDB', 'Docker', 'Render'],
    ownerId: nareshId,
    memberIds: allMembers,
    startDate: pastDate(21),
    deadline: futureDate(12),
    status: 'Active',
    createdAt: pastDate(21),
  },
  {
    _id: '665100000000000000000003',
    name: 'Interactive Quiz Maker & Evaluation Engine',
    description: 'Dynamic interactive quiz creation, countdown timer, multiple-choice evaluation, scoring engine, and result analytics.',
    category: 'Interactive Frontend Web Application',
    githubUrl: 'https://github.com/naresh/quiz-maker',
    liveUrl: 'http://localhost:5176',
    techStack: ['HTML5', 'CSS3', 'JavaScript (ES6+)', 'LocalStorage API'],
    ownerId: nareshId,
    memberIds: [nareshId, alexId, elenaId],
    startDate: pastDate(30),
    deadline: pastDate(2),
    status: 'Completed',
    createdAt: pastDate(30),
  },
  {
    _id: '665100000000000000000004',
    name: 'Modern Responsive Landing Page',
    description: 'High-conversion product landing page featuring responsive hero sections, interactive testimonials, pricing tiers, and smooth CSS transitions.',
    category: 'Responsive UI/UX Web Design',
    githubUrl: 'https://github.com/naresh/modern-landing-page',
    liveUrl: 'http://localhost:5177',
    techStack: ['HTML5', 'Modern CSS', 'JavaScript', 'Flexbox & Grid'],
    ownerId: nareshId,
    memberIds: [nareshId, sarahId, elenaId],
    startDate: pastDate(25),
    deadline: pastDate(5),
    status: 'Completed',
    createdAt: pastDate(25),
  },
  {
    _id: '665100000000000000000005',
    name: 'Interactive Web Calculator (My-Calculator)',
    description: 'Sleek, responsive web calculator with scientific arithmetic functions, keyboard event listeners, memory recall, and history log.',
    category: 'JavaScript Web Utility',
    githubUrl: 'https://github.com/naresh/my-calculator',
    liveUrl: 'http://localhost:5178',
    techStack: ['JavaScript', 'HTML5', 'CSS3', 'CSS Grid'],
    ownerId: nareshId,
    memberIds: [nareshId, michaelId],
    startDate: pastDate(35),
    deadline: pastDate(10),
    status: 'Completed',
    createdAt: pastDate(35),
  },
  {
    _id: '665100000000000000000006',
    name: 'Developer Portfolio (Naresh Portfolio)',
    description: 'Multi-page developer portfolio showcasing skills, GitHub repositories, interactive project previews, experience timeline, and contact form.',
    category: 'Personal Branding & Showcase',
    githubUrl: 'https://github.com/naresh/developer-portfolio',
    liveUrl: 'http://localhost:5179',
    techStack: ['React', 'Vite', 'Tailwind CSS', 'EmailJS', 'GitHub API'],
    ownerId: nareshId,
    memberIds: allMembers,
    startDate: pastDate(18),
    deadline: futureDate(5),
    status: 'Active',
    createdAt: pastDate(18),
  },
];

const initialTasks = [
  // Job Board Tasks
  {
    _id: '665200000000000000000001',
    title: 'Implement JWT auth & role-based middleware',
    description: 'Configure bcrypt password hashing and token validation for candidates and employers.',
    projectId: '665100000000000000000001',
    assignedTo: nareshId,
    createdBy: nareshId,
    priority: 'High',
    status: 'Completed',
    dueDate: pastDate(8),
    createdAt: pastDate(14),
  },
  {
    _id: '665200000000000000000002',
    title: 'Build Multer resume upload pipeline with PDF validation',
    description: 'Restrict uploads to PDF, DOC, DOCX up to 5MB and protect resume download endpoints.',
    projectId: '665100000000000000000001',
    assignedTo: alexId,
    createdBy: nareshId,
    priority: 'High',
    status: 'Completed',
    dueDate: pastDate(5),
    createdAt: pastDate(12),
  },
  {
    _id: '665200000000000000000003',
    title: 'Develop 2026 India Tech Salary & Skills Calculator',
    description: 'Create interactive calculator widget with city multipliers for Bengaluru, Pune, Hyderabad.',
    projectId: '665100000000000000000001',
    assignedTo: sarahId,
    createdBy: nareshId,
    priority: 'Medium',
    status: 'Completed',
    dueDate: pastDate(2),
    createdAt: pastDate(8),
  },
  {
    _id: '665200000000000000000004',
    title: 'Employer applicant review & status email dispatcher',
    description: 'Send automated candidate status update emails via Nodemailer when reviewing applications.',
    projectId: '665100000000000000000001',
    assignedTo: michaelId,
    createdBy: nareshId,
    priority: 'High',
    status: 'In Progress',
    dueDate: futureDate(2),
    createdAt: pastDate(4),
  },
  {
    _id: '665200000000000000000005',
    title: 'Configure Vercel & Render production deployment',
    description: 'Set up environment variables, build commands, and verify SSL endpoints.',
    projectId: '665100000000000000000001',
    assignedTo: nareshId,
    createdBy: nareshId,
    priority: 'High',
    status: 'Review',
    dueDate: futureDate(4),
    createdAt: pastDate(3),
  },
  {
    _id: '665200000000000000000006',
    title: 'Set up production SMTP mailer credentials',
    description: 'Connect official SMTP relay to send live candidate alerts and verify SPF/DKIM records.',
    projectId: '665100000000000000000001',
    assignedTo: elenaId,
    createdBy: nareshId,
    priority: 'Medium',
    status: 'To Do',
    dueDate: futureDate(7),
    createdAt: pastDate(2),
  },

  // E-Commerce Web Tasks
  {
    _id: '665200000000000000000007',
    title: 'Product catalog REST API with category filters',
    description: 'Build backend endpoints for fetching products, price range filters, and search queries.',
    projectId: '665100000000000000000002',
    assignedTo: michaelId,
    createdBy: nareshId,
    priority: 'High',
    status: 'Completed',
    dueDate: pastDate(12),
    createdAt: pastDate(20),
  },
  {
    _id: '665200000000000000000008',
    title: 'Shopping cart state management & local storage sync',
    description: 'Create React context for cart items, item quantity updates, and cart subtotal calculation.',
    projectId: '665100000000000000000002',
    assignedTo: sarahId,
    createdBy: nareshId,
    priority: 'High',
    status: 'Completed',
    dueDate: pastDate(7),
    createdAt: pastDate(15),
  },
  {
    _id: '665200000000000000000009',
    title: 'Docker Compose multi-container setup',
    description: 'Containerize frontend client, backend server, and MongoDB service in docker-compose.yml.',
    projectId: '665100000000000000000002',
    assignedTo: nareshId,
    createdBy: nareshId,
    priority: 'Medium',
    status: 'Completed',
    dueDate: pastDate(3),
    createdAt: pastDate(10),
  },
  {
    _id: '665200000000000000000010',
    title: 'Razorpay / Stripe payment gateway integration',
    description: 'Implement secure checkout webhook verifying digital signatures and payment status.',
    projectId: '665100000000000000000002',
    assignedTo: alexId,
    createdBy: nareshId,
    priority: 'Urgent',
    status: 'In Progress',
    dueDate: futureDate(3),
    createdAt: pastDate(5),
  },
  {
    _id: '665200000000000000000011',
    title: 'User order history tracking and email invoice generator',
    description: 'Store orders in database and generate downloadable PDF invoice with purchase receipt.',
    projectId: '665100000000000000000002',
    assignedTo: elenaId,
    createdBy: nareshId,
    priority: 'Medium',
    status: 'To Do',
    dueDate: futureDate(10),
    createdAt: pastDate(3),
  },

  // Quiz Maker Tasks
  {
    _id: '665200000000000000000012',
    title: 'Build interactive quiz UI with animated timers',
    description: 'Design countdown timer per question and progress indicator across quiz modules.',
    projectId: '665100000000000000000003',
    assignedTo: elenaId,
    createdBy: nareshId,
    priority: 'High',
    status: 'Completed',
    dueDate: pastDate(15),
    createdAt: pastDate(28),
  },
  {
    _id: '665200000000000000000013',
    title: 'Score calculation algorithm with instant feedback',
    description: 'Evaluate answers immediately, display review breakdown, and calculate grade score percentage.',
    projectId: '665100000000000000000003',
    assignedTo: nareshId,
    createdBy: nareshId,
    priority: 'High',
    status: 'Completed',
    dueDate: pastDate(10),
    createdAt: pastDate(25),
  },

  // Modern Landing Page Tasks
  {
    _id: '665200000000000000000014',
    title: 'Mobile-first responsive CSS layout',
    description: 'Implement modern Flexbox and CSS Grid breakpoints for flawless mobile, tablet, and desktop views.',
    projectId: '665100000000000000000004',
    assignedTo: sarahId,
    createdBy: nareshId,
    priority: 'High',
    status: 'Completed',
    dueDate: pastDate(14),
    createdAt: pastDate(24),
  },
  {
    _id: '665200000000000000000015',
    title: 'Interactive monthly vs annual pricing tier toggle',
    description: 'Add smooth tab toggle showing 20% discount on annual subscriptions with dynamic card updates.',
    projectId: '665100000000000000000004',
    assignedTo: nareshId,
    createdBy: nareshId,
    priority: 'Medium',
    status: 'Completed',
    dueDate: pastDate(8),
    createdAt: pastDate(20),
  },

  // Calculator Tasks
  {
    _id: '665200000000000000000016',
    title: 'Arithmetic calculation logic with PEMDAS priority',
    description: 'Build mathematical parser handling decimals, negative numbers, and chained operations.',
    projectId: '665100000000000000000005',
    assignedTo: michaelId,
    createdBy: nareshId,
    priority: 'High',
    status: 'Completed',
    dueDate: pastDate(20),
    createdAt: pastDate(32),
  },
  {
    _id: '665200000000000000000017',
    title: 'Keyboard shortcut event listeners',
    description: 'Capture keyboard events for numbers, arithmetic symbols, backspace, and Enter keys.',
    projectId: '665100000000000000000005',
    assignedTo: nareshId,
    createdBy: nareshId,
    priority: 'Medium',
    status: 'Completed',
    dueDate: pastDate(15),
    createdAt: pastDate(30),
  },

  // Portfolio Tasks
  {
    _id: '665200000000000000000018',
    title: 'Multi-page structure (Home, Projects, Skills, Contact)',
    description: 'Architect clean routing for separate showcase pages highlighting all developed web applications.',
    projectId: '665100000000000000000006',
    assignedTo: nareshId,
    createdBy: nareshId,
    priority: 'High',
    status: 'Completed',
    dueDate: pastDate(10),
    createdAt: pastDate(17),
  },
  {
    _id: '665200000000000000000019',
    title: 'Interactive live project showcase embedding screenshots & links',
    description: 'Connect direct links to Job Board, E-Com, Quiz Maker, Calculator, and Landing Page repositories.',
    projectId: '665100000000000000000006',
    assignedTo: sarahId,
    createdBy: nareshId,
    priority: 'High',
    status: 'In Progress',
    dueDate: futureDate(1),
    createdAt: pastDate(6),
  },
  {
    _id: '665200000000000000000020',
    title: 'Custom domain DNS and SSL certification',
    description: 'Point portfolio custom domain and verify HTTPS security certificates.',
    projectId: '665100000000000000000006',
    assignedTo: alexId,
    createdBy: nareshId,
    priority: 'Medium',
    status: 'Review',
    dueDate: futureDate(5),
    createdAt: pastDate(4),
  },
];

const initialActivities = [
  {
    _id: '665300000000000000000001',
    projectId: '665100000000000000000001',
    userId: nareshId,
    action: 'Completed task "Develop 2026 India Tech Salary & Skills Calculator"',
    createdAt: pastDate(1),
  },
  {
    _id: '665300000000000000000002',
    projectId: '665100000000000000000002',
    userId: alexId,
    action: 'Moved "Razorpay / Stripe payment gateway integration" to In Progress',
    createdAt: pastDate(2),
  },
  {
    _id: '665300000000000000000003',
    projectId: '665100000000000000000006',
    userId: sarahId,
    action: 'Started work on "Interactive live project showcase embedding screenshots & links"',
    createdAt: pastDate(3),
  },
  {
    _id: '665300000000000000000004',
    projectId: '665100000000000000000001',
    userId: nareshId,
    action: 'Moved "Configure Vercel & Render production deployment" to Review',
    createdAt: pastDate(4),
  },
];

class InMemoryStore {
  constructor() {
    this.users = [...initialUsers];
    this.projects = [...initialProjects];
    this.tasks = [...initialTasks];
    this.activities = [...initialActivities];
  }

  // Users
  findUserByEmail(email) {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.users.find((u) => u._id.toString() === id.toString());
  }

  createUser(userData) {
    const newUser = {
      _id: 'user_' + Date.now() + Math.floor(Math.random() * 1000),
      createdAt: new Date(),
      ...userData,
    };
    this.users.push(newUser);
    return newUser;
  }

  // Projects
  findProjectsForUser(userId, { search, status }) {
    let result = this.projects.filter(
      (p) =>
        p.ownerId.toString() === userId.toString() ||
        (p.memberIds && p.memberIds.some((m) => m.toString() === userId.toString()))
    );

    if (status && status !== 'All') {
      result = result.filter((p) => p.status === status);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.category && p.category.toLowerCase().includes(q))
      );
    }

    // Attach populated owner & members + task stats
    return result
      .map((p) => {
        const owner = this.findUserById(p.ownerId);
        const members = (p.memberIds || []).map((mId) => this.findUserById(mId)).filter(Boolean);
        const projectTasks = this.tasks.filter((t) => t.projectId.toString() === p._id.toString());
        const totalTasks = projectTasks.length;
        const completedTasks = projectTasks.filter((t) => t.status === 'Completed').length;
        const inProgressTasks = projectTasks.filter((t) => t.status === 'In Progress').length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
          ...p,
          ownerId: owner ? { _id: owner._id, name: owner.name, email: owner.email } : null,
          memberIds: members.map((m) => ({ _id: m._id, name: m.name, email: m.email })),
          totalTasks,
          completedTasks,
          inProgressTasks,
          progress,
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  findProjectById(id) {
    const p = this.projects.find((pr) => pr._id.toString() === id.toString());
    if (!p) return null;

    const owner = this.findUserById(p.ownerId);
    const members = (p.memberIds || []).map((mId) => this.findUserById(mId)).filter(Boolean);
    const projectTasks = this.tasks.filter((t) => t.projectId.toString() === p._id.toString());
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter((t) => t.status === 'Completed').length;
    const inProgressTasks = projectTasks.filter((t) => t.status === 'In Progress').length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      ...p,
      ownerId: owner ? { _id: owner._id, name: owner.name, email: owner.email } : null,
      memberIds: members.map((m) => ({ _id: m._id, name: m.name, email: m.email })),
      totalTasks,
      completedTasks,
      inProgressTasks,
      progress,
    };
  }

  createProject(projectData) {
    const newProject = {
      _id: 'proj_' + Date.now() + Math.floor(Math.random() * 1000),
      createdAt: new Date(),
      status: 'Active',
      memberIds: [projectData.ownerId],
      techStack: [],
      ...projectData,
    };
    this.projects.unshift(newProject);
    return newProject;
  }

  updateProject(id, updateData) {
    const index = this.projects.findIndex((p) => p._id.toString() === id.toString());
    if (index !== -1) {
      this.projects[index] = { ...this.projects[index], ...updateData };
      return this.projects[index];
    }
    return null;
  }

  deleteProject(id) {
    const index = this.projects.findIndex((p) => p._id.toString() === id.toString());
    if (index !== -1) {
      this.projects.splice(index, 1);
      // Remove tasks
      this.tasks = this.tasks.filter((t) => t.projectId.toString() !== id.toString());
      return true;
    }
    return false;
  }

  // Tasks
  findTasks({ projectId, status, priority, assignedTo, search, userId }) {
    let result = [...this.tasks];

    if (projectId) {
      result = result.filter((t) => t.projectId.toString() === projectId.toString());
    }

    if (status && status !== 'All') {
      result = result.filter((t) => t.status === status);
    }

    if (priority && priority !== 'All') {
      result = result.filter((t) => t.priority === priority);
    }

    if (assignedTo) {
      if (assignedTo === 'me' && userId) {
        result = result.filter((t) => t.assignedTo && t.assignedTo.toString() === userId.toString());
      } else if (assignedTo === 'unassigned') {
        result = result.filter((t) => !t.assignedTo);
      } else {
        result = result.filter((t) => t.assignedTo && t.assignedTo.toString() === assignedTo.toString());
      }
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      );
    }

    return result
      .map((t) => {
        const project = this.projects.find((p) => p._id.toString() === t.projectId.toString());
        const assignee = t.assignedTo ? this.findUserById(t.assignedTo) : null;
        const creator = t.createdBy ? this.findUserById(t.createdBy) : null;

        return {
          ...t,
          projectId: project ? { _id: project._id, name: project.name } : null,
          assignedTo: assignee ? { _id: assignee._id, name: assignee.name, email: assignee.email } : null,
          createdBy: creator ? { _id: creator._id, name: creator.name, email: creator.email } : null,
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  findTaskById(id) {
    const t = this.tasks.find((task) => task._id.toString() === id.toString());
    if (!t) return null;
    const project = this.projects.find((p) => p._id.toString() === t.projectId.toString());
    const assignee = t.assignedTo ? this.findUserById(t.assignedTo) : null;
    const creator = t.createdBy ? this.findUserById(t.createdBy) : null;
    return {
      ...t,
      projectId: project ? { _id: project._id, name: project.name } : null,
      assignedTo: assignee ? { _id: assignee._id, name: assignee.name, email: assignee.email } : null,
      createdBy: creator ? { _id: creator._id, name: creator.name, email: creator.email } : null,
    };
  }

  createTask(taskData) {
    const newTask = {
      _id: 'task_' + Date.now() + Math.floor(Math.random() * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'To Do',
      priority: 'Medium',
      ...taskData,
    };
    this.tasks.unshift(newTask);

    // Create activity
    this.activities.unshift({
      _id: 'act_' + Date.now(),
      projectId: taskData.projectId,
      taskId: newTask._id,
      userId: taskData.createdBy,
      action: `Created task "${newTask.title}"`,
      createdAt: new Date(),
    });

    return newTask;
  }

  updateTask(id, updateData) {
    const index = this.tasks.findIndex((t) => t._id.toString() === id.toString());
    if (index !== -1) {
      this.tasks[index] = { ...this.tasks[index], ...updateData, updatedAt: new Date() };
      return this.tasks[index];
    }
    return null;
  }

  deleteTask(id) {
    const index = this.tasks.findIndex((t) => t._id.toString() === id.toString());
    if (index !== -1) {
      this.tasks.splice(index, 1);
      return true;
    }
    return false;
  }

  // Dashboard Stats
  getDashboardStats(userId) {
    const userProjects = this.projects.filter(
      (p) =>
        p.ownerId.toString() === userId.toString() ||
        (p.memberIds && p.memberIds.some((m) => m.toString() === userId.toString()))
    );
    const userProjectIds = userProjects.map((p) => p._id.toString());

    const userTasks = this.tasks.filter((t) => userProjectIds.includes(t.projectId.toString()));

    const totalProjects = userProjects.length;
    const activeProjects = userProjects.filter((p) => p.status === 'Active').length;
    const completedTasks = userTasks.filter((t) => t.status === 'Completed').length;

    const overdueTasks = userTasks.filter((t) => {
      if (t.status === 'Completed' || !t.dueDate) return false;
      return new Date(t.dueDate) < new Date();
    }).length;

    const taskStatusCounts = {
      'To Do': userTasks.filter((t) => t.status === 'To Do').length,
      'In Progress': userTasks.filter((t) => t.status === 'In Progress').length,
      Review: userTasks.filter((t) => t.status === 'Review').length,
      Completed: completedTasks,
    };

    const upcomingTasks = userTasks
      .filter((t) => t.status !== 'Completed' && t.dueDate)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5)
      .map((t) => {
        const project = this.projects.find((p) => p._id.toString() === t.projectId.toString());
        const assignee = t.assignedTo ? this.findUserById(t.assignedTo) : null;
        return {
          ...t,
          projectId: project ? { _id: project._id, name: project.name } : null,
          assignedTo: assignee ? { _id: assignee._id, name: assignee.name } : null,
        };
      });

    return {
      totalProjects,
      activeProjects,
      completedTasks,
      overdueTasks,
      taskStatusCounts,
      upcomingTasks,
    };
  }

  // Activity Feed
  getActivities(userId) {
    return this.activities.slice(0, 15).map((a) => {
      const user = this.findUserById(a.userId);
      const project = this.projects.find((p) => p._id.toString() === a.projectId.toString());
      return {
        ...a,
        userId: user ? { _id: user._id, name: user.name, email: user.email } : null,
        projectId: project ? { _id: project._id, name: project.name } : null,
      };
    });
  }
}

const store = new InMemoryStore();
module.exports = store;
