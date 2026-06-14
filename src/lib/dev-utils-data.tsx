import {
	BinaryIcon,
	BracesIcon,
	CalendarClockIcon,
	CoffeeIcon,
	DatabaseIcon,
	FingerprintIcon,
	FlaskConicalIcon,
	GlassWaterIcon,
	HashIcon,
	LinkIcon,
	MilkIcon,
	PaletteIcon,
	SearchIcon,
	ShieldCheckIcon,
	TypeIcon,
} from "lucide-react";
import type * as React from "react";

export type ThemePreference = "system" | "light" | "dark";
export type LoginMode = "sign-in" | "sign-up";
export type ToolId =
	| "json"
	| "timestamp"
	| "beverage"
	| "redact"
	| "base64"
	| "url-codec"
	| "uuid"
	| "hash"
	| "mock-data"
	| "regex"
	| "cron"
	| "color"
	| "case";
export type ToolPath =
	| "/tools/json"
	| "/tools/timestamp"
	| "/tools/beverage"
	| "/tools/redact"
	| "/tools/base64"
	| "/tools/url-codec"
	| "/tools/uuid"
	| "/tools/hash"
	| "/tools/mock-data"
	| "/tools/regex"
	| "/tools/cron"
	| "/tools/color"
	| "/tools/case";

export type DevUser = {
	name: string;
	email: string;
	image?: string | null;
};

export type BeverageOption = {
	id: string;
	label: string;
	icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export type PollState = {
	votes: Record<
		string,
		Record<
			string,
			{
				optionId: string;
				userEmail: string;
				userName: string;
				votedAt: string;
			}
		>
	>;
};

export const mygateDefaultFavoriteStorageKey =
	"dev-utils:mygate-default-favorite:v1";
export const themeStorageKey = "dev-utils:theme";
export const demoUserStorageKey = "dev-utils:demo-user";

export const defaultJsonLeft = "";

export const defaultJsonRight = "";

export const baseBeverageOptions: Array<BeverageOption> = [
	{ id: "coffee", label: "Coffee", icon: CoffeeIcon },
	{ id: "tea", label: "Tea", icon: FlaskConicalIcon },
	{ id: "milk", label: "Milk", icon: MilkIcon },
	{ id: "water", label: "Water", icon: GlassWaterIcon },
];

export const toolCatalog: Array<{
	id: ToolId;
	path: ToolPath;
	title: string;
	description: string;
	icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	accent: string;
}> = [
	{
		id: "json",
		path: "/tools/json",
		title: "JSON Comparison",
		description: "Compare two JSON payloads and see top-level changes.",
		icon: BracesIcon,
		accent: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
	},
	{
		id: "timestamp",
		path: "/tools/timestamp",
		title: "Timestamp Conversion",
		description: "Convert Unix, millisecond, and ISO timestamps.",
		icon: CalendarClockIcon,
		accent:
			"bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
	},
	{
		id: "beverage",
		path: "/tools/beverage",
		title: "Mygate Polls",
		description: "Vote in Mygate-only morning and evening drinks polls.",
		icon: CoffeeIcon,
		accent: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
	},
	{
		id: "redact",
		path: "/tools/redact",
		title: "Sensitive Data Masker",
		description:
			"Mask secrets, keys, emails, phones, and IDs before sharing text.",
		icon: ShieldCheckIcon,
		accent: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
	},
	{
		id: "base64",
		path: "/tools/base64",
		title: "Base64 Encoder/Decoder",
		description: "Encode plain text or decode Base64 payloads.",
		icon: BinaryIcon,
		accent: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
	},
	{
		id: "url-codec",
		path: "/tools/url-codec",
		title: "URL Encoder/Decoder",
		description: "Encode query values or decode messy URLs from logs.",
		icon: LinkIcon,
		accent:
			"bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
	},
	{
		id: "uuid",
		path: "/tools/uuid",
		title: "UUID/GUID Generator",
		description: "Generate single or bulk version 4 UUIDs.",
		icon: FingerprintIcon,
		accent: "bg-lime-100 text-lime-700 dark:bg-lime-950 dark:text-lime-300",
	},
	{
		id: "hash",
		path: "/tools/hash",
		title: "Hash Generator",
		description: "Generate MD5, SHA-1, SHA-256, or SHA-512 hashes.",
		icon: HashIcon,
		accent:
			"bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-300",
	},
	{
		id: "mock-data",
		path: "/tools/mock-data",
		title: "Mock Data Generator",
		description: "Generate dummy JSON arrays for UI and endpoint testing.",
		icon: DatabaseIcon,
		accent:
			"bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
	},
	{
		id: "regex",
		path: "/tools/regex",
		title: "Regex Tester",
		description: "Test expressions against text and inspect matches.",
		icon: SearchIcon,
		accent:
			"bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
	},
	{
		id: "cron",
		path: "/tools/cron",
		title: "Cron Expression Parser",
		description: "Translate cron syntax into readable schedule text.",
		icon: CalendarClockIcon,
		accent: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
	},
	{
		id: "color",
		path: "/tools/color",
		title: "Color Format Converter",
		description: "Convert between HEX, RGB, RGBA, and HSL values.",
		icon: PaletteIcon,
		accent: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
	},
	{
		id: "case",
		path: "/tools/case",
		title: "Text Case Converter",
		description: "Convert strings into camel, snake, kebab, and Pascal case.",
		icon: TypeIcon,
		accent: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
	},
];

export function getTool(toolId: ToolId) {
	return toolCatalog.find((tool) => tool.id === toolId) ?? toolCatalog[0];
}

export function isMygateUser(email: string) {
	const normalizedEmail = email.toLowerCase();
	return (
		normalizedEmail.endsWith("@mygate.com") ||
		normalizedEmail.endsWith("@mygate.in")
	);
}

export function getVisibleTools(user: DevUser) {
	return toolCatalog.filter(
		(tool) => tool.id !== "beverage" || isMygateUser(user.email),
	);
}
