import { Pool } from "pg";
import fs from "node:fs";
import path from "node:path";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
// import { loadDotenvx } from "../dotenvx";

// Ensure we are resolving paths relative to the project root
const ROOT_DIR = process.cwd();

// Load env variables, including dotenvx-encrypted values.
// loadDotenvx();

const dbUrl = process.env.DATABASE_URL;
const certPath = process.env.DATABASE_CA_CERT_PATH;

if (!dbUrl) {
    throw new Error("Missing env variable DATABASE_URL!");
}

// Use NODE_EXTRA_CA_CERTS in CI to point Node's TLS store to the DB CA file (recommended).
// If DATABASE_CA_CERT_PATH is provided, CI should still write the file to that path so other tools can use it.

const pool = new Pool({
    connectionString: dbUrl,
    ssl: {
        // Keep strict verification; NODE_EXTRA_CA_CERTS will provide the trusted CA in CI
        rejectUnauthorized: true,
    },
});

const db = drizzle(pool);

async function runMigrations() {
    try {
        console.log("Connecting to the database to migrate...");
        if (certPath) {
            console.log(`DATABASE_CA_CERT_PATH is set to: ${certPath}. Ensure NODE_EXTRA_CA_CERTS points to this file in CI.`);
        }
        
        // Point exactly to the drizzle folder at the root of your project
        await migrate(db, { migrationsFolder: path.join(ROOT_DIR, "drizzle") });
        
        console.log("✅ MIGRATIONS COMPLETED SUCCESSFULLY!");
    } catch (error) {
        console.error("\n❌ MIGRATION FAILED. RAW ERROR ❌");
        console.error(error);
        process.exit(1); // Ensure GitHub Actions fails if this crashes!
    } finally {
        await pool.end();
    }
}

runMigrations();
