const { execSync } = require('child_process');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function testBackend() {
    console.log('Connecting to mongodb...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Success.');

    const { ColumnArticle } = require('./src/models/ElectionContent');

    console.log('Inserting test column article...');
    const created = await ColumnArticle.create({
        title_en: 'Test API Verification',
        excerpt_en: 'This is a test of the backend setup.',
        content_en: '<p>Testing</p>',
        slug: 'test-api-verification-' + Date.now(),
        status: 'draft',
        editor: 'Admin',
        views: 0
    });
    console.log('Created ID:', created._id);

    const found = await ColumnArticle.findById(created._id);
    console.log('Found title:', found.title_en);

    await ColumnArticle.findByIdAndDelete(created._id);
    console.log('Deleted successfully.');

    await mongoose.disconnect();
    console.log('Backend Setup Verification Complete.');
}
testBackend().catch(err => {
    console.error(err);
    process.exit(1);
});
