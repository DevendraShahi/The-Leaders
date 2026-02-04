const mongoose = require('mongoose');

// Connect to DB (using the URI likely in env or I'll try to find it, 
// usually it's process.env.MONGODB_URI. Since I can't read env easily in this script without dotenv, 
// I'll assume standard localhost if not provided, or better, try to read .env.local via fs first? 
// Actually, I can just use the app's dbConnect if I run it with ts-node or similar, but simplified is better.
// I will just use a generic script that tries to import the model or just query the collection raw).

const connectDB = async () => {
    try {
        // I need the connection string. I will assume it's in .env.local
        // For now, I will try to read the .env.local file content to get the URI.
        const fs = require('fs');
        const path = require('path');
        const envFile = fs.readFileSync(path.resolve(__dirname, '../.env.local'), 'utf8');
        const uriLine = envFile.split('\n').find(line => line.startsWith('MONGODB_URI'));
        let uri = uriLine ? uriLine.split('=')[1].trim().replace(/^['"]|['"]$/g, '') : null;
        if (uri && uri.endsWith('?appName')) {
            uri = uri.replace('?appName', '');
        }

        if (!uri) throw new Error("No MONGODB_URI found");

        console.log("Connecting to:", uri.replace(/:([^:@]{1,})@/, ':****@')); // Log masked URI for debug
        await mongoose.connect(uri);
        console.log("Connected to DB");

        const settings = await mongoose.connection.db.collection('settings').findOne({});
        console.log("Current Settings in DB:");
        console.log(JSON.stringify(settings, null, 2));

        if (settings && settings.maintenance) {
            console.log("\nMaintenance Object:");
            console.dir(settings.maintenance, { depth: null });
        } else {
            console.log("\nNo 'maintenance' field found in settings!");
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

connectDB();
