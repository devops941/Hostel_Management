const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const config = {
    PORT: process.env.PORT || 5000,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL?.trim().toLowerCase(),
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
};

const missing = ['MONGO_URI', 'JWT_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD']
    .filter((key) => !config[key]);

if (missing.length) {
    throw new Error(`Set ${missing.join(', ')} in backend/.env.`);
}

module.exports = config;