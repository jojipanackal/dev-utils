import { ArrowLeftIcon, BracesIcon, GitCompareArrowsIcon } from "lucide-react";
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
import { Switch } from "#/components/ui/switch";
import { Textarea } from "#/components/ui/textarea";
import { defaultJsonLeft, defaultJsonRight } from "#/lib/dev-utils-data";
import { readErrorMessage, useLocalStorageState } from "#/lib/dev-utils-state";
import { cn } from "#/lib/utils";

type CompareOptions = {
	comparisonDepth: number;
	ignoreWhitespace: boolean;
	showUnchanged: boolean;
};

type LineStatus = "equal" | "added" | "removed" | "changed";

type DiffLine = {
	leftLineNumber: number | null;
	leftText: string;
	rightLineNumber: number | null;
	rightText: string;
	status: LineStatus;
};

type SideDiffLine = {
	lineNumber: number;
	status: LineStatus;
	text: string;
};

type CompareResult = {
	equal: boolean;
	leftLines: Array<SideDiffLine>;
	rightLines: Array<SideDiffLine>;
	rows: Array<DiffLine>;
	summary: {
		added: number;
		removed: number;
		changed: number;
		unchanged: number;
	};
};

type ParsedJson = {
	error: string | null;
	value: unknown;
};

type ToolView = "input" | "result";

const defaultOptions: CompareOptions = {
	comparisonDepth: 2,
	ignoreWhitespace: false,
	showUnchanged: false,
};

const leftJsonDraftStorageKey = "dev-utils:json-compare:left:v2";
const rightJsonDraftStorageKey = "dev-utils:json-compare:right:v2";
const compareOptionsStorageKey = "dev-utils:json-compare:options";
const compareResultStorageKey = "dev-utils:json-compare:result:v2";
const compareViewStorageKey = "dev-utils:json-compare:view:v2";

export function JsonComparisonTool() {
	const [leftJson, setLeftJson] = useLocalStorageState(
		leftJsonDraftStorageKey,
		defaultJsonLeft,
	);
	const [rightJson, setRightJson] = useLocalStorageState(
		rightJsonDraftStorageKey,
		defaultJsonRight,
	);
	const [storedOptions, setStoredOptions] = useLocalStorageState<
		Partial<CompareOptions>
	>(compareOptionsStorageKey, defaultOptions);
	const options = {
		...defaultOptions,
		...storedOptions,
		comparisonDepth:
			typeof storedOptions.comparisonDepth === "number"
				? Math.max(storedOptions.comparisonDepth, 1)
				: defaultOptions.comparisonDepth,
	};
	const [result, setResult] = useLocalStorageState<CompareResult | null>(
		compareResultStorageKey,
		null,
	);
	const [view, setView] = useLocalStorageState<ToolView>(
		compareViewStorageKey,
		"input",
	);

	function updateOption<Key extends keyof CompareOptions>(
		key: Key,
		value: CompareOptions[Key],
	) {
		setStoredOptions((current) => ({ ...current, [key]: value }));
	}

	function prettify(side: "left" | "right") {
		const input = side === "left" ? leftJson : rightJson;
		const parsed = parseJson(input);

		if (parsed.error) {
			toast.error(`${side === "left" ? "Source" : "Target"} JSON is invalid`, {
				description: parsed.error,
			});
			return;
		}

		const nextValue = JSON.stringify(parsed.value, null, 2);
		if (side === "left") {
			setLeftJson(nextValue);
		} else {
			setRightJson(nextValue);
		}
		setResult(null);
		setView("input");
		toast.success(`${side === "left" ? "Source" : "Target"} JSON prettified`);
	}

	function compare() {
		const nextResult = buildCompareResult(leftJson, rightJson, options);

		if ("error" in nextResult) {
			toast.error(nextResult.title, {
				description: nextResult.error,
			});
			return;
		}

		setResult(nextResult);
		setView("result");
		if (nextResult.equal) {
			toast.success("JSON matches");
			return;
		}

		const changedCount =
			nextResult.summary.added +
			nextResult.summary.removed +
			nextResult.summary.changed;
		toast.info("Differences found", {
			description: `${changedCount} changed line${
				changedCount === 1 ? "" : "s"
			}`,
		});
	}

	if (view === "result" && result) {
		return (
			<ResultView onCompareAgain={() => setView("input")} result={result} />
		);
	}

	return (
		<div className="grid gap-4">
			<CompareOptionsCard
				onCompare={compare}
				onOptionChange={updateOption}
				options={options}
			/>

			<div className="grid gap-4 xl:grid-cols-2">
				<JsonEditorCard
					label="Source JSON"
					onChange={(value) => {
						setLeftJson(value);
						setResult(null);
						setView("input");
					}}
					onPrettify={() => prettify("left")}
					value={leftJson}
				/>
				<JsonEditorCard
					label="Target JSON"
					onChange={(value) => {
						setRightJson(value);
						setResult(null);
						setView("input");
					}}
					onPrettify={() => prettify("right")}
					value={rightJson}
				/>
			</div>
		</div>
	);
}

