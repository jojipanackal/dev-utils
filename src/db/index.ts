import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { loadDotenvx } from "../../dotenvx";

import * as schema from "./schema.ts";

loadDotenvx();

const databaseUrl = process.env.DATABASE_URL;
const databaseCaCert = process.env.DATABASE_CA_CERT;

if (!databaseUrl) {
	throw new Error("DATABASE_URL is required to connect to Postgres");
}

const pool = new Pool({
	connectionString: databaseUrl,
	ssl: databaseCaCert
		? {
				ca: databaseCaCert,
				rejectUnauthorized: true,
			}
		: undefined,
});

export const db = drizzle(pool, { schema });
