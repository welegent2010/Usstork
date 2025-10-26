require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const tradeRoutes = require('./routes/trades');
const userRoutes = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());

// Allow multiple origins: production Pages and local dev preview
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (like curl) with no origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Otherwise, block
    return callback(null, false);
  },
  credentials: true
}));

app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/user', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const startServer = async () => {
  try {
    // Retry DB connection (useful when Postgres takes time to boot)
    const maxRetries = 5;
    const delayMs = 2000;
    // Log sanitized DB target for diagnostics
    const rawDbUrl = process.env.DATABASE_URL || process.env.RAILWAY_DATABASE_URL || process.env.POSTGRES_URL;
    if (rawDbUrl) {
      try {
        const u = new URL(rawDbUrl);
        const ssl = /sslmode=require/i.test(rawDbUrl) ? 'require' : 'optional';
        console.log(`DB target: ${u.protocol}//${u.hostname}:${u.port}${u.pathname} (ssl=${ssl})`);
      } catch {}
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
        break;
      } catch (err) {
        console.error(`Database connection failed (attempt ${attempt}/${maxRetries}):`, err.message || err);
        if (attempt === maxRetries) throw err;
        await new Promise(r => setTimeout(r, delayMs));
      }
    }

    // 在生产环境自动同步数据库模型（不会删除数据，alter 会根据模型变更调整表结构）
    // 这样无需单独运行迁移脚本，首次部署即可创建 users、trades 等表
    if ((process.env.NODE_ENV || 'development') === 'production') {
      await sequelize.sync({ alter: true });
      console.log('Models synchronized (production, alter: true).');
    } else {
      // 开发环境：确保 SQLite/开发数据库自动创建缺失的表，避免“no such table”导致 500
      await sequelize.sync();
      console.log('Models synchronized (development).');
    }
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();