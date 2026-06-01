import mongoose from "mongoose";

const MONGO_URI = process.env.MONGODB_URL;

if (!MONGO_URI) {
  throw new Error("Please define the MONGODB_URL environment variable in .env.local");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const CONNECT_OPTS = {
  bufferCommands: false,
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  heartbeatFrequencyMS: 10000,
  maxPoolSize: 10,
};

function resetCache() {
  cached.conn = null;
  cached.promise = null;
}

async function connectOnce() {
  // Already connected
  if (mongoose.connection.readyState === 1) {
    cached.conn = mongoose.connection;
    return cached.conn;
  }

  // Connection in progress — wait for the same promise (do NOT reset)
  if (cached.promise) {
    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch (e) {
      resetCache();
      throw e;
    }
  }

  // Start a new connection
  cached.promise = mongoose.connect(MONGO_URI, CONNECT_OPTS).then((instance) => {
    cached.conn = instance;
    return instance;
  });

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    resetCache();
    throw e;
  }
}

/** Connect to MongoDB with automatic retry on transient network failures. */
async function connectDB(retries = 2) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await connectOnce();
    } catch (e) {
      lastError = e;
      resetCache();
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
      }
    }
  }

  throw lastError;
}

export default connectDB;
