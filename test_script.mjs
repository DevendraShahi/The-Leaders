import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({path: '.env.local'});
async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const leader = await mongoose.connection.db.collection('leaders').findOne({ slug: 'bp-koirala' });
  console.log(leader);
  process.exit(0);
}
run();
