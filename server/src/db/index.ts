import mongoose from 'mongoose';
import { config } from 'dotenv';
 config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nuxthono';

export async function connectDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}

export async function disconnectDB() {
    try {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error disconnecting from MongoDB:', error);
    }
}

