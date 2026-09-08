require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const User = require('./models/User');
const Team = require('./models/Team');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  await User.deleteMany({});
  await Team.deleteMany({});

  await User.create({
    email: 'host@leader.com',
    password: '123',
    role: 'host'
  });
  console.log('Host user created');

  const teams = [];
  for (let i = 1; i <= 90; i++) {
    teams.push({ teamNumber: i, name: `Team ${i}` });
  }
  await Team.insertMany(teams);
  console.log('90 teams created');

  await mongoose.disconnect();
  console.log('Done');
}

seed().catch(err => { console.error(err); process.exit(1); });
