
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet()); // Set security headers
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Import routes
const auth = require('./routes/auth');
const products = require('./routes/products');
const parties = require('./routes/parties');
const invoices = require('./routes/invoices');
const dashboard = require('./routes/dashboard');

// Mount routers
app.use('/api/auth', auth);
app.use('/api/products', products);
app.use('/api/parties', parties);
app.use('/api/invoices', invoices);
app.use('/api/dashboard', dashboard);

app.get('/', (req, res) => {
  res.send('Textile Management System API is running!');
});

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
