import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { asc, eq } from "drizzle-orm";
import { db } from "#/db";
import { mygatePollVote, userFavorite } from "#/db/schema";
import { auth } from "#/lib/auth";
import { isMygateUser, type ToolId } from "#/lib/dev-utils-data";

type SessionUser = {
	email: string;
	id: string;
	image?: string | null;
	name: string;
};

export type PersistedPollVote = {
	optionId: string;
	userEmail: string;
	userName: string;
	votedAt: string;
};

async function requireUser() {
	const session = await auth.api.getSession({
		headers: getRequestHeaders(),
	});

	if (!session?.user) {
		throw new Error("Authentication required");
	}

	return session.user as SessionUser;
}

export const getFavorites = createServerFn({ method: "GET" }).handler(
	async () => {
		const user = await requireUser();
		const rows = await db
			.select()
			.from(userFavorite)
			.where(eq(userFavorite.userId, user.id))
			.orderBy(asc(userFavorite.sortOrder), asc(userFavorite.createdAt));

		return rows.map((row) => row.toolId as ToolId);
	},
);

export const setFavorites = createServerFn({ method: "POST" })
	.validator((value: Array<ToolId>) => value)
	.handler(async ({ data }) => {
		const user = await requireUser();
		await db.delete(userFavorite).where(eq(userFavorite.userId, user.id));

		if (data.length > 0) {
			await db.insert(userFavorite).values(
				data.map((toolId, index) => ({
					sortOrder: index,
					toolId,
					userId: user.id,
				})),
			);
		}

		return data;
	});

export const getMygatePollVotes = createServerFn({ method: "GET" }).handler(
	async () => {
		const user = await requireUser();
		if (!isMygateUser(user.email)) {
			return {};
		}

		const rows = await db.select().from(mygatePollVote);
		return rows.reduce<Record<string, Record<string, PersistedPollVote>>>(
			(result, row) => {
				result[row.pollId] ??= {};
				result[row.pollId][row.userEmail] = {
					optionId: row.optionId,
					userEmail: row.userEmail,
					userName: row.userName,
					votedAt: row.votedAt.toISOString(),
				};
				return result;
			},
			{},
		);
	},
);

export const setMygatePollVote = createServerFn({ method: "POST" })
	.validator((value: { optionId: string; pollId: string }) => value)
	.handler(async ({ data }) => {
		const user = await requireUser();
		if (!isMygateUser(user.email)) {
			throw new Error("Mygate account required");
		}

		await db
			.insert(mygatePollVote)
			.values({
				optionId: data.optionId,
				pollId: data.pollId,
				userEmail: user.email,
				userId: user.id,
				userName: user.name || user.email,
				votedAt: new Date(),
			})
			.onConflictDoUpdate({
				set: {
					optionId: data.optionId,
					userEmail: user.email,
					userName: user.name || user.email,
					votedAt: new Date(),
				},
				target: [mygatePollVote.pollId, mygatePollVote.userId],
			});

		const rows = await db
			.select()
			.from(mygatePollVote)
			.where(eq(mygatePollVote.pollId, data.pollId));

		return rows.reduce<Record<string, PersistedPollVote>>((result, row) => {
			result[row.userEmail] = {
				optionId: row.optionId,
				userEmail: row.userEmail,
				userName: row.userName,
				votedAt: row.votedAt.toISOString(),
			};
			return result;
		}, {});
	});
