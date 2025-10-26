const { Sequelize } = require('sequelize');
const path = require('path');

// Database configuration
const isProduction = process.env.NODE_ENV === 'production';
const dbType = process.env.DB_TYPE || 'sqlite';
// Prefer explicit DATABASE_URL; also support DATABASE_PUBLIC_URL used by Railway TCP proxy
const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL || process.env.RAILWAY_DATABASE_URL || process.env.POSTGRES_URL;

let sequelize;

if (databaseUrl) {
  // Prefer external Postgres when DATABASE_URL (or compatible) is present
  const needSSL = isProduction || /sslmode=require/i.test(databaseUrl) || /railway/i.test(databaseUrl);
  sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: needSSL ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {},
    // Keep a modest pool size to avoid overwhelming free-tier Postgres
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: false
  });
} else if (dbType === 'postgres') {
  // Development PostgreSQL (local)
  sequelize = new Sequelize('postgres://localhost:5432/stockcalc', {
    dialect: 'postgres',
    logging: false
  });
} else {
  // Development SQLite (default)
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../dev.db'),
    logging: false
  });
}

// Import models
const User = require('./User')(sequelize, Sequelize.DataTypes);
const Trade = require('./Trade')(sequelize, Sequelize.DataTypes);

// Define associations
User.hasMany(Trade, { foreignKey: 'user_id', as: 'trades' });
Trade.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User,
  Trade
};