/**
 * Script to check admin users in the database
 */

const dbConnect = require('./src/lib/db').default;
const Admin = require('./src/models/Admin').default;

async function checkAdmins() {
    try {
        await dbConnect();

        const admins = await Admin.find({}).select('email username role permissions isActive');

        console.log('\n=== ADMIN USERS IN DATABASE ===\n');

        if (admins.length === 0) {
            console.log('No admins found in database');
        } else {
            admins.forEach((admin, index) => {
                console.log(`Admin ${index + 1}:`);
                console.log(`  Email: ${admin.email}`);
                console.log(`  Username: ${admin.username}`);
                console.log(`  Role: ${admin.role}`);
                console.log(`  Active: ${admin.isActive}`);
                console.log(`  Permissions: ${JSON.stringify(admin.permissions, null, 2)}`);
                console.log('');
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkAdmins();
