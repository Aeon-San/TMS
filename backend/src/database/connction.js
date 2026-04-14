import mongoose from 'mongoose';

const conncetDB = async () => {
    const mongoUri = process.env.MONGODB_URI;

    if (typeof mongoUri !== 'string' || mongoUri.trim() === '') {
        throw new Error('MONGODB_URI is missing or invalid.');
    }

    try {
        const conn = await mongoose.connect(mongoUri)
        console.log(`MongoDB Connected: ${conn.connection.host}\n`);
    } catch (error) {
        throw new Error(`MongoDB connection failed: ${error.message}`);
    }
}

export default conncetDB;