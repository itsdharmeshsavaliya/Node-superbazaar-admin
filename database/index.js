import mongoose from 'mongoose';
import { DB_URL } from './../config';
const connectDB = async() => {
    try {
        const conn = await mongoose.connect(DB_URL);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(error)
        process.exit(1);
    }
};
export { connectDB };