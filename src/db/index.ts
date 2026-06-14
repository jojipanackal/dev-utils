import { drizzle } from "drizzle-orm/node-postgres";
import { loadDotenvx } from "../../dotenvx";

import * as schema from "./schema.ts";

loadDotenvx();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error("DATABASE_URL is required to connect to Postgres");
}

export const db = drizzle(databaseUrl, { schema });
