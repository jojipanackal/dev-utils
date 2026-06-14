import { ArrowLeftIcon, CheckIcon, CoffeeIcon, EyeIcon } from "lucide-react";
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
import {
	baseBeverageOptions,
	type DevUser,
	isMygateUser,
	type PollState,
} from "#/lib/dev-utils-data";
import {
	getMygatePollVotes,
	type PersistedPollVote,
	setMygatePollVote,
} from "#/lib/server-user-data";
import { cn } from "#/lib/utils";

type MygatePollId = "morning-drinks" | "evening-drinks";

type MygatePoll = {
	description: string;
	id: MygatePollId;
	title: string;
};

const mygatePolls: Array<MygatePoll> = [
	{
		description: "Pick the morning drink for the team.",
		id: "morning-drinks",
		title: "Morning drinks",
	},
	{
		description: "Pick the evening drink for the team.",
		id: "evening-drinks",
		title: "Evening drinks",
	},
];

export function BeveragePollTool({ user }: { user: DevUser }) {
	const [state, setState] = React.useState<PollState>({
		votes: {},
	});
	const [activePollId, setActivePollId] = React.useState<MygatePollId | null>(
		null,
	);
	const [showVotes, setShowVotes] = React.useState(false);
	const canVote = isMygateUser(user.email);
	const activePoll = mygatePolls.find((poll) => poll.id === activePollId);

	React.useEffect(() => {
		if (!canVote) {
			setState({ votes: {} });
			return;
		}

		let isCurrent = true;
		void getMygatePollVotes()
			.then((votes) => {
				if (isCurrent) {
					setState({ votes });
				}
			})
			.catch((error) => {
				if (isCurrent) {
					toast.error("Unable to load poll votes", {
						description: error instanceof Error ? error.message : String(error),
					});
				}
			});

		return () => {
			isCurrent = false;
		};
	}, [canVote]);

	if (!canVote) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Mygate account required</CardTitle>
					<CardDescription>
						Sign in with a Google account ending in @mygate.com or @mygate.in to
						vote in Mygate polls.
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	if (activePoll) {
		return (
			<PollDetail
				onBack={() => {
					setActivePollId(null);
					setShowVotes(false);
				}}
				onShowVotesChange={setShowVotes}
				onVote={(optionId) => {
					setState((current) => ({
						...current,
						votes: {
							...current.votes,
							[activePoll.id]: {
								...(current.votes[activePoll.id] ?? {}),
								[user.email]: {
									optionId,
									userEmail: user.email,
									userName: user.name || user.email,
									votedAt: new Date().toISOString(),
								},
							},
						},
					}));
					void setMygatePollVote({
						data: { optionId, pollId: activePoll.id },
					})
						.then((votes) => {
							setState((current) => ({
								...current,
								votes: { ...current.votes, [activePoll.id]: votes },
							}));
						})
						.catch((error) => {
							toast.error("Unable to save vote", {
								description:
									error instanceof Error ? error.message : String(error),
							});
						});
				}}
				poll={activePoll}
				showVotes={showVotes}
				user={user}
				votes={state.votes[activePoll.id] ?? {}}
			/>
		);
	}

	return (
		<div className="grid gap-4 md:grid-cols-2">
			{mygatePolls.map((poll) => {
				const votes = state.votes[poll.id] ?? {};
				const userVote = votes[user.email];

				return (
					<Card key={poll.id}>
						<CardHeader>
							<div className="flex items-start justify-between gap-3">
								<div className="grid gap-1">
									<CardTitle>{poll.title}</CardTitle>
									<CardDescription>{poll.description}</CardDescription>
								</div>
								<div className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground">
									<CoffeeIcon />
								</div>
							</div>
						</CardHeader>
						<CardContent className="flex items-center justify-between gap-3">
							<div className="flex flex-wrap gap-2">
								<Badge variant="secondary">
									{Object.keys(votes).length} votes
								</Badge>
								{userVote ? (
									<Badge variant="outline">
										{getOptionLabel(userVote.optionId)}
									</Badge>
								) : null}
							</div>
							<Button onClick={() => setActivePollId(poll.id)}>Open</Button>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}

function PollDetail({
	onBack,
	onShowVotesChange,
	onVote,
	poll,
	showVotes,
	user,
	votes,
}: {
	onBack: () => void;
	onShowVotesChange: (showVotes: boolean) => void;
	onVote: (optionId: string) => void;
	poll: MygatePoll;
	showVotes: boolean;
	user: DevUser;
	votes: Record<string, PersistedPollVote>;
}) {
	const totalVotes = Object.keys(votes).length;
	const userVote = votes[user.email]?.optionId ?? null;

	return (
		<div className="grid gap-4">
			<Card>
				<CardHeader>
					<CardTitle>{poll.title}</CardTitle>
					<CardDescription>{poll.description}</CardDescription>
					<CardAction>
						<div className="flex flex-wrap justify-end gap-2">
							<Button onClick={onBack} size="sm" variant="outline">
								<ArrowLeftIcon data-icon="inline-start" />
								Polls
							</Button>
							<Button
								onClick={() => onShowVotesChange(!showVotes)}
								size="sm"
								variant="outline"
							>
								<EyeIcon data-icon="inline-start" />
								View votes
							</Button>
						</div>
					</CardAction>
				</CardHeader>
				<CardContent className="grid gap-3">
					{baseBeverageOptions.map((option) => {
						const Icon = option.icon;
						const optionVotes = Object.values(votes).filter(
							(vote) => vote.optionId === option.id,
						).length;
						const percentage =
							totalVotes === 0
								? 0
								: Math.round((optionVotes / totalVotes) * 100);
						const selected = userVote === option.id;

						return (
							<button
								className={cn(
									"grid gap-2 rounded-lg border bg-background p-3 text-left transition hover:bg-muted",
									selected && "border-primary bg-muted",
								)}
								key={option.id}
								onClick={() => onVote(option.id)}
								type="button"
							>
								<div className="flex items-center justify-between gap-3">
									<div className="flex items-center gap-3">
										<div className="grid size-9 place-items-center rounded-lg bg-secondary text-secondary-foreground">
											<Icon />
										</div>
										<div>
											<p className="font-medium">{option.label}</p>
											<p className="text-sm text-muted-foreground">
												{optionVotes} vote{optionVotes === 1 ? "" : "s"}
											</p>
										</div>
									</div>
									{selected ? (
										<Badge>
											<CheckIcon />
											Your pick
										</Badge>
									) : null}
								</div>
								<div className="h-2 overflow-hidden rounded-full bg-muted">
									<div
										className="h-full rounded-full bg-primary transition-all"
										style={{ width: `${percentage}%` }}
									/>
								</div>
							</button>
						);
					})}
				</CardContent>
			</Card>

			{showVotes ? <VotesCard votes={votes} /> : null}
		</div>
	);
}

function VotesCard({ votes }: { votes: Record<string, PersistedPollVote> }) {
	const voteList = Object.values(votes).sort((first, second) =>
		first.userName.localeCompare(second.userName),
	);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Votes</CardTitle>
				<CardDescription>Who voted for what.</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-2">
				{voteList.length > 0 ? (
					voteList.map((vote) => (
						<div
							className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-background p-3 text-sm"
							key={vote.userEmail}
						>
							<div className="min-w-0">
								<p className="font-medium">{vote.userName}</p>
								<p className="truncate text-muted-foreground">
									{vote.userEmail}
								</p>
							</div>
							<Badge variant="outline">{getOptionLabel(vote.optionId)}</Badge>
						</div>
					))
				) : (
					<div className="rounded-lg border bg-muted p-4 text-sm text-muted-foreground">
						No votes yet.
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function getOptionLabel(optionId: string) {
	return (
		baseBeverageOptions.find((option) => option.id === optionId)?.label ??
		optionId
	);
}
