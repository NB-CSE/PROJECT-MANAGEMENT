const mongoose = require('mongoose');

let isDbConnected = false;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskflow';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    isDbConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    isDbConnected = false;
    console.log('\n============================================================');
    console.log(`⚠️  MongoDB Connection Notice (${error.message})`);
    console.log('⚡ Running in In-Memory Mode with pre-seeded projects:');
    console.log('   1. Job Board Platform (Elevate Careers)');
    console.log('   2. E-Commerce Web (ShopFlow)');
    console.log('   3. Interactive Quiz Maker');
    console.log('   4. Modern Landing Page');
    console.log('   5. Interactive Web Calculator');
    console.log('   6. Developer Portfolio');
    console.log('💡 All features (Kanban, progress, tasks, team) are 100% functional.');
    console.log('👉 To connect to MongoDB Atlas, add your MONGODB_URI in backend/.env:');
    console.log('   MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/taskflow');
    console.log('============================================================\n');
  }
};

const getDbStatus = () => isDbConnected && mongoose.connection.readyState === 1;

module.exports = connectDB;
module.exports.getDbStatus = getDbStatus;
