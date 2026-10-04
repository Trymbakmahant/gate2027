import mongoose, { Mongoose } from 'mongoose';

/**
 * Global cached MongoDB connection for Next.js in TypeScript
 */
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

function getMongoURI(): string {
  let uri = process.env.mongodbconnectlink || process.env.MONGODB_URI || '';
  uri = uri.trim();

  if (!uri) {
    throw new Error('Please define the mongodbconnectlink or MONGODB_URI environment variable in .env');
  }

  // Ensure database name 'gate2027' is specified before query parameters
  if (!uri.includes('.mongodb.net/gate2027')) {
    if (uri.includes('.mongodb.net/?')) {
      uri = uri.replace('.mongodb.net/?', '.mongodb.net/gate2027?');
    } else if (uri.includes('.mongodb.net/')) {
      uri = uri.replace('.mongodb.net/', '.mongodb.net/gate2027');
    } else if (uri.includes('.mongodb.net')) {
      uri = uri.replace('.mongodb.net', '.mongodb.net/gate2027');
    }
  }

  return uri;
}

export async function connectToDatabase(): Promise<Mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const uri = getMongoURI();
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
    };

    cached.promise = mongoose.connect(uri, opts).then((m) => {
      console.log(`[MongoDB] Connected to database: ${m.connection.name}`);
      return m;
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
