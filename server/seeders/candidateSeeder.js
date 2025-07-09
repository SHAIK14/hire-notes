const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Candidate = require('../models/Candidate');
const User = require('../models/User');
const connectDB = require('../config/database');

dotenv.config();

const DUMMY_CANDIDATES = [
  {
    name: 'Arjun Sharma',
    email: 'arjun.sharma@gmail.com',
    phone: '+91 9876543210',
    position: 'Frontend Developer',
    skills: ['React', 'JavaScript', 'CSS', 'HTML'],
    experience: 3,
    status: 'active'
  },
  {
    name: 'Priya Patel',
    email: 'priya.patel@gmail.com',
    phone: '+91 9876543211',
    position: 'Backend Developer',
    skills: ['Node.js', 'MongoDB', 'Express', 'JavaScript'],
    experience: 4,
    status: 'active'
  },
  {
    name: 'Rahul Gupta',
    email: 'rahul.gupta@gmail.com',
    phone: '+91 9876543212',
    position: 'Full Stack Developer',
    skills: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
    experience: 5,
    status: 'interviewed'
  },
  {
    name: 'Sneha Reddy',
    email: 'sneha.reddy@gmail.com',
    phone: '+91 9876543213',
    position: 'UI/UX Designer',
    skills: ['Figma', 'Adobe XD', 'Photoshop', 'Sketch'],
    experience: 2,
    status: 'active'
  },
  {
    name: 'Vikram Singh',
    email: 'vikram.singh@gmail.com',
    phone: '+91 9876543214',
    position: 'DevOps Engineer',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins'],
    experience: 6,
    status: 'active'
  },
  {
    name: 'Ananya Iyer',
    email: 'ananya.iyer@gmail.com',
    phone: '+91 9876543215',
    position: 'Data Scientist',
    skills: ['Python', 'Machine Learning', 'SQL', 'Pandas'],
    experience: 4,
    status: 'active'
  }
];

const seedCandidates = async () => {
  try {
    await connectDB();
    
    console.log('🌱 Starting candidate seeding...');
    
    const existingCandidates = await Candidate.countDocuments();
    if (existingCandidates > 0) {
      console.log('⚠️  Candidates already exist. Skipping seeding.');
      return;
    }

    const firstUser = await User.findOne().sort({ createdAt: 1 });
    if (!firstUser) {
      console.log('❌ No users found. Please register a user first.');
      return;
    }

    console.log(`👤 Using user: ${firstUser.name} as candidate creator`);

    const candidatesWithUser = DUMMY_CANDIDATES.map(candidate => ({
      ...candidate,
      addedBy: firstUser._id,
      messageCount: Math.floor(Math.random() * 10) + 1
    }));

    const createdCandidates = await Candidate.insertMany(candidatesWithUser);
    
    console.log(`✅ Successfully seeded ${createdCandidates.length} candidates:`);
    createdCandidates.forEach(candidate => {
      console.log(`   - ${candidate.name} (${candidate.position})`);
    });

    mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Error seeding candidates:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

if (require.main === module) {
  seedCandidates();
}

module.exports = { seedCandidates, DUMMY_CANDIDATES };