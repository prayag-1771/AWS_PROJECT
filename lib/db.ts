import { Pool, types } from "pg";

// TIMESTAMP columns hold UTC; read them as UTC whatever the server's time zone.
types.setTypeParser(types.builtins.TIMESTAMP, (value) => new Date(`${value}Z`));

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  // RDS requires TLS; set DB_SSL=false only for a local database.
  ssl:
    process.env.DB_SSL === "false"
      ? false
      : {
          rejectUnauthorized: false,
        },
  max: 10,
  connectionTimeoutMillis: 5000,
});

export default pool;
