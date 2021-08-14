const Sequelize = require('sequelize');

let config;

if (process.env.DATABASE_URL) {
  config = {
    logging: false,
    ssl: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  };
} else {
  config = {
    logging: false,
  };
}

const DATABASE = new Sequelize(
  process.env.DATABASE_URL || `postgres://localhost:5432/${process.env.DB_DATABASE}`,
  config
);

/* const DATABASE = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: 'postgres',
  }
); */

module.exports = DATABASE;
