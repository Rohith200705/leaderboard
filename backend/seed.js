require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const User = require('./models/User');
const Team = require('./models/Team');
const Group = require('./models/Group');

const groups = [
  { groupNumber: 1, name: 'Group A', venue: 'Venue 1' },
  { groupNumber: 2, name: 'Group B', venue: 'Venue 2' },
  { groupNumber: 3, name: 'Group C', venue: 'Venue 3' },
  { groupNumber: 4, name: 'Group D', venue: 'Venue 4' },
  { groupNumber: 5, name: 'Group E', venue: 'Venue 5' }
];

const hosts = [
  { email: 'group1@leader.com', password: '123' },
  { email: 'group2@leader.com', password: '123' },
  { email: 'group3@leader.com', password: '123' },
  { email: 'group4@leader.com', password: '123' },
  { email: 'group5@leader.com', password: '123' }
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  try { await mongoose.connection.dropCollection('users'); } catch(e) {}
  try { await mongoose.connection.dropCollection('teams'); } catch(e) {}
  try { await mongoose.connection.dropCollection('groups'); } catch(e) {}
  try { await mongoose.connection.dropCollection('scores'); } catch(e) {}
  try { await mongoose.connection.dropCollection('events'); } catch(e) {}
  console.log('Old collections dropped');

  const createdGroups = await Group.insertMany(groups);
  console.log('5 groups created');

  for (let i = 0; i < 5; i++) {
    await User.create({
      email: hosts[i].email,
      password: hosts[i].password,
      role: 'host',
      group: createdGroups[i]._id
    });
  }
  console.log('5 host users created');

  const tribes = [];
  for (let g = 0; g < 5; g++) {
    for (let t = 1; t <= 18; t++) {
      tribes.push({
        tribeNumber: t,
        name: `Tribe ${g * 18 + t}`,
        group: createdGroups[g]._id
      });
    }
  }
  await Team.insertMany(tribes);
  console.log('90 tribes created (18 per group)');

  await mongoose.disconnect();
  console.log('Done');
}

seed().catch(err => { console.error(err); process.exit(1); });
