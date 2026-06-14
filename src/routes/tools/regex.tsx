import { createFileRoute } from "@tanstack/react-router";
import {
	AuthenticatedApp,
	ToolPageHeader,
} from "#/components/dev-utils/app-shell";
import { RegexTesterTool } from "#/components/tools/utility-tools";

export const Route = createFileRoute("/tools/regex")({
	component: RegexPage,
});

function RegexPage() {
	return (
		<AuthenticatedApp>
			{({ favorites, toggleFavorite }) => (
				<>
					<ToolPageHeader
						favorites={favorites}
						onToggleFavorite={toggleFavorite}
						toolId="regex"
					/>
					<RegexTesterTool />
				</>
			)}
		</AuthenticatedApp>
	);
}
