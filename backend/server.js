const mongoose = require('mongoose');
const { MONGO_URI, PORT } = require('./config/env');
const app = require('./app');

mongoose.connect(MONGO_URI).then(() => {
    console.log('Connected to MongoDB successfully.');
    app.listen(PORT, () => console.log(`Hostel Management API is running on http://localhost:${PORT}`));
}).catch((error) => {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
});