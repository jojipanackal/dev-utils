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

if (!dbUrl || !certPath) {
    throw new Error("Missing env variables!");
}

// Read the CA certificate
const caCert = fs.readFileSync(path.resolve(ROOT_DIR, certPath), "utf8");

// Encode CA cert as base64 for the connection string parameter
const caBase64 = Buffer.from(caCert).toString("base64");

// Build connection string with sslmode=verify-full and sslrootcert parameter
const connectionStringWithSsl = `${dbUrl}?sslmode=verify-full&sslrootcert=${caBase64}`;

const pool = new Pool({
    connectionString: connectionStringWithSsl,
});

const db = drizzle(pool);

async function runMigrations() {
    try {
        console.log("Connecting to the database to migrate...");
        
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
