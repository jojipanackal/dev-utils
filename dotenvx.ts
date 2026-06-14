import { config } from "@dotenvx/dotenvx";
import path from "node:path";

const ROOT_DIR = process.cwd();

export function loadDotenvx() {
	const paths =
		process.env.NODE_ENV === "production"
			? [".env.production"]
			: [".env.local"];

	config({
		path: paths.map((envPath) => path.join(ROOT_DIR, envPath)),
		ignore: ["MISSING_ENV_FILE"],
	});
}
