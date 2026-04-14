import mongoose from 'mongoose';

const conncetDB = async () => {
    const mongoUri = process.env.MONGODB_URI;

    if (typeof mongoUri !== 'string' || mongoUri.trim() === '') {
        console.error('MONGODB_URI is missing or invalid. Check your .env file path and value.');
        process.exit(1);
    }

    try {
        const conn = await mongoose.connect(mongoUri)
        console.log(`MongoDB Connected: ${conn.connection.host}\n`);
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

export default conncetDB;