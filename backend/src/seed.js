const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const Activity = require('./models/Activity');

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskflow';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Task.deleteMany({}),
      Activity.deleteMany({})
    ]);
    console.log('Cleared existing data.');

    // Create demo users
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123', salt);

    const users = await User.create([
      {
        name: 'Alex Rivera',
        email: 'alex@taskflow.dev',
        passwordHash,
        role: 'Admin'
      },
      {
        name: 'Sarah Chen',
        email: 'sarah@taskflow.dev',
        passwordHash,
        role: 'Manager'
      },
      {
        name: 'Michael Davis',
        email: 'michael@taskflow.dev',
        passwordHash,
        role: 'Member'
      },
      {
        name: 'Elena Rostova',
        email: 'elena@taskflow.dev',
        passwordHash,
        role: 'Member'
      }
    ]);

    console.log(`Created ${users.length} users.`);

    const [alex, sarah, michael, elena] = users;

    // Create Projects
    const now = new Date();
    const futureDate = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const pastDate = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const p1 = await Project.create({
      name: 'Fintech Mobile App 2.0',
      description: 'End-to-end design and engineering for customer biometric authentication, multi-currency wallet, and real-time transaction feeds.',
      ownerId: alex._id,
      memberIds: [alex._id, sarah._id, michael._id, elena._id],
      startDate: pastDate(20),
      deadline: futureDate(14),
      status: 'Active'
    });

    const p2 = await Project.create({
      name: 'Cloud Infrastructure Migration',
      description: 'Migrating legacy monolith EC2 instances into Kubernetes cluster with automated CI/CD and zero-downtime rolling deploys.',
      ownerId: sarah._id,
      memberIds: [sarah._id, alex._id, michael._id],
      startDate: pastDate(10),
      deadline: futureDate(30),
      status: 'Active'
    });

    const p3 = await Project.create({
      name: 'Design System & Component Library',
      description: 'Harmonize branding, accessible WCAG 2.1 AA tokens, Tailwind preset configuration, and reusable UI widget primitives.',
      ownerId: alex._id,
      memberIds: [alex._id, elena._id],
      startDate: pastDate(5),
      deadline: futureDate(7),
      status: 'Planning'
    });

    console.log('Created sample projects.');

    // Create Tasks for Project 1
    const tasksP1 = await Task.create([
      {
        title: 'Design user onboarding wireframes',
        description: 'Complete high-fidelity Figma mockups for 3-step KYC verification.',
        projectId: p1._id,
        assignedTo: elena._id,
        createdBy: alex._id,
        priority: 'High',
        status: 'Completed',
        dueDate: pastDate(2)
      },
      {
        title: 'Implement biometrics auth gateway',
        description: 'Integrate FaceID and Fingerprint biometric prompts using React Native Keychain.',
        projectId: p1._id,
        assignedTo: michael._id,
        createdBy: alex._id,
        priority: 'Urgent',
        status: 'In Progress',
        dueDate: futureDate(3)
      },
      {
        title: 'Multi-currency ledger API integration',
        description: 'Hook up banking webhook listeners and balance synchronization microservice.',
        projectId: p1._id,
        assignedTo: sarah._id,
        createdBy: alex._id,
        priority: 'High',
        status: 'Review',
        dueDate: futureDate(5)
      },
      {
        title: 'Unit test currency exchange calculations',
        description: 'Write Jest test suites ensuring zero precision loss in currency floating-point decimals.',
        projectId: p1._id,
        assignedTo: michael._id,
        createdBy: alex._id,
        priority: 'Medium',
        status: 'To Do',
        dueDate: futureDate(9)
      },
      {
        title: 'Fix transaction export CSV latency',
        description: 'Optimize MongoDB aggregation pipeline for high-volume ledger records.',
        projectId: p1._id,
        assignedTo: sarah._id,
        createdBy: alex._id,
        priority: 'Urgent',
        status: 'To Do',
        dueDate: pastDate(1) // Overdue intentionally
      }
    ]);

    // Create Tasks for Project 2
    const tasksP2 = await Task.create([
      {
        title: 'Setup Kubernetes manifests & Helm charts',
        description: 'Define ingress controllers, TLS certificates, and pod autoscaling policies.',
        projectId: p2._id,
        assignedTo: sarah._id,
        createdBy: sarah._id,
        priority: 'High',
        status: 'In Progress',
        dueDate: futureDate(12)
      },
      {
        title: 'Audit IAM role least-privilege policies',
        description: 'Review AWS IAM access keys and restrict S3 bucket policies.',
        projectId: p2._id,
        assignedTo: alex._id,
        createdBy: sarah._id,
        priority: 'Medium',
        status: 'Completed',
        dueDate: pastDate(3)
      }
    ]);

    // Create Activities
    await Activity.create([
      {
        projectId: p1._id,
        taskId: tasksP1[0]._id,
        userId: elena._id,
        action: 'Completed task "Design user onboarding wireframes"'
      },
      {
        projectId: p1._id,
        taskId: tasksP1[1]._id,
        userId: michael._id,
        action: 'Moved "Implement biometrics auth gateway" to In Progress'
      },
      {
        projectId: p1._id,
        taskId: tasksP1[2]._id,
        userId: sarah._id,
        action: 'Moved "Multi-currency ledger API integration" to Review'
      },
      {
        projectId: p2._id,
        taskId: tasksP2[1]._id,
        userId: alex._id,
        action: 'Completed task "Audit IAM role least-privilege policies"'
      },
      {
        projectId: p1._id,
        userId: alex._id,
        action: 'Created project "Fintech Mobile App 2.0"'
      }
    ]);

    console.log('Seed completed successfully!');
    console.log('\nDefault credentials:');
    console.log('Email: alex@taskflow.dev');
    console.log('Password: Password123\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
