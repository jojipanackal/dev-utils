import { defineConfig } from "drizzle-kit";
import fs from "node:fs";
import { loadDotenvx } from "./dotenvx";

loadDotenvx();

const databaseUrl = process.env.DATABASE_URL;
const databaseCaCertPath = process.env.DATABASE_CA_CERT_PATH;

if (!databaseUrl) {
	throw new Error("DATABASE_URL is required for Drizzle Kit");
}

export default defineConfig({
	out: "./drizzle",
	schema: "./src/db/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: databaseUrl,
		ssl: databaseCaCertPath
			? {
					ca: fs.readFileSync(databaseCaCertPath, "utf8"),
					rejectUnauthorized: true,
				}
			: true,
	},
});
