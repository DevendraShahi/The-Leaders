const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');

// Manually parse .env.local
const envPath = path.resolve(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    const key = parts[0]?.trim();
    if (key && parts.length > 1) {
        const value = parts.slice(1).join('=').trim();
        envVars[key] = value;
    }
});

const MONGODB_URI = envVars.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI not found in .env.local');
    process.exit(1);
}

console.log('Attempting to connect to MongoDB...');
// console.log('URI:', MONGODB_URI.replace(/:([^:@]+)@/, ':****@'));

async function testConnection() {
    try {
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            family: 4,
            tls: true,
            tlsAllowInvalidCertificates: true // DEBUG ONLY: Check if it's an SSL trust issue
        });
        console.log('✅ SUCCESS: Connected to MongoDB successfully!');

        const admin = new mongoose.mongo.Admin(mongoose.connection.db);
        const info = await admin.buildInfo();
        console.log('MongoDB Version:', info.version);

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ CONNECTION FAILED:');
        console.error('Name:', error.name);
        console.error('Message:', error.message);
        if (error.reason) {
            console.error('Reason:', JSON.stringify(error.reason, null, 2));
        }
    }
}

testConnection();
