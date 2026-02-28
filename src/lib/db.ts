import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI?.trim();
const MONGODB_URI_DIRECT = process.env.MONGODB_URI_DIRECT?.trim();

const MONGODB_URI_REQUIRED = (() => {
  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
  }
  return MONGODB_URI;
})();

interface MongooseCache {
  conn: any;
  promise: Promise<any> | null;
}

declare global {

  var mongoose: MongooseCache;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

function isSrvLookupError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const srvError = error as { code?: string; syscall?: string; message?: string };
  if (srvError.code === "ECONNREFUSED" && srvError.syscall === "querySrv") {
    return true;
  }

  return typeof srvError.message === "string" && srvError.message.includes("querySrv");
}

async function connectWithSrvFallback(opts: mongoose.ConnectOptions) {
  try {
    return await mongoose.connect(MONGODB_URI_REQUIRED, opts);
  } catch (error) {
    if (MONGODB_URI_DIRECT && isSrvLookupError(error)) {
      console.warn("[db] SRV DNS lookup failed. Retrying with MONGODB_URI_DIRECT.");
      return mongoose.connect(MONGODB_URI_DIRECT, opts);
    }
    throw error;
  }
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      family: 4, // Force IPv4 to avoid ETIMEDOUT on IPv6 addresses
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    cached.promise = connectWithSrvFallback(opts).then((mongoose) => {
      return mongoose;
    });
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
