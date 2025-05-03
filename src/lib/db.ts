// src/lib/db.ts
import mongoose from 'mongoose';

// Hardcoded fallback URI (not recommended for production)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/recruitmentApp_fallback';

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Cache connection promise to avoid reconnecting on every hot reload
let cachedClient: Promise<typeof mongoose> | null = null;

async function connectDB() {
    if (cachedClient) {
        console.log("Using cached DB connection");
        return cachedClient;
    }

    if (!cachedClient) {
        console.log("Creating new DB connection");
        cachedClient = mongoose.connect(MONGODB_URI).then((m) => {
            console.log("MongoDB Connected");
            return m;
        }).catch((err) => {
            console.error("MongoDB Connection Error:", err);
            cachedClient = null; // Reset cache on error
            throw err; // Rethrow to indicate failure
        });
    }

    try {
        await cachedClient; // Wait for the connection promise to resolve
    } catch (e) {
        cachedClient = null; // Reset cache on error during connection attempt
        throw e;
    }

    return cachedClient;
}

export default connectDB;