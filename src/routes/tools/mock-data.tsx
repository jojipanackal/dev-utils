import { createFileRoute } from "@tanstack/react-router";
import {
	AuthenticatedApp,
	ToolPageHeader,
} from "#/components/dev-utils/app-shell";
import { MockDataGeneratorTool } from "#/components/tools/utility-tools";

export const Route = createFileRoute("/tools/mock-data")({
	component: MockDataPage,
});

function MockDataPage() {
	return (
		<AuthenticatedApp>
			{({ favorites, toggleFavorite }) => (
				<>
					<ToolPageHeader
						favorites={favorites}
						onToggleFavorite={toggleFavorite}
						toolId="mock-data"
					/>
					<MockDataGeneratorTool />
				</>
			)}
		</AuthenticatedApp>
	);
}
