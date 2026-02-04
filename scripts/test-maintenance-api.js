
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Quick schema definition matching the app
const SettingsSchema = new Schema({
    maintenance: {
        global: { isActive: Boolean, reason: String },
        groups: {
            public: {
                isActive: Boolean,
                reason: String,
                pages: {
                    articles: { isActive: Boolean, reason: String }
                }
            }
        }
    }
}, { strict: false });

const Settings = mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);

async function test() {
    console.log('--- Starting API Freshness Test ---');

    // 1. Connect to DB
    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI missing');
        return;
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // 2. Get current settings
    let settings = await Settings.findOne();
    if (!settings) {
        console.log('No settings found, creating...');
        settings = await Settings.create({});
    }

    // 3. Set Articles Maintenance to TRUE direct in DB
    console.log('>>> Setting Articles Maintenance to TRUE in DB...');
    if (!settings.maintenance) settings.maintenance = { groups: { public: { pages: {} } } };
    if (!settings.maintenance.groups) settings.maintenance.groups = { public: { pages: {} } };
    if (!settings.maintenance.groups.public) settings.maintenance.groups.public = { pages: {} };
    if (!settings.maintenance.groups.public.pages) settings.maintenance.groups.public.pages = {};

    settings.maintenance.groups.public.pages.articles = { isActive: true, reason: "API Test Active" };
    // Also ensure parent groups are not blocking for this specific test, we want to test page level
    settings.maintenance.groups.public.isActive = false;
    settings.maintenance.global = { isActive: false };

    // We need to use updateOne/findByIdAndUpdate to avoid validation issues with full schema locally
    await Settings.updateOne({ _id: settings._id }, {
        $set: { "maintenance.groups.public.pages.articles.isActive": true }
    });
    console.log('DB Updated.');

    // 4. Fetch API immediately
    console.log('>>> Fetching API (Expect ACTIVE)...');
    try {
        // We need to fetch from the running dev server
        const res = await fetch('http://localhost:3000/api/maintenance/status?t=' + Date.now(), {
            cache: 'no-store'
        });
        const json = await res.json();
        const apiActive = json.data?.groups?.public?.pages?.articles?.isActive;
        console.log(`API Result: ${apiActive} (Expected: true)`);

        if (apiActive !== true) {
            console.error('FAILURE: API returned stale data (Expected true, got ' + apiActive + ')');
        } else {
            console.log('SUCCESS: API reflected TRUE.');
        }

    } catch (e) {
        console.error('Fetch failed:', e.message);
    }

    // 5. Set Back to FALSE
    console.log('>>> Setting Articles Maintenance to FALSE in DB...');
    await Settings.updateOne({ _id: settings._id }, {
        $set: { "maintenance.groups.public.pages.articles.isActive": false }
    });
    console.log('DB Updated.');

    // 6. Fetch API immediately
    console.log('>>> Fetching API (Expect INACTIVE)...');
    try {
        const res = await fetch('http://localhost:3000/api/maintenance/status?t=' + Date.now(), {
            cache: 'no-store'
        });
        const json = await res.json();
        const apiActive = json.data?.groups?.public?.pages?.articles?.isActive;
        console.log(`API Result: ${apiActive} (Expected: false)`);

        if (apiActive !== false) {
            console.error('FAILURE: API returned stale data (Expected false, got ' + apiActive + ')');
        } else {
            console.log('SUCCESS: API reflected FALSE.');
        }

    } catch (e) {
        console.error('Fetch failed:', e.message);
    }

    mongoose.disconnect();
}

test();