function CompareOptionsCard({
	onCompare,
	onOptionChange,
	options,
}: {
	onCompare: () => void;
	onOptionChange: <Key extends keyof CompareOptions>(
		key: Key,
		value: CompareOptions[Key],
	) => void;
	options: CompareOptions;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Compare settings</CardTitle>
				<CardDescription>
					Choose how the JSON should be prepared before comparing lines.
				</CardDescription>
				<CardAction>
					<Button onClick={onCompare}>
						<GitCompareArrowsIcon data-icon="inline-start" />
						Compare
					</Button>
				</CardAction>
			</CardHeader>
			<CardContent className="grid gap-3 md:grid-cols-3">
				<DepthControl
					onChange={(value) => onOptionChange("comparisonDepth", value)}
					value={options.comparisonDepth}
				/>
				<OptionSwitch
					checked={options.ignoreWhitespace}
					description="Treat spacing-only line changes as equal."
					label="Ignore whitespace"
					onCheckedChange={(checked) =>
						onOptionChange("ignoreWhitespace", checked)
					}
				/>
				<OptionSwitch
					checked={options.showUnchanged}
					description="Keep matching lines visible in the result."
					label="Show unchanged"
					onCheckedChange={(checked) =>
						onOptionChange("showUnchanged", checked)
					}
				/>
			</CardContent>
		</Card>
	);
}

function DepthControl({
	onChange,
	value,
}: {
	onChange: (value: number) => void;
	value: number;
}) {
	return (
		<div className="flex min-h-24 items-start justify-between gap-3 rounded-lg border bg-background p-3">
			<div className="grid gap-1">
				<label className="text-sm font-medium" htmlFor="comparison-depth">
					Comparison level
				</label>
				<p className="text-sm text-muted-foreground">
					Compare nested JSON down to this depth.
				</p>
			</div>
			<Input
				className="w-20"
				id="comparison-depth"
				min={1}
				onChange={(event) => {
					const nextValue = Number(event.target.value);
					onChange(Number.isFinite(nextValue) ? Math.max(nextValue, 1) : 1);
				}}
				type="number"
				value={value}
			/>
		</div>
	);
}

function OptionSwitch({
	checked,
	description,
	label,
	onCheckedChange,
}: {
	checked: boolean;
	description: string;
	label: string;
	onCheckedChange: (checked: boolean) => void;
}) {
	return (
		<div className="flex min-h-24 items-start justify-between gap-3 rounded-lg border bg-background p-3">
			<div className="grid gap-1">
				<span className="text-sm font-medium">{label}</span>
				<p className="text-sm text-muted-foreground">{description}</p>
			</div>
			<Switch
				aria-label={label}
				checked={checked}
				onCheckedChange={onCheckedChange}
			/>
		</div>
	);
}

