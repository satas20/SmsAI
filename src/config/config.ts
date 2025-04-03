// filepath: src/config/config.ts
require("dotenv").config(); // Load environment variables from .env file

const dbName = process.env.POSTGRES_DB || "smsgpt";
const dbUser = process.env.POSTGRES_USER || "username";
const dbPassword = process.env.POSTGRES_PASSWORD || "password";
const dbHost = process.env.POSTGRES_HOST || "localhost";
const dbPort = process.env.POSTGRES_PORT
  ? parseInt(process.env.POSTGRES_PORT, 10)
  : 5432;

export const development = {
  database: dbName,
  username: dbUser,
  password: dbPassword,
  host: dbHost,
  port: dbPort,
  dialect: "postgres",
  logging: false, // Set to true for debugging SQL queries
};
