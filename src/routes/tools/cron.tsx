import { createFileRoute } from "@tanstack/react-router";
import {
	AuthenticatedApp,
	ToolPageHeader,
} from "#/components/dev-utils/app-shell";
import { CronParserTool } from "#/components/tools/utility-tools";

export const Route = createFileRoute("/tools/cron")({
	component: CronPage,
});

function CronPage() {
	return (
		<AuthenticatedApp>
			{({ favorites, toggleFavorite }) => (
				<>
					<ToolPageHeader
						favorites={favorites}
						onToggleFavorite={toggleFavorite}
						toolId="cron"
					/>
					<CronParserTool />
				</>
			)}
		</AuthenticatedApp>
	);
}
