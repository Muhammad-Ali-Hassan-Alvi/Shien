
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGODB_URL;

console.log('Testing MongoDB Connection...');
console.log('URI:', MONGO_URI ? MONGO_URI.replace(/:([^:@]+)@/, ':****@') : 'Undefined');

if (!MONGO_URI) {
    console.error("Please define the MONGODB_URL environment variable inside .env.local");
    process.exit(1);
}

async function connectDB() {
    try {
        // No DNS workaround needed anymore!
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB Connected Successfully!');
        await mongoose.connection.close();
        console.log('Connection closed.');
    } catch (err) {
        console.error('❌ MongoDB Connection Failed:', err);
        console.error('Error Name:', err.name);
        console.error('Error Message:', err.message);
        if (err.cause) console.error('Error Cause:', err.cause);
    }
}

connectDB();
