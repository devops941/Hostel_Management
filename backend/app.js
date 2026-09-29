require('./config/env');

const cors = require('cors');
const express = require('express');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const roomRoutes = require('./routes/roomRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');

const gatePassRoutes = require('./routes/gatePassRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const visitorRoutes = require('./routes/visitorRoutes');
const messRoutes = require('./routes/messRoutes');
const feeRoutes = require('./routes/feeRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('Hostel Management API is running.'));
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/users', userRoutes);
app.use('/api/gatepass', gatePassRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/mess', messRoutes);
app.use('/api/fees', feeRoutes);
app.use(errorHandler);

module.exports = app;