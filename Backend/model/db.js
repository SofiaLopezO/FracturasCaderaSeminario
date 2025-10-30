// model/db.js
const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.PGDATABASE,
  process.env.PGUSER,
  process.env.PGPASSWORD,
  {
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    dialect: "postgres",
    logging: false,
    define: {
      underscored: true,     
      freezeTableName: true, 
    },
  }
);

async function connectDB(syncOptions = { alter: true }) {
  await sequelize.authenticate();
  console.log("✅ Conexión a PostgreSQL establecida correctamente");
  
  await sequelize.sync(syncOptions);
  console.log("✅ Modelos sincronizados");
}

module.exports = { sequelize, connectDB };
