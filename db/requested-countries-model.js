const { DataTypes } = require('sequelize');
const DATABASE = require('./db');
module.exports = DATABASE.define(
  'requests',
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      unique: true,
    },
    id_telegram: {
      type: DataTypes.STRING,
    },
    first_name: {
      type: DataTypes.STRING,
    },
    last_name: {
      type: DataTypes.STRING,
    },
    user_name: {
      type: DataTypes.STRING,
    },
    requested_countries: {
      type: DataTypes.STRING,
    }
  },
  {
    timestamps: false,
  }
);
