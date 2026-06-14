import { createFileRoute } from "@tanstack/react-router";
import {
	AuthenticatedApp,
	ToolPageHeader,
} from "#/components/dev-utils/app-shell";
import { UuidGeneratorTool } from "#/components/tools/utility-tools";

export const Route = createFileRoute("/tools/uuid")({
	component: UuidPage,
});

function UuidPage() {
	return (
		<AuthenticatedApp>
			{({ favorites, toggleFavorite }) => (
				<>
					<ToolPageHeader
						favorites={favorites}
						onToggleFavorite={toggleFavorite}
						toolId="uuid"
					/>
					<UuidGeneratorTool />
				</>
			)}
		</AuthenticatedApp>
	);
}
