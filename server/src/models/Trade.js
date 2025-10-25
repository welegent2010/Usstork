module.exports = (sequelize, DataTypes) => {
  const Trade = sequelize.define('Trade', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    code: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    shares: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 8.00
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'trades',
    timestamps: false,
    indexes: [
      {
        fields: ['user_id', 'code']
      },
      {
        fields: ['user_id']
      }
    ]
  });

  return Trade;
};