require('dotenv').config();
const mongoose = require('mongoose');
const Leader = require('./src/models/Leader').default;

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const leader = await mongoose.connection.db.collection('leaders').findOne({ slug: 'bp-koirala' });
  console.log(leader);
  process.exit(0);
}
run();
