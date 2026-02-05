// Quick SuperAdmin Fix
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://theleadersnp_db_user:lWIpICbd6UnsrN4R@the-leadersnp.4ou8zem.mongodb.net/?appName=The-LeadersNP';

const AdminSchema = new mongoose.Schema({
    username: String,
    email: String,
    role: String,
    permissions: Object,
    isActive: Boolean,
}, { strict: false });

const Admin = mongoose.model('Admin', AdminSchema, 'admins');

async function fixRole() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected\n');

        const admins = await Admin.find({});
        console.log(`Found ${admins.length} admin(s):\n`);

        for (const admin of admins) {
            console.log(`- ${admin.email} | Role: ${admin.role}`);

            if (admin.role !== 'superadmin') {
                admin.role = 'superadmin';
                admin.permissions = {
                    articles: { view: true, create: true, edit: true, delete: true, publish: true },
                    settings: { view: true, edit: true },
                    users: { view: true, create: true, edit: true, delete: true },
                    analytics: { view: true }
                };
                await admin.save();
                console.log(`  ✅ Updated to superadmin\n`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('❌', error.message);
        process.exit(1);
    }
}

fixRole();
