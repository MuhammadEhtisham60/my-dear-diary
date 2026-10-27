import mongoose from 'mongoose';

export default async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set in .env');
  if (uri.includes('<db_password>')) {
    throw new Error('Replace <db_password> in backend/.env with your real MongoDB Atlas password.');
  }
  const conn = await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB_NAME || 'chronicle_diary',
    serverSelectionTimeoutMS: 15000,
  });
  console.log(`✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  return conn;
}
