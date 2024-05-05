const express = require('express');
const cors = require('cors');
const statesRouter = require('./routes/statesRouter');
const undefinedRoute = require('./routes/undefinedRoute');
const database = require('./config/database');
const mongoose = require("mongoose");
const PORT = process.env.PORT || 8000;

const app = express();

// JSON body support
app.use(express.json());

// Middleware to enable CORS
app.use(cors());

// API routes
app.use('/states', statesRouter);

// Handle undefined routes
app.use(undefinedRoute);

// Start the server
app.listen(PORT, () => {
    database.connectDB().then(() => console.log(`Server is running on port ${PORT}`));
});

// Alert MongoDB connection status
mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
});
mongoose.connection.on('error', (err) => {
    console.error('Error connecting to MongoDB:', err);
});
mongoose.connection.on('disconnected', () => {
    console.log('Disconnected from MongoDB');
});
