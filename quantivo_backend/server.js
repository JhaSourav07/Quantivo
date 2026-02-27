require('dotenv').config(); // Load environment variables first
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db.js');

// Connect to the database
connectDB();

const app = express();

// Middleware
app.use(cors()); // Allowing frontend to communicate with backend
app.use(express.json()); // Allowing Express to parse JSON data from requests
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes')); 
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// A simple test route to make sure things are working
app.get('/', (req, res) => {
  res.send('Quantivo API is running...');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});