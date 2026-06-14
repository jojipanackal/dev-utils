import { createFileRoute } from "@tanstack/react-router";
import {
	AuthenticatedApp,
	ToolPageHeader,
} from "#/components/dev-utils/app-shell";
import { BeveragePollTool } from "#/components/tools/beverage-poll-tool";

export const Route = createFileRoute("/tools/beverage")({
	component: BeverageToolPage,
});

function BeverageToolPage() {
	return (
		<AuthenticatedApp>
			{({ favorites, toggleFavorite, user }) => (
				<>
					<ToolPageHeader
						favorites={favorites}
						onToggleFavorite={toggleFavorite}
						toolId="beverage"
					/>
					<BeveragePollTool user={user} />
				</>
			)}
		</AuthenticatedApp>
	);
}
