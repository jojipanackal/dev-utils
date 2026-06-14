import { createFileRoute } from "@tanstack/react-router";
import { StarIcon } from "lucide-react";
import * as React from "react";
import {
	AuthenticatedApp,
	FavoriteToolItem,
	ToolCard,
} from "#/components/dev-utils/app-shell";
import { Badge } from "#/components/ui/badge";
import { Input } from "#/components/ui/input";
import { getVisibleTools } from "#/lib/dev-utils-data";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	const [searchQuery, setSearchQuery] = React.useState("");

	return (
		<AuthenticatedApp>
			{({ favorites, toggleFavorite, user }) => {
				const visibleTools = getVisibleTools(user);
				const filteredTools = visibleTools.filter((tool) => {
					const query = searchQuery.trim().toLowerCase();

					if (!query) {
						return true;
					}

					return `${tool.title} ${tool.description}`
						.toLowerCase()
						.includes(query);
				});
				const favoriteTools = visibleTools.filter((tool) =>
					favorites.includes(tool.id),
				);

				return (
					<div className="grid gap-8">
						<section className="grid gap-3">
							<div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
								<div className="min-w-0">
									<h2 className="text-2xl font-semibold tracking-normal">
										Tools
									</h2>
									<p className="text-sm text-muted-foreground">
										Pick a utility to open its page.
									</p>
								</div>
								<Input
									className="sm:max-w-72"
									onChange={(event) => setSearchQuery(event.target.value)}
									placeholder="Search tools"
									value={searchQuery}
								/>
							</div>
						</section>

						{favoriteTools.length > 0 ? (
							<section className="grid gap-3">
								<div className="flex items-center justify-between gap-3">
									<div className="flex items-center gap-2">
										<StarIcon className="text-primary" />
										<h3 className="font-semibold">Favorites</h3>
									</div>
									<Badge variant="outline">{favoriteTools.length}</Badge>
								</div>
								<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
									{favoriteTools.map((tool) => (
										<FavoriteToolItem key={tool.id} tool={tool} />
									))}
								</div>
							</section>
						) : null}

						<section className="grid gap-3">
							<h3 className="font-semibold">All tools</h3>
							{filteredTools.length > 0 ? (
								<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
									{filteredTools.map((tool) => (
										<ToolCard
											favorites={favorites}
											key={tool.id}
											onToggleFavorite={toggleFavorite}
											tool={tool}
										/>
									))}
								</div>
							) : (
								<div className="rounded-lg border bg-muted p-4 text-sm text-muted-foreground">
									No tools found.
								</div>
							)}
						</section>
					</div>
				);
			}}
		</AuthenticatedApp>
	);
}