function JsonEditorCard({
	label,
	onChange,
	onPrettify,
	value,
}: {
	label: string;
	onChange: (value: string) => void;
	onPrettify: () => void;
	value: string;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{label}</CardTitle>
				<CardDescription>Paste JSON, then compare when ready.</CardDescription>
				<CardAction>
					<Button onClick={onPrettify} size="sm" variant="outline">
						<BracesIcon data-icon="inline-start" />
						Prettify
					</Button>
				</CardAction>
			</CardHeader>
			<CardContent>
				<Textarea
					className="min-h-96 resize-y font-mono text-sm leading-6"
					onChange={(event) => onChange(event.target.value)}
					spellCheck={false}
					value={value}
				/>
			</CardContent>
		</Card>
	);
}

function ResultView({
	onCompareAgain,
	result,
}: {
	onCompareAgain: () => void;
	result: CompareResult;
}) {
	return (
		<div className="grid gap-4">
			<Card>
				<CardHeader>
					<CardTitle>Comparison result</CardTitle>
					<CardDescription>
						Review aligned line differences between source and target.
					</CardDescription>
					<CardAction>
						<div className="flex flex-wrap items-center justify-end gap-2">
							<Badge variant={result.equal ? "default" : "secondary"}>
								{result.equal ? "Matches" : "Different"}
							</Badge>
							<Button onClick={onCompareAgain} size="sm" variant="outline">
								<ArrowLeftIcon data-icon="inline-start" />
								Compare again
							</Button>
						</div>
					</CardAction>
				</CardHeader>
				<CardContent>
					<div className="grid gap-3 md:grid-cols-4">
						<SummaryStat label="Changed" value={result.summary.changed} />
						<SummaryStat label="Added" value={result.summary.added} />
						<SummaryStat label="Removed" value={result.summary.removed} />
						<SummaryStat label="Unchanged" value={result.summary.unchanged} />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Line differences</CardTitle>
					<CardDescription>
						Blank cells mark lines that only exist on one side.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<DiffRows rows={result.rows} />
				</CardContent>
			</Card>
		</div>
	);
}

function SummaryStat({ label, value }: { label: string; value: number }) {
	return (
		<div className="rounded-lg border bg-background p-3">
			<p className="text-sm text-muted-foreground">{label}</p>
			<p className="text-2xl font-semibold">{value}</p>
		</div>
	);
}

function DiffRows({ rows }: { rows: Array<DiffLine> }) {
	if (rows.length === 0) {
		return (
			<div className="flex min-h-40 items-center justify-center rounded-lg border bg-muted text-sm text-muted-foreground">
				No lines to show with the current settings.
			</div>
		);
	}

	return (
		<div className="max-h-[42rem] overflow-auto rounded-lg border bg-background">
			<div className="grid min-w-[56rem] grid-cols-2 border-b bg-muted text-sm font-medium">
				<div className="border-r px-3 py-2">Source JSON</div>
				<div className="px-3 py-2">Target JSON</div>
			</div>
			{rows.map((row) => (
				<div
					className="grid min-w-[56rem] grid-cols-2 border-b last:border-b-0"
					key={`${row.leftLineNumber ?? "x"}-${row.rightLineNumber ?? "x"}-${
						row.status
					}-${row.leftText}-${row.rightText}`}
				>
					<DiffCell
						lineNumber={row.leftLineNumber}
						status={row.status === "added" ? "equal" : row.status}
						text={row.leftText}
					/>
					<DiffCell
						lineNumber={row.rightLineNumber}
						status={row.status === "removed" ? "equal" : row.status}
						text={row.rightText}
					/>
				</div>
			))}
		</div>
	);
}

function DiffCell({
	lineNumber,
	status,
	text,
}: {
	lineNumber: number | null;
	status: LineStatus;
	text: string;
}) {
	return (
		<div
			className={cn(
				"grid min-h-9 grid-cols-[4rem_1fr] border-r last:border-r-0 text-sm",
				status === "added" && "bg-primary/10",
				status === "removed" && "bg-destructive/10",
				status === "changed" && "bg-accent/35",
			)}
		>
			<div className="select-none border-r px-2 py-1.5 text-right font-mono text-xs text-muted-foreground">
				{lineNumber ?? ""}
			</div>
			<pre className="overflow-x-auto whitespace-pre-wrap px-3 py-1.5 font-mono leading-5">
				<code className="border-0 bg-transparent p-0 text-xs">
					{text || " "}
				</code>
			</pre>
		</div>
	);
}

