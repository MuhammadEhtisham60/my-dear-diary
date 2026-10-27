import 'dotenv/config';
import app from '../src/app.js';
import connectDB from '../src/config/db.js';

// Vercel serverless entry: reuse the DB connection across warm invocations.
let dbPromise;

export default async function handler(req, res) {
  try {
    dbPromise ??= connectDB();
    await dbPromise;
  } catch (err) {
    dbPromise = undefined;
    console.error('MongoDB connection failed:', err.message);
    return res.status(500).json({ message: 'Database connection failed' });
  }
  return app(req, res);
}
