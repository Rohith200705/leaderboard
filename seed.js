require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const User = require('./models/User');
const Team = require('./models/Team');
const Group = require('./models/Group');

const groups = [
  { groupNumber: 1, name: 'KRS Seminar Hall', venue: 'KRS Seminar Hall' },
  { groupNumber: 2, name: 'ECE Seminar Hall', venue: 'ECE Seminar Hall' },
  { groupNumber: 3, name: 'Civil Seminar Hall', venue: 'Civil Seminar Hall' },
  { groupNumber: 4, name: 'MS Auditorium', venue: 'MS Auditorium' },
  { groupNumber: 5, name: 'MCW', venue: 'MCW' }
];

const hosts = [
  { email: 'krs@leader.com', password: '123' },
  { email: 'ece@leader.com', password: '123' },
  { email: 'civil@leader.com', password: '123' },
  { email: 'ms@leader.com', password: '123' },
  { email: 'mcw@leader.com', password: '123' }
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
  console.log('5 venues created');

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
  console.log('90 tribes created (18 per venue)');

  await mongoose.disconnect();
  console.log('Done');
}

seed().catch(err => { console.error(err); process.exit(1); });
