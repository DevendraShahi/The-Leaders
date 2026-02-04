/**
 * Data Migration Script: Update Existing Admins to New Schema
 * 
 * This script migrates existing admin accounts from the old schema
 * (superadmin/editor roles) to the new RBAC schema with permissions.
 * 
 * Run this script ONCE after deploying the new schema:
 * npx tsx scripts/migrate-admins.ts
 */

import dbConnect from '../src/lib/db';
import Admin from '../src/models/Admin';
import { getDefaultPermissions } from '../src/lib/rbac';

async function migrateAdmins() {
    console.log('🔄 Starting admin migration...\n');

    await dbConnect();

    // Find all admins
    const admins = await Admin.find({});
    console.log(`Found ${admins.length} admin(s) to migrate\n`);

    let migrated = 0;
    let skipped = 0;

    for (const admin of admins) {
        // Check if already migrated (has permissions object)
        if (admin.permissions) {
            console.log(`⏭️  Skipping ${admin.email} - already migrated`);
            skipped++;
            continue;
        }

        // Map old 'editor' role to new 'editorial' role
        if (admin.role === 'editor' as any) {
            admin.role = 'editorial';
        }

        // Add default permissions based on role
        admin.permissions = getDefaultPermissions(admin.role);

        await admin.save();
        console.log(`✅ Migrated ${admin.email} (${admin.role})`);
        migrated++;
    }

    console.log(`\n✨ Migration complete!`);
    console.log(`   Migrated: ${migrated}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${admins.length}\n`);

    process.exit(0);
}

migrateAdmins().catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
});
