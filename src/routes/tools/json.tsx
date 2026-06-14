import { createFileRoute } from "@tanstack/react-router";
import {
	AuthenticatedApp,
	ToolPageHeader,
} from "#/components/dev-utils/app-shell";
import { JsonComparisonTool } from "#/components/tools/json-comparison-tool";

export const Route = createFileRoute("/tools/json")({
	component: JsonToolPage,
});

function JsonToolPage() {
	return (
		<AuthenticatedApp>
			{({ favorites, toggleFavorite }) => (
				<>
					<ToolPageHeader
						favorites={favorites}
						onToggleFavorite={toggleFavorite}
						toolId="json"
					/>
					<JsonComparisonTool />
				</>
			)}
		</AuthenticatedApp>
	);
}
