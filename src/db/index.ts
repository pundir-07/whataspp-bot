import dotenv from "dotenv";
dotenv.config();
import pg from "pg";
const { Pool } = pg;

export const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

export async function query(text: string, params: any[] = []) {
    return pool.query(text, params);
}
