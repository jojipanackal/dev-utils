import {
	ClipboardIcon,
	CopyIcon,
	DicesIcon,
	RefreshCwIcon,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { Textarea } from "#/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "#/components/ui/toggle-group";
import { cn } from "#/lib/utils";

type CodecMode = "encode" | "decode";
type HashAlgorithm = "MD5" | "SHA-1" | "SHA-256" | "SHA-512";

export function Base64Tool() {
	const [mode, setMode] = React.useState<CodecMode>("encode");
	const [input, setInput] = React.useState("");
	const [output, setOutput] = React.useState("");

	function run() {
		try {
			setOutput(mode === "encode" ? encodeBase64(input) : decodeBase64(input));
			toast.success(mode === "encode" ? "Text encoded" : "Base64 decoded");
		} catch (error) {
			toast.error("Unable to decode Base64", {
				description: readError(error),
			});
		}
	}

	return (
		<CodecLayout
			description="Encode plain text or decode Base64 payloads back to readable text."
			input={input}
			mode={mode}
			onInputChange={setInput}
			onModeChange={setMode}
			onRun={run}
			output={output}
			setOutput={setOutput}
			title="Base64"
		/>
	);
}

export function UrlCodecTool() {
	const [mode, setMode] = React.useState<CodecMode>("encode");
	const [input, setInput] = React.useState("");
	const [output, setOutput] = React.useState("");

	function run() {
		try {
			setOutput(
				mode === "encode"
					? encodeURIComponent(input)
					: decodeURIComponent(input),
			);
			toast.success(mode === "encode" ? "URL encoded" : "URL decoded");
		} catch (error) {
			toast.error("Unable to decode URL text", {
				description: readError(error),
			});
		}
	}

	return (
		<CodecLayout
			description="Encode text for URLs or decode encoded values copied from logs."
			input={input}
			mode={mode}
			onInputChange={setInput}
			onModeChange={setMode}
			onRun={run}
			output={output}
			setOutput={setOutput}
			title="URL"
		/>
	);
}

function CodecLayout({
	description,
	input,
	mode,
	onInputChange,
	onModeChange,
	onRun,
	output,
	setOutput,
	title,
}: {
	description: string;
	input: string;
	mode: CodecMode;
	onInputChange: (value: string) => void;
	onModeChange: (value: CodecMode) => void;
	onRun: () => void;
	output: string;
	setOutput: (value: string) => void;
	title: string;
}) {
	return (
		<div className="grid gap-4">
			<Card>
				<CardHeader>
					<CardTitle>{title} settings</CardTitle>
					<CardDescription>{description}</CardDescription>
					<CardAction>
						<ToggleGroup
							onValueChange={(value) => {
								if (value === "encode" || value === "decode") {
									onModeChange(value);
								}
							}}
							type="single"
							value={mode}
							variant="outline"
						>
							<ToggleGroupItem value="encode">Encode</ToggleGroupItem>
							<ToggleGroupItem value="decode">Decode</ToggleGroupItem>
						</ToggleGroup>
					</CardAction>
				</CardHeader>
			</Card>

			<TwoPaneTextTool
				input={input}
				inputTitle="Input"
				onInputChange={onInputChange}
				onRun={onRun}
				output={output}
				outputTitle="Output"
				runLabel={mode === "encode" ? "Encode" : "Decode"}
				setOutput={setOutput}
			/>
		</div>
	);
}

export function UuidGeneratorTool() {
	const [count, setCount] = React.useState(1);
	const [uuids, setUuids] = React.useState<Array<string>>([]);

	function generate() {
		const nextCount = Math.min(Math.max(count, 1), 100);
		const nextUuids = Array.from({ length: nextCount }, () =>
			crypto.randomUUID(),
		);
		setUuids(nextUuids);
		toast.success(`Generated ${nextCount} UUID${nextCount === 1 ? "" : "s"}`);
	}

	return (
		<div className="grid gap-4">
			<Card>
				<CardHeader>
					<CardTitle>Generate UUIDs</CardTitle>
					<CardDescription>
						Create single or bulk version 4 UUIDs.
					</CardDescription>
					<CardAction>
						<Button onClick={generate}>
							<RefreshCwIcon data-icon="inline-start" />
							Generate
						</Button>
					</CardAction>
				</CardHeader>
				<CardContent className="grid gap-2">
					<label className="text-sm font-medium" htmlFor="uuid-count">
						Count
					</label>
					<Input
						id="uuid-count"
						max={100}
						min={1}
						onChange={(event) => setCount(Number(event.target.value) || 1)}
						type="number"
						value={count}
					/>
				</CardContent>
			</Card>

			<ResultCard
				onCopy={() => copyText(uuids.join("\n"), "UUIDs copied")}
				title="UUIDs"
			>
				<pre className="min-h-64 overflow-auto rounded-lg border bg-background p-3 font-mono text-sm">
					{uuids.join("\n")}
				</pre>
			</ResultCard>
		</div>
	);
}

export function HashGeneratorTool() {
	const [input, setInput] = React.useState("");
	const [algorithm, setAlgorithm] = React.useState<HashAlgorithm>("SHA-256");
	const [hash, setHash] = React.useState("");

	async function generate() {
		const nextHash =
			algorithm === "MD5"
				? md5(input)
				: await digestText(input, algorithm as Exclude<HashAlgorithm, "MD5">);
		setHash(nextHash);
		toast.success(`${algorithm} generated`);
	}

	return (
		<div className="grid gap-4">
			<Card>
				<CardHeader>
					<CardTitle>Hash settings</CardTitle>
					<CardDescription>
						Generate hashes from standard text input.
					</CardDescription>
					<CardAction>
						<ToggleGroup
							onValueChange={(value) => {
								if (isHashAlgorithm(value)) {
									setAlgorithm(value);
								}
							}}
							type="single"
							value={algorithm}
							variant="outline"
						>
							<ToggleGroupItem value="MD5">MD5</ToggleGroupItem>
							<ToggleGroupItem value="SHA-1">SHA-1</ToggleGroupItem>
							<ToggleGroupItem value="SHA-256">SHA-256</ToggleGroupItem>
							<ToggleGroupItem value="SHA-512">SHA-512</ToggleGroupItem>
						</ToggleGroup>
					</CardAction>
				</CardHeader>
			</Card>

			<TwoPaneTextTool
				input={input}
				inputTitle="Input text"
				onInputChange={setInput}
				onRun={() => void generate()}
				output={hash}
				outputTitle="Hash"
				runLabel="Generate"
				setOutput={setHash}
			/>
		</div>
	);
}

export function MockDataGeneratorTool() {
	const [count, setCount] = React.useState(10);
	const [output, setOutput] = React.useState("");

	function generate() {
		const nextCount = Math.min(Math.max(count, 1), 200);
		const rows = Array.from({ length: nextCount }, (_item, index) => {
			const id = crypto.randomUUID();
			return {
				id,
				name: `User ${index + 1}`,
				email: `user${index + 1}@test.local`,
				createdAt: new Date(Date.now() - index * 86_400_000).toISOString(),
				active: index % 2 === 0,
			};
		});
		setOutput(JSON.stringify(rows, null, 2));
		toast.success(`Generated ${nextCount} records`);
	}

	return (
		<div className="grid gap-4">
			<Card>
				<CardHeader>
					<CardTitle>Mock data settings</CardTitle>
					<CardDescription>
						Generate dummy JSON arrays for UI and endpoint tests.
					</CardDescription>
					<CardAction>
						<Button onClick={generate}>
							<DicesIcon data-icon="inline-start" />
							Generate
						</Button>
					</CardAction>
				</CardHeader>
				<CardContent className="grid gap-2">
					<label className="text-sm font-medium" htmlFor="mock-count">
						Records
					</label>
					<Input
						id="mock-count"
						max={200}
						min={1}
						onChange={(event) => setCount(Number(event.target.value) || 1)}
						type="number"
						value={count}
					/>
				</CardContent>
			</Card>

			<ResultCard
				onCopy={() => copyText(output, "Mock JSON copied")}
				title="JSON output"
			>
				<Textarea
					className="min-h-96 resize-y font-mono text-sm leading-6"
					onChange={(event) => setOutput(event.target.value)}
					spellCheck={false}
					value={output}
				/>
			</ResultCard>
		</div>
	);
}

export function RegexTesterTool() {
	const [pattern, setPattern] = React.useState("");
	const [flags, setFlags] = React.useState("g");
	const [input, setInput] = React.useState("");
	const result = React.useMemo(
		() => evaluateRegex(pattern, flags, input),
		[pattern, flags, input],
	);

	return (
		<div className="grid gap-4">
			<Card>
				<CardHeader>
					<CardTitle>Expression</CardTitle>
					<CardDescription>
						Test a regular expression against text in real time.
					</CardDescription>
					<CardAction>
						<Badge variant={result.error ? "destructive" : "secondary"}>
							{result.error ?? `${result.matches.length} matches`}
						</Badge>
					</CardAction>
				</CardHeader>
				<CardContent className="grid gap-3 md:grid-cols-[1fr_10rem]">
					<Input
						onChange={(event) => setPattern(event.target.value)}
						placeholder="Pattern"
						value={pattern}
					/>
					<Input
						onChange={(event) => setFlags(event.target.value)}
						placeholder="Flags"
						value={flags}
					/>
				</CardContent>
			</Card>

			<div className="grid gap-4 xl:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Test text</CardTitle>
					</CardHeader>
					<CardContent>
						<Textarea
							className="min-h-96 resize-y font-mono text-sm leading-6"
							onChange={(event) => setInput(event.target.value)}
							spellCheck={false}
							value={input}
						/>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Matches</CardTitle>
						<CardDescription>Highlighted matching ranges.</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="min-h-96 overflow-auto rounded-lg border bg-background p-3 font-mono text-sm leading-6 whitespace-pre-wrap">
							{result.parts.map((part) => (
								<span
									className={cn(part.match && "rounded bg-primary/20")}
									key={`${part.index}-${part.text}`}
								>
									{part.text}
								</span>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export function CronParserTool() {
	const [expression, setExpression] = React.useState("");
	const description = describeCron(expression);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Cron parser</CardTitle>
				<CardDescription>
					Translate common five-field cron expressions into plain text.
				</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-4">
				<Input
					onChange={(event) => setExpression(event.target.value)}
					placeholder="Cron expression"
					value={expression}
				/>
				<div className="rounded-lg border bg-background p-4 text-sm">
					{description}
				</div>
			</CardContent>
		</Card>
	);
}

export function ColorConverterTool() {
	const [input, setInput] = React.useState("");
	const color = parseColor(input);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Color converter</CardTitle>
				<CardDescription>
					Convert between HEX, RGB, RGBA, and HSL formats.
				</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-4">
				<Input
					onChange={(event) => setInput(event.target.value)}
					placeholder="Enter HEX, RGB, RGBA, or HSL"
					value={input}
				/>
				{color ? (
					<div className="grid gap-3 md:grid-cols-[10rem_1fr]">
						<div
							className="min-h-40 rounded-lg border"
							style={{ backgroundColor: color.rgba }}
						/>
						<div className="grid gap-2">
							<ColorRow label="HEX" value={color.hex} />
							<ColorRow label="RGB" value={color.rgb} />
							<ColorRow label="RGBA" value={color.rgba} />
							<ColorRow label="HSL" value={color.hsl} />
						</div>
					</div>
				) : (
					<div className="rounded-lg border bg-muted p-4 text-sm text-muted-foreground">
						Enter a valid color value.
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export function TextCaseConverterTool() {
	const [input, setInput] = React.useState("");
	const words = splitWords(input);
	const results = [
		{ label: "camelCase", value: toCamel(words) },
		{
			label: "snake_case",
			value: words.map((word) => word.toLowerCase()).join("_"),
		},
		{
			label: "kebab-case",
			value: words.map((word) => word.toLowerCase()).join("-"),
		},
		{ label: "PascalCase", value: toPascal(words) },
	];

	return (
		<div className="grid gap-4">
			<Card>
				<CardHeader>
					<CardTitle>Input text</CardTitle>
					<CardDescription>
						Convert text between common programming case styles.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Textarea
						className="min-h-48 resize-y"
						onChange={(event) => setInput(event.target.value)}
						value={input}
					/>
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Converted cases</CardTitle>
				</CardHeader>
				<CardContent className="grid gap-2">
					{results.map((result) => (
						<ColorRow
							key={result.label}
							label={result.label}
							value={result.value}
						/>
					))}
				</CardContent>
			</Card>
		</div>
	);
}

function TwoPaneTextTool({
	input,
	inputTitle,
	onInputChange,
	onRun,
	output,
	outputTitle,
	runLabel,
	setOutput,
}: {
	input: string;
	inputTitle: string;
	onInputChange: (value: string) => void;
	onRun: () => void;
	output: string;
	outputTitle: string;
	runLabel: string;
	setOutput: (value: string) => void;
}) {
	return (
		<div className="grid gap-4 xl:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle>{inputTitle}</CardTitle>
					<CardAction>
						<Button onClick={onRun}>{runLabel}</Button>
					</CardAction>
				</CardHeader>
				<CardContent>
					<Textarea
						className="min-h-80 resize-y font-mono text-sm leading-6"
						onChange={(event) => onInputChange(event.target.value)}
						spellCheck={false}
						value={input}
					/>
				</CardContent>
			</Card>
			<ResultCard
				onCopy={() => copyText(output, `${outputTitle} copied`)}
				title={outputTitle}
			>
				<Textarea
					className="min-h-80 resize-y font-mono text-sm leading-6"
					onChange={(event) => setOutput(event.target.value)}
					spellCheck={false}
					value={output}
				/>
			</ResultCard>
		</div>
	);
}

function ResultCard({
	children,
	onCopy,
	title,
}: {
	children: React.ReactNode;
	onCopy: () => void;
	title: string;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardAction>
					<Button onClick={onCopy} size="sm" variant="outline">
						<ClipboardIcon data-icon="inline-start" />
						Copy
					</Button>
				</CardAction>
			</CardHeader>
			<CardContent>{children}</CardContent>
		</Card>
	);
}

function ColorRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-center justify-between gap-3 rounded-lg border bg-background p-3">
			<div className="min-w-0">
				<p className="text-sm text-muted-foreground">{label}</p>
				<p className="truncate font-mono text-sm">{value}</p>
			</div>
			<Button
				onClick={() => copyText(value, `${label} copied`)}
				size="icon-sm"
				variant="ghost"
			>
				<CopyIcon data-icon="inline-start" />
				<span className="sr-only">Copy {label}</span>
			</Button>
		</div>
	);
}

function encodeBase64(value: string) {
	const bytes = new TextEncoder().encode(value);
	let binary = "";
	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}
	return btoa(binary);
}

function decodeBase64(value: string) {
	const binary = atob(value.trim());
	const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
	return new TextDecoder().decode(bytes);
}

async function digestText(
	value: string,
	algorithm: "SHA-1" | "SHA-256" | "SHA-512",
) {
	const buffer = await crypto.subtle.digest(
		algorithm,
		new TextEncoder().encode(value),
	);
	return [...new Uint8Array(buffer)]
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("");
}

function isHashAlgorithm(value: string): value is HashAlgorithm {
	return ["MD5", "SHA-1", "SHA-256", "SHA-512"].includes(value);
}

function evaluateRegex(pattern: string, flags: string, input: string) {
	if (!pattern) {
		return {
			error: null,
			matches: [],
			parts: [{ index: 0, match: false, text: input }],
		};
	}

	try {
		const normalizedFlags = flags.includes("g") ? flags : `${flags}g`;
		const regex = new RegExp(pattern, normalizedFlags);
		const matches = [...input.matchAll(regex)].filter(
			(match) => match[0] !== "",
		);
		const parts: Array<{ index: number; match: boolean; text: string }> = [];
		let cursor = 0;

		for (const match of matches) {
			const start = match.index ?? 0;
			if (start > cursor) {
				parts.push({
					index: cursor,
					match: false,
					text: input.slice(cursor, start),
				});
			}
			parts.push({ index: start, match: true, text: match[0] });
			cursor = start + match[0].length;
		}

		if (cursor < input.length) {
			parts.push({ index: cursor, match: false, text: input.slice(cursor) });
		}

		return { error: null, matches, parts };
	} catch (error) {
		return {
			error: readError(error),
			matches: [],
			parts: [{ index: 0, match: false, text: input }],
		};
	}
}

function describeCron(expression: string) {
	const parts = expression.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) {
		return "Enter a cron expression.";
	}
	if (parts.length !== 5) {
		return "Use a five-field cron expression: minute hour day month weekday.";
	}

	const [minute, hour, day, month, weekday] = parts.map((part) =>
		part === "?" ? "*" : part,
	);
	const time =
		minute.match(/^\d+$/) && hour.match(/^\d+$/)
			? `at ${formatCronTime(Number(hour), Number(minute))}`
			: `when minute is ${minute} and hour is ${hour}`;
	const dayText = day === "*" ? "every day" : `on day ${day}`;
	const monthText = month === "*" ? "" : ` in month ${month}`;
	const weekdayText = weekday === "*" ? "" : ` on weekday ${weekday}`;

	return `Fires ${time} ${dayText}${monthText}${weekdayText}.`;
}

function formatCronTime(hour: number, minute: number) {
	if (hour > 23 || minute > 59) {
		return `${hour}:${String(minute).padStart(2, "0")}`;
	}
	const suffix = hour >= 12 ? "PM" : "AM";
	const normalizedHour = hour % 12 || 12;
	return `${normalizedHour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function parseColor(value: string) {
	const trimmed = value.trim();
	if (!trimmed) {
		return null;
	}

	const rgba = parseHex(trimmed) ?? parseRgb(trimmed) ?? parseHsl(trimmed);
	if (!rgba) {
		return null;
	}

	const { r, g, b, a } = rgba;
	const hsl = rgbToHsl(r, g, b);
	return {
		hex: `#${toHex(r)}${toHex(g)}${toHex(b)}`,
		hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
		rgb: `rgb(${r}, ${g}, ${b})`,
		rgba: `rgba(${r}, ${g}, ${b}, ${a})`,
	};
}

function parseHex(value: string) {
	const match = value.match(/^#?([a-f\d]{3}|[a-f\d]{6})$/i);
	if (!match) {
		return null;
	}
	const hex =
		match[1].length === 3
			? match[1]
					.split("")
					.map((char) => char + char)
					.join("")
			: match[1];
	return {
		a: 1,
		b: Number.parseInt(hex.slice(4, 6), 16),
		g: Number.parseInt(hex.slice(2, 4), 16),
		r: Number.parseInt(hex.slice(0, 2), 16),
	};
}

function parseRgb(value: string) {
	const match = value.match(/^rgba?\(([^)]+)\)$/i);
	if (!match) {
		return null;
	}
	const parts = match[1].split(",").map((part) => part.trim());
	const [r, g, b] = parts.map(Number);
	const a = parts[3] === undefined ? 1 : Number(parts[3]);
	if ([r, g, b, a].some((part) => !Number.isFinite(part))) {
		return null;
	}
	return { a, b: clamp255(b), g: clamp255(g), r: clamp255(r) };
}

function parseHsl(value: string) {
	const match = value.match(/^hsl\(([^)]+)\)$/i);
	if (!match) {
		return null;
	}
	const [h, s, l] = match[1]
		.split(",")
		.map((part) => Number(part.trim().replace("%", "")));
	if ([h, s, l].some((part) => !Number.isFinite(part))) {
		return null;
	}
	return hslToRgb(h, s, l);
}

function hslToRgb(h: number, s: number, l: number) {
	const normalizedS = s / 100;
	const normalizedL = l / 100;
	const chroma = (1 - Math.abs(2 * normalizedL - 1)) * normalizedS;
	const x = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
	const m = normalizedL - chroma / 2;
	const [r1, g1, b1] =
		h < 60
			? [chroma, x, 0]
			: h < 120
				? [x, chroma, 0]
				: h < 180
					? [0, chroma, x]
					: h < 240
						? [0, x, chroma]
						: h < 300
							? [x, 0, chroma]
							: [chroma, 0, x];
	return {
		a: 1,
		b: clamp255((b1 + m) * 255),
		g: clamp255((g1 + m) * 255),
		r: clamp255((r1 + m) * 255),
	};
}

function rgbToHsl(r: number, g: number, b: number) {
	const rn = r / 255;
	const gn = g / 255;
	const bn = b / 255;
	const max = Math.max(rn, gn, bn);
	const min = Math.min(rn, gn, bn);
	const delta = max - min;
	const l = (max + min) / 2;
	const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
	const h =
		delta === 0
			? 0
			: max === rn
				? 60 * (((gn - bn) / delta) % 6)
				: max === gn
					? 60 * ((bn - rn) / delta + 2)
					: 60 * ((rn - gn) / delta + 4);
	return {
		h: Math.round((h + 360) % 360),
		l: Math.round(l * 100),
		s: Math.round(s * 100),
	};
}

function splitWords(value: string) {
	return value
		.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
		.split(/[^A-Za-z0-9]+/)
		.filter(Boolean);
}

function toCamel(words: Array<string>) {
	return words
		.map((word, index) =>
			index === 0 ? word.toLowerCase() : capitalize(word.toLowerCase()),
		)
		.join("");
}

function toPascal(words: Array<string>) {
	return words.map((word) => capitalize(word.toLowerCase())).join("");
}

function capitalize(value: string) {
	return value.charAt(0).toUpperCase() + value.slice(1);
}

function toHex(value: number) {
	return clamp255(value).toString(16).padStart(2, "0");
}

function clamp255(value: number) {
	return Math.max(0, Math.min(255, Math.round(value)));
}

function copyText(value: string, message: string) {
	if (!value) {
		toast.info("Nothing to copy");
		return;
	}
	void navigator.clipboard.writeText(value);
	toast.success(message);
}

function readError(error: unknown) {
	return error instanceof Error ? error.message : String(error);
}

function md5(value: string) {
	return md5Bytes(new TextEncoder().encode(value));
}

function md5Bytes(input: Uint8Array) {
	const originalLength = input.length;
	const bitLength = originalLength * 8;
	const paddedLength = (((originalLength + 8) >> 6) + 1) * 64;
	const bytes = new Uint8Array(paddedLength);
	bytes.set(input);
	bytes[originalLength] = 0x80;
	const view = new DataView(bytes.buffer);
	view.setUint32(paddedLength - 8, bitLength >>> 0, true);
	view.setUint32(paddedLength - 4, Math.floor(bitLength / 0x100000000), true);

	let a = 0x67452301;
	let b = 0xefcdab89;
	let c = 0x98badcfe;
	let d = 0x10325476;
	const shifts = [
		7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5,
		9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11,
		16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10,
		15, 21,
	];
	const table = Array.from({ length: 64 }, (_item, index) =>
		Math.floor(Math.abs(Math.sin(index + 1)) * 0x100000000),
	);

	for (let offset = 0; offset < paddedLength; offset += 64) {
		const words = Array.from({ length: 16 }, (_item, index) =>
			view.getUint32(offset + index * 4, true),
		);
		let aa = a;
		let bb = b;
		let cc = c;
		let dd = d;

		for (let index = 0; index < 64; index += 1) {
			let f = 0;
			let g = 0;
			if (index < 16) {
				f = (bb & cc) | (~bb & dd);
				g = index;
			} else if (index < 32) {
				f = (dd & bb) | (~dd & cc);
				g = (5 * index + 1) % 16;
			} else if (index < 48) {
				f = bb ^ cc ^ dd;
				g = (3 * index + 5) % 16;
			} else {
				f = cc ^ (bb | ~dd);
				g = (7 * index) % 16;
			}
			const temp = dd;
			dd = cc;
			cc = bb;
			bb = add32(
				bb,
				rotateLeft(
					add32(add32(aa, f), add32(table[index], words[g])),
					shifts[index],
				),
			);
			aa = temp;
		}

		a = add32(a, aa);
		b = add32(b, bb);
		c = add32(c, cc);
		d = add32(d, dd);
	}

	return [a, b, c, d]
		.flatMap((word) => [
			word & 0xff,
			(word >>> 8) & 0xff,
			(word >>> 16) & 0xff,
			(word >>> 24) & 0xff,
		])
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("");
}

function add32(a: number, b: number) {
	return (a + b) >>> 0;
}

function rotateLeft(value: number, amount: number) {
	return (value << amount) | (value >>> (32 - amount));
}
