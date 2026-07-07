import { query, pool } from "./index.js";

async function main() {
    const result = await query("SELECT NOW();");

    console.log(result.rows[0]);

    await pool.end();
}

main().catch(console.error);
