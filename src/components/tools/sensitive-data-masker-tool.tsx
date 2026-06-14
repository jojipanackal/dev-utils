import { ClipboardIcon, ShieldCheckIcon } from "lucide-react";
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
import { Switch } from "#/components/ui/switch";
import { Textarea } from "#/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "#/components/ui/toggle-group";
import { useLocalStorageState } from "#/lib/dev-utils-state";
import { cn } from "#/lib/utils";

type RedactionMode = "mask" | "remove";
type DetectorId =
	| "credentials"
	| "emails"
	| "phones"
	| "cards"
	| "ids"
	| "network";

type Detector = {
	description: string;
	id: DetectorId;
	label: string;
};

const inputStorageKey = "dev-utils:sensitive-masker:input:v2";
const outputStorageKey = "dev-utils:sensitive-masker:output:v2";
const modeStorageKey = "dev-utils:sensitive-masker:mode";
const enabledStorageKey = "dev-utils:sensitive-masker:enabled";

const defaultInput = "";

const detectors: Array<Detector> = [
	{
		description:
			"API keys, bearer tokens, JWTs, passwords, and common secrets.",
		id: "credentials",
		label: "Credentials",
	},
	{
		description: "Email addresses in prompts, logs, and support text.",
		id: "emails",
		label: "Emails",
	},
	{
		description: "Phone-like numeric contact values.",
		id: "phones",
		label: "Phones",
	},
	{
		description: "Credit card-like numbers that pass a Luhn check.",
		id: "cards",
		label: "Cards",
	},
	{
		description: "SSNs and other common personal identifiers.",
		id: "ids",
		label: "IDs",
	},
	{
		description: "IPv4 addresses and URLs containing embedded credentials.",
		id: "network",
		label: "Network",
	},
];

const defaultEnabled = detectors.reduce(
	(result, detector) => {
		result[detector.id] = true;
		return result;
	},
	{} as Record<DetectorId, boolean>,
);

