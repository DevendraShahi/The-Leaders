import * as dotenv from 'dotenv';
dotenv.config({path: '.env.local'});
import mongoose from 'mongoose';
import Leader from './src/models/Leader.js';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  try {
    const leader = await Leader.findOneAndUpdate(
       { slug: 'bp-koirala' },
       { status: 'published' },
       { new: true, runValidators: true }
    );
    console.log(leader);
  } catch (err) {
    console.error(err);
  }
  process.exit();
}
run();
