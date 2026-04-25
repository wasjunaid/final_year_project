const fs = require("fs");
const path = require("path");
const { pool } = require("../config/databaseConfig");

const migrationsDir = path.join(__dirname, "../database/migrations");

async function ensureMigrationsTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            migration_id SERIAL PRIMARY KEY,
            filename VARCHAR(255) NOT NULL UNIQUE,
            executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    `);
}

async function getAppliedMigrations() {
    const result = await pool.query("SELECT filename FROM schema_migrations");
    return new Set(result.rows.map((row) => row.filename));
}

async function run() {
    try {
        if (!fs.existsSync(migrationsDir)) {
            console.log(`No migrations directory found at ${migrationsDir}`);
            return;
        }

        await ensureMigrationsTable();
        const applied = await getAppliedMigrations();

        const files = fs
            .readdirSync(migrationsDir)
            .filter((file) => file.endsWith(".sql"))
            .sort();

        let executedCount = 0;

        for (const file of files) {
            if (applied.has(file)) {
                console.log(`Skipping already applied migration: ${file}`);
                continue;
            }

            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, "utf8");

            const client = await pool.connect();
            try {
                await client.query("BEGIN");
                await client.query(sql);
                await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [file]);
                await client.query("COMMIT");
                executedCount += 1;
                console.log(`Applied migration: ${file}`);
            } catch (error) {
                await client.query("ROLLBACK");
                throw error;
            } finally {
                client.release();
            }
        }

        if (executedCount === 0) {
            console.log("No pending migrations.");
        } else {
            console.log(`Migration complete. Applied ${executedCount} migration(s).`);
        }
    } catch (error) {
        console.error(`Migration failed: ${error.message}`);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

run();