export function SensitiveDataMaskerTool() {
	const [input, setInput] = useLocalStorageState(inputStorageKey, defaultInput);
	const [output, setOutput] = useLocalStorageState(outputStorageKey, "");
	const [mode, setMode] = useLocalStorageState<RedactionMode>(
		modeStorageKey,
		"mask",
	);
	const [enabled, setEnabled] = useLocalStorageState(
		enabledStorageKey,
		defaultEnabled,
	);
	const [lastCounts, setLastCounts] = React.useState<
		Record<DetectorId, number>
	>(() => emptyCounts());
	const totalFindings = Object.values(lastCounts).reduce(
		(total, count) => total + count,
		0,
	);

	function runRedaction() {
		const result = redactSensitiveData(input, mode, {
			...defaultEnabled,
			...enabled,
		});
		setOutput(result.text);
		setLastCounts(result.counts);

		if (result.total === 0) {
			toast.info("No sensitive data found");
			return;
		}

		toast.success(
			`${mode === "mask" ? "Masked" : "Removed"} ${result.total} item${
				result.total === 1 ? "" : "s"
			}`,
		);
	}

	async function copyOutput() {
		if (!output) {
			toast.info("Nothing to copy");
			return;
		}

		await navigator.clipboard.writeText(output);
		toast.success("Sanitized text copied");
	}

	return (
		<div className="grid gap-4">
			<Card>
				<CardHeader>
					<CardTitle>Redaction settings</CardTitle>
					<CardDescription>
						Choose how sensitive data should be handled before sharing text.
					</CardDescription>
					<CardAction>
						<ToggleGroup
							onValueChange={(value) => {
								if (value === "mask" || value === "remove") {
									setMode(value);
								}
							}}
							type="single"
							value={mode}
							variant="outline"
						>
							<ToggleGroupItem value="mask">Mask</ToggleGroupItem>
							<ToggleGroupItem value="remove">Remove</ToggleGroupItem>
						</ToggleGroup>
					</CardAction>
				</CardHeader>
				<CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
					{detectors.map((detector) => (
						<div
							className="flex min-h-24 items-start justify-between gap-3 rounded-lg border bg-background p-3"
							key={detector.id}
						>
							<div className="grid gap-1">
								<span className="text-sm font-medium">{detector.label}</span>
								<p className="text-sm text-muted-foreground">
									{detector.description}
								</p>
							</div>
							<Switch
								aria-label={detector.label}
								checked={enabled[detector.id] ?? true}
								onCheckedChange={(checked) =>
									setEnabled((current) => ({
										...current,
										[detector.id]: checked,
									}))
								}
							/>
						</div>
					))}
				</CardContent>
			</Card>

			<div className="grid gap-4 xl:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Input text</CardTitle>
						<CardDescription>
							Paste prompts, logs, tickets, or raw text.
						</CardDescription>
						<CardAction>
							<Button onClick={runRedaction}>
								<ShieldCheckIcon data-icon="inline-start" />
								Sanitize
							</Button>
						</CardAction>
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
						<CardTitle>Sanitized output</CardTitle>
						<CardDescription>
							Review the text before passing it to an AI model.
						</CardDescription>
						<CardAction>
							<div className="flex flex-wrap justify-end gap-2">
								<Button onClick={copyOutput} size="sm" variant="outline">
									<ClipboardIcon data-icon="inline-start" />
									Copy
								</Button>
							</div>
						</CardAction>
					</CardHeader>
					<CardContent className="grid gap-3">
						<Textarea
							className="min-h-96 resize-y font-mono text-sm leading-6"
							onChange={(event) => setOutput(event.target.value)}
							spellCheck={false}
							value={output}
						/>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Detection counts</CardTitle>
					<CardDescription>
						Counts from the most recent sanitize action.
					</CardDescription>
					<CardAction>
						<Badge variant={totalFindings > 0 ? "secondary" : "outline"}>
							{totalFindings} found
						</Badge>
					</CardAction>
				</CardHeader>
				<CardContent>
					<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
						{detectors.map((detector) => (
							<div
								className={cn(
									"flex items-center justify-between rounded-lg border px-3 py-2 text-sm",
									lastCounts[detector.id] > 0 && "bg-muted",
								)}
								key={detector.id}
							>
								<span>{detector.label}</span>
								<Badge variant="outline">{lastCounts[detector.id] ?? 0}</Badge>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

function redactSensitiveData(
	value: string,
	mode: RedactionMode,
	enabled: Record<DetectorId, boolean>,
) {
	const counts = emptyCounts();
	const replacement = (label: string) => (mode === "mask" ? `[${label}]` : "");
	let text = value;

	if (enabled.credentials) {
		text = text.replace(
			/\b(aws_access_key_id|api[_-]?key|token|secret|password|passwd|pwd|client[_-]?secret|access[_-]?token|refresh[_-]?token)\b(\s*[:=]\s*)(["']?)([^"',\s}]+)(["']?)/gi,
			(
				_match,
				key: string,
				separator: string,
				open: string,
				_secret: string,
				close: string,
			) => {
				counts.credentials += 1;
				return `${key}${separator}${open}${replacement("REDACTED_SECRET")}${close}`;
			},
		);
		text = replaceAll(
			text,
			/\bBearer\s+[A-Za-z0-9._~+/=-]+\b/gi,
			counts,
			"credentials",
			replacement("REDACTED_TOKEN"),
		);
		text = replaceAll(
			text,
			/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g,
			counts,
			"credentials",
			replacement("REDACTED_JWT"),
		);
		text = replaceAll(
			text,
			/\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g,
			counts,
			"credentials",
			replacement("REDACTED_AWS_KEY"),
		);
		text = replaceAll(
			text,
			/\b(?:sk|pk|ghp|github_pat|xox[baprs])[-_A-Za-z0-9]{16,}\b/g,
			counts,
			"credentials",
			replacement("REDACTED_SECRET"),
		);
	}

	if (enabled.emails) {
		text = replaceAll(
			text,
			/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
			counts,
			"emails",
			replacement("REDACTED_EMAIL"),
		);
	}

	if (enabled.ids) {
		text = replaceAll(
			text,
			/\b\d{3}-\d{2}-\d{4}\b/g,
			counts,
			"ids",
			replacement("REDACTED_ID"),
		);
	}

	if (enabled.cards) {
		text = text.replace(/\b(?:\d[ -]*?){13,19}\b/g, (match) => {
			const digits = match.replace(/\D/g, "");

			if (!isLikelyCardNumber(digits)) {
				return match;
			}

			counts.cards += 1;
			return replacement("REDACTED_CARD");
		});
	}

	if (enabled.phones) {
		text = text.replace(/\b\+?\d[\d\s().-]{7,}\d\b/g, (match) => {
			const digits = match.replace(/\D/g, "");

			if (digits.length < 8 || digits.length > 15) {
				return match;
			}

			counts.phones += 1;
			return replacement("REDACTED_PHONE");
		});
	}

	if (enabled.network) {
		text = replaceAll(
			text,
			/\bhttps?:\/\/[^/\s:@]+:[^/\s@]+@[^\s]+/gi,
			counts,
			"network",
			replacement("REDACTED_URL"),
		);
		text = replaceAll(
			text,
			/\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g,
			counts,
			"network",
			replacement("REDACTED_IP"),
		);
	}

	return {
		counts,
		text,
		total: Object.values(counts).reduce((total, count) => total + count, 0),
	};
}

function replaceAll(
	value: string,
	pattern: RegExp,
	counts: Record<DetectorId, number>,
	detector: DetectorId,
	replacement: string,
) {
	return value.replace(pattern, () => {
		counts[detector] += 1;
		return replacement;
	});
}

function emptyCounts() {
	return detectors.reduce(
		(result, detector) => {
			result[detector.id] = 0;
			return result;
		},
		{} as Record<DetectorId, number>,
	);
}

function isLikelyCardNumber(value: string) {
	if (value.length < 13 || value.length > 19) {
		return false;
	}

	let sum = 0;
	let shouldDouble = false;

	for (let index = value.length - 1; index >= 0; index -= 1) {
		let digit = Number(value[index]);

		if (!Number.isInteger(digit)) {
			return false;
		}

		if (shouldDouble) {
			digit *= 2;
			if (digit > 9) {
				digit -= 9;
			}
		}

		sum += digit;
		shouldDouble = !shouldDouble;
	}

	return sum % 10 === 0;
}