function buildCompareResult(
	leftInput: string,
	rightInput: string,
	options: CompareOptions,
): CompareResult | { title: string; error: string } {
	const left = parseJson(leftInput);
	if (left.error) {
		return { title: "Source JSON is invalid", error: left.error };
	}

	const right = parseJson(rightInput);
	if (right.error) {
		return { title: "Target JSON is invalid", error: right.error };
	}

	const leftLines = toDisplayLines(left.value, options);
	const rightLines = toDisplayLines(right.value, options);
	const rows = buildLineDiff(leftLines, rightLines, options).filter(
		(row) => options.showUnchanged || row.status !== "equal",
	);
	const allRows = buildLineDiff(leftLines, rightLines, options);
	const summary = allRows.reduce(
		(current, row) => {
			if (row.status === "added") {
				current.added += 1;
			} else if (row.status === "removed") {
				current.removed += 1;
			} else if (row.status === "changed") {
				current.changed += 1;
			} else {
				current.unchanged += 1;
			}
			return current;
		},
		{ added: 0, changed: 0, removed: 0, unchanged: 0 },
	);

	return {
		equal:
			summary.added === 0 && summary.removed === 0 && summary.changed === 0,
		leftLines: buildSideLines(rows, "left"),
		rightLines: buildSideLines(rows, "right"),
		rows,
		summary,
	};
}

function toDisplayLines(value: unknown, options: CompareOptions) {
	const prepared = limitJsonDepth(value, options.comparisonDepth);
	return JSON.stringify(prepared, null, 2)
		.split("\n")
		.map((text, index) => ({
			compareText: normalizeLine(text, options),
			lineNumber: index + 1,
			text,
		}));
}

function buildSideLines(
	rows: Array<DiffLine>,
	side: "left" | "right",
): Array<SideDiffLine> {
	return rows.flatMap((row) => {
		if (side === "left") {
			if (row.leftLineNumber === null) {
				return [];
			}

			return [
				{
					lineNumber: row.leftLineNumber,
					status: row.status === "added" ? "equal" : row.status,
					text: row.leftText,
				},
			];
		}

		if (row.rightLineNumber === null) {
			return [];
		}

		return [
			{
				lineNumber: row.rightLineNumber,
				status: row.status === "removed" ? "equal" : row.status,
				text: row.rightText,
			},
		];
	});
}

function buildLineDiff(
	leftLines: Array<{ compareText: string; lineNumber: number; text: string }>,
	rightLines: Array<{ compareText: string; lineNumber: number; text: string }>,
	options: CompareOptions,
): Array<DiffLine> {
	const operations = buildDiffOperations(leftLines, rightLines);
	const rows: Array<DiffLine> = [];

	for (let index = 0; index < operations.length; index += 1) {
		const operation = operations[index];

		if (operation.type === "equal") {
			rows.push({
				leftLineNumber: operation.left.lineNumber,
				leftText: operation.left.text,
				rightLineNumber: operation.right.lineNumber,
				rightText: operation.right.text,
				status: "equal",
			});
			continue;
		}

		if (operation.type === "remove") {
			const removed = [operation];
			while (operations[index + 1]?.type === "remove") {
				index += 1;
				removed.push(operations[index]);
			}

			const added = [];
			while (operations[index + 1]?.type === "add") {
				index += 1;
				added.push(operations[index]);
			}

			if (added.length > 0) {
				const rowCount = Math.max(removed.length, added.length);
				for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
					const left = removed[rowIndex]?.left ?? null;
					const right = added[rowIndex]?.right ?? null;
					rows.push({
						leftLineNumber: left?.lineNumber ?? null,
						leftText: left?.text ?? "",
						rightLineNumber: right?.lineNumber ?? null,
						rightText: right?.text ?? "",
						status:
							left && right && left.compareText !== right.compareText
								? "changed"
								: left
									? "removed"
									: "added",
					});
				}
			} else {
				for (const removedLine of removed) {
					rows.push({
						leftLineNumber: removedLine.left.lineNumber,
						leftText: removedLine.left.text,
						rightLineNumber: null,
						rightText: "",
						status: "removed",
					});
				}
			}
			continue;
		}

		rows.push({
			leftLineNumber: null,
			leftText: "",
			rightLineNumber: operation.right.lineNumber,
			rightText: operation.right.text,
			status: "added",
		});
	}

	if (options.ignoreWhitespace) {
		return rows.map((row) =>
			row.status === "changed" &&
			normalizeLine(row.leftText, options) ===
				normalizeLine(row.rightText, options)
				? { ...row, status: "equal" }
				: row,
		);
	}

	return rows;
}

