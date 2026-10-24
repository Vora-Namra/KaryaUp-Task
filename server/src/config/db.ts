import mongoose from 'mongoose';

let mongodInstance: any = null;

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/karyaup';
  const forceMemory = process.env.USE_MEMORY_DB === 'true';

  if (!forceMemory) {
    try {
      console.log(`[Database] Attempting connection to MongoDB: ${uri}`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 4000,
      });
      console.log('[Database] Connected successfully to local/external MongoDB.');
      return;
    } catch (err: any) {
      console.warn(`[Database] Local MongoDB connection failed (${err.message}). Switching to MongoDB In-Memory Server...`);
    }
  }

  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongodInstance = await MongoMemoryServer.create();
    const memoryUri = mongodInstance.getUri();
    console.log(`[Database] In-Memory MongoDB started at: ${memoryUri}`);
    await mongoose.connect(memoryUri);
    console.log('[Database] Connected successfully to MongoDB In-Memory Server.');
  } catch (memErr) {
    console.error('[Database] Fatal: Failed to initialize database:', memErr);
    process.exit(1);
  }
};

export default connectDB;
