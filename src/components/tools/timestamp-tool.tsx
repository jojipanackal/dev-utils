import { ClockIcon, CopyIcon } from "lucide-react";
import * as React from "react";
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
import { ToggleGroup, ToggleGroupItem } from "#/components/ui/toggle-group";

type TimeInputMode = "timestamp" | "human";

export function TimestampTool() {
	const [mode, setMode] = React.useState<TimeInputMode>("timestamp");
	const [timestampInput, setTimestampInput] = React.useState(() =>
		String(Math.floor(Date.now() / 1000)),
	);
	const [humanInput, setHumanInput] = React.useState(() =>
		toDateTimeLocalValue(new Date()),
	);
	const parsedDate =
		mode === "timestamp"
			? parseTimestamp(timestampInput)
			: parseHumanTime(humanInput);

	function setNow() {
		const now = new Date();
		setTimestampInput(String(Math.floor(now.getTime() / 1000)));
		setHumanInput(toDateTimeLocalValue(now));
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Convert timestamp</CardTitle>
				<CardDescription>
					Supports Unix seconds, Unix milliseconds, ISO strings, and human
					date-time input.
				</CardDescription>
				<CardAction>
					<div className="flex flex-wrap justify-end gap-2">
						<ToggleGroup
							onValueChange={(value) => {
								if (value === "timestamp" || value === "human") {
									setMode(value);
								}
							}}
							type="single"
							value={mode}
							variant="outline"
						>
							<ToggleGroupItem value="timestamp">Timestamp</ToggleGroupItem>
							<ToggleGroupItem value="human">Human time</ToggleGroupItem>
						</ToggleGroup>
						<Button onClick={setNow} size="sm" variant="outline">
							<ClockIcon data-icon="inline-start" />
							Now
						</Button>
					</div>
				</CardAction>
			</CardHeader>
			<CardContent className="grid gap-4">
				{mode === "timestamp" ? (
					<div className="grid gap-2">
						<label className="text-sm font-medium" htmlFor="timestamp">
							Timestamp
						</label>
						<Input
							id="timestamp"
							onChange={(event) => setTimestampInput(event.target.value)}
							placeholder="Enter a timestamp or ISO date"
							value={timestampInput}
						/>
					</div>
				) : (
					<div className="grid gap-2">
						<label className="text-sm font-medium" htmlFor="human-time">
							Human time
						</label>
						<Input
							id="human-time"
							onChange={(event) => setHumanInput(event.target.value)}
							type="datetime-local"
							value={humanInput}
						/>
					</div>
				)}

				{parsedDate ? (
					<div className="grid gap-3 md:grid-cols-2">
						<TimestampResult
							label="Local time"
							value={parsedDate.toLocaleString()}
						/>
						<TimestampResult label="UTC" value={parsedDate.toISOString()} />
						<TimestampResult
							label="Unix seconds"
							value={String(Math.floor(parsedDate.getTime() / 1000))}
						/>
						<TimestampResult
							label="Unix milliseconds"
							value={String(parsedDate.getTime())}
						/>
					</div>
				) : (
					<div className="rounded-lg border bg-muted p-4 text-sm text-muted-foreground">
						Enter a valid timestamp, ISO date, or human date-time.
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function TimestampResult({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-center justify-between gap-3 rounded-lg border bg-background p-3">
			<div className="min-w-0">
				<p className="text-sm font-medium text-muted-foreground">{label}</p>
				<p className="truncate font-mono text-sm">{value}</p>
			</div>
			<Button
				onClick={() => void navigator.clipboard?.writeText(value)}
				size="icon-sm"
				variant="ghost"
			>
				<CopyIcon data-icon="inline-start" />
				<span className="sr-only">Copy {label}</span>
			</Button>
		</div>
	);
}

function parseTimestamp(value: string) {
	const trimmed = value.trim();
	if (!trimmed) {
		return null;
	}

	const numeric = Number(trimmed);
	const date = Number.isFinite(numeric)
		? new Date(trimmed.length <= 10 ? numeric * 1000 : numeric)
		: new Date(trimmed);

	return Number.isNaN(date.getTime()) ? null : date;
}

function parseHumanTime(value: string) {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
}

function toDateTimeLocalValue(date: Date) {
	const offset = date.getTimezoneOffset();
	const localDate = new Date(date.getTime() - offset * 60_000);
	return localDate.toISOString().slice(0, 16);
}