function buildDiffOperations(
	leftLines: Array<{ compareText: string; lineNumber: number; text: string }>,
	rightLines: Array<{ compareText: string; lineNumber: number; text: string }>,
) {
	const matrix = Array.from({ length: leftLines.length + 1 }, () =>
		Array.from({ length: rightLines.length + 1 }, () => 0),
	);

	for (let leftIndex = leftLines.length - 1; leftIndex >= 0; leftIndex -= 1) {
		for (
			let rightIndex = rightLines.length - 1;
			rightIndex >= 0;
			rightIndex -= 1
		) {
			matrix[leftIndex][rightIndex] =
				leftLines[leftIndex].compareText === rightLines[rightIndex].compareText
					? matrix[leftIndex + 1][rightIndex + 1] + 1
					: Math.max(
							matrix[leftIndex + 1][rightIndex],
							matrix[leftIndex][rightIndex + 1],
						);
		}
	}

	const operations: Array<
		| {
				left: (typeof leftLines)[number];
				right: (typeof rightLines)[number];
				type: "equal";
		  }
		| { left: (typeof leftLines)[number]; type: "remove" }
		| { right: (typeof rightLines)[number]; type: "add" }
	> = [];
	let leftIndex = 0;
	let rightIndex = 0;

	while (leftIndex < leftLines.length && rightIndex < rightLines.length) {
		if (
			leftLines[leftIndex].compareText === rightLines[rightIndex].compareText
		) {
			operations.push({
				left: leftLines[leftIndex],
				right: rightLines[rightIndex],
				type: "equal",
			});
			leftIndex += 1;
			rightIndex += 1;
		} else if (
			matrix[leftIndex + 1][rightIndex] >= matrix[leftIndex][rightIndex + 1]
		) {
			operations.push({ left: leftLines[leftIndex], type: "remove" });
			leftIndex += 1;
		} else {
			operations.push({ right: rightLines[rightIndex], type: "add" });
			rightIndex += 1;
		}
	}

	while (leftIndex < leftLines.length) {
		operations.push({ left: leftLines[leftIndex], type: "remove" });
		leftIndex += 1;
	}

	while (rightIndex < rightLines.length) {
		operations.push({ right: rightLines[rightIndex], type: "add" });
		rightIndex += 1;
	}

	return operations;
}

function normalizeLine(line: string, options: CompareOptions) {
	return options.ignoreWhitespace ? line.replace(/\s+/g, "") : line;
}

function parseJson(value: string): ParsedJson {
	try {
		return { value: JSON.parse(value), error: null };
	} catch (error) {
		return { value: null, error: readErrorMessage(error) };
	}
}

function limitJsonDepth(
	value: unknown,
	maxDepth: number,
	currentDepth = 0,
): unknown {
	if (Array.isArray(value)) {
		if (currentDepth >= maxDepth) {
			return `[${value.length} item${value.length === 1 ? "" : "s"}]`;
		}

		return value.map((item) =>
			limitJsonDepth(item, maxDepth, currentDepth + 1),
		);
	}

	if (value && typeof value === "object") {
		if (currentDepth >= maxDepth) {
			return "{...}";
		}

		return Object.entries(value as Record<string, unknown>).reduce<
			Record<string, unknown>
		>((result, [key, item]) => {
			result[key] = limitJsonDepth(item, maxDepth, currentDepth + 1);
			return result;
		}, {});
	}

	return value;
}
