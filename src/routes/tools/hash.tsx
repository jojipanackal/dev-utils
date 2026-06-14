import { createFileRoute } from "@tanstack/react-router";
import {
	AuthenticatedApp,
	ToolPageHeader,
} from "#/components/dev-utils/app-shell";
import { HashGeneratorTool } from "#/components/tools/utility-tools";

export const Route = createFileRoute("/tools/hash")({
	component: HashPage,
});

function HashPage() {
	return (
		<AuthenticatedApp>
			{({ favorites, toggleFavorite }) => (
				<>
					<ToolPageHeader
						favorites={favorites}
						onToggleFavorite={toggleFavorite}
						toolId="hash"
					/>
					<HashGeneratorTool />
				</>
			)}
		</AuthenticatedApp>
	);
}
