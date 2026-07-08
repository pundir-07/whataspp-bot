const pool = require("../dist/db/index")
const fs = require("node:fs")
const path = require("node:path")
async function runMigrations() {
    const { rows } = await pool.query(
        `
        SELECT to_regclass($1) IS NOT NULL AS exists;
        `,
        ['public.migrations']
    );

    const migrationsTableExists = rows[0].exists;
    let migrationFiles = getMigrationFiles()
    if (migrationsTableExists) {
        const { rows } = await pool.query(
            `select name from migrations`
        )
        const ranMigrations = new Set(
            rows.map(row => row.name)
        );
        migrationFiles = migrationFiles.filter(
            file => !ranMigrations.has(file)
        );
    }
    else {
        const queryCreateMigrationsTable = `
        create table migrations(
            name text not null primary key,
            executed_at timestamptz not null default now()
        )`
        await pool.query(queryCreateMigrationsTable)
    }
    try {
        await applyMigrations(migrationFiles)
        process.exit(0)
    } catch (error) {
        console.log("Database migration failed :",error)
        process.exit(1)
    }
}
function getMigrationFiles() {
    return fs.readdirSync(path.join(__dirname, "../src/db/migrations/")).sort()
}
async function applyMigrations(files) {
    if (files.length === 0) {
        console.log("Database already up to date.");
        return;
    }
    try {
        await pool.query("BEGIN")
        for (const file of files) {
            const sql = fs.readFileSync(path.join(__dirname, "../src/db/migrations", file), {
                encoding: "utf-8"
            })
            console.log(`Applying migration: ${file}`)
            await pool.query(sql)
            await pool.query(
                `
                INSERT INTO migrations(name)
                VALUES ($1)
                `,
                [file]
            );
        }
        await pool.query("COMMIT")
        console.log(`\u2713Migration Successful !!  \nRan ${files.length} migrations. Files:\n`,files)
    } catch (error) {
        await pool.query("ROLLBACK")
        throw error
    } 
}
runMigrations()