const dotenv = require("dotenv");

dotenv.config({ path: "../../.env" });

module.exports = {
  client: "pg",
  connection: {
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
  },
  migrations: {
    directory: "../../migrations/",
    tableName: "migrations",
  },
  seeds: {
    directory: "../../seeds/",
  },
};
