// Fix SuperAdmin Role Script
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const AdminSchema = new mongoose.Schema({
    username: String,
    email: String,
    passwordHash: String,
    role: String,
    permissions: Object,
    isActive: Boolean,
    name: String,
    avatar: String,
    createdBy: mongoose.Schema.Types.ObjectId,
    lastLogin: Date,
    createdAt: Date,
    updatedAt: Date,
}, { timestamps: true });

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function fixSuperAdminRole() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find all admins
        const admins = await Admin.find({});
        console.log(`Found ${admins.length} admin(s) in database:\n`);

        admins.forEach((admin, index) => {
            console.log(`${index + 1}. ${admin.email}`);
            console.log(`   Role: ${admin.role}`);
            console.log(`   Active: ${admin.isActive}`);
            console.log('');
        });

        // Update the first admin to superadmin if needed
        const firstAdmin = admins[0];
        if (firstAdmin && firstAdmin.role !== 'superadmin') {
            console.log(`\n🔧 Updating ${firstAdmin.email} role to "superadmin"...`);

            firstAdmin.role = 'superadmin';
            firstAdmin.permissions = {
                articles: { view: true, create: true, edit: true, delete: true, publish: true },
                settings: { view: true, edit: true },
                users: { view: true, create: true, edit: true, delete: true },
                analytics: { view: true }
            };
            await firstAdmin.save();

            console.log('✅ Successfully updated to SuperAdmin!\n');
        } else if (firstAdmin.role === 'superadmin') {
            console.log('✅ Admin already has superadmin role\n');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixSuperAdminRole();
