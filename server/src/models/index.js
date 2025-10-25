const { Sequelize } = require('sequelize');
const path = require('path');

// Database configuration
const isProduction = process.env.NODE_ENV === 'production';
const dbType = process.env.DB_TYPE || 'sqlite';

let sequelize;

if (isProduction && process.env.DATABASE_URL) {
  // Production PostgreSQL
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  });
} else if (dbType === 'postgres') {
  // Development PostgreSQL
  sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost:5432/stockcalc', {
    dialect: 'postgres',
    logging: false
  });
} else {
  // Development SQLite
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