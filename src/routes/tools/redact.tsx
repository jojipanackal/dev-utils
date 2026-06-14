import { createFileRoute } from "@tanstack/react-router";
import {
	AuthenticatedApp,
	ToolPageHeader,
} from "#/components/dev-utils/app-shell";
import { SensitiveDataMaskerTool } from "#/components/tools/sensitive-data-masker-tool";

export const Route = createFileRoute("/tools/redact")({
	component: SensitiveDataMaskerPage,
});

function SensitiveDataMaskerPage() {
	return (
		<AuthenticatedApp>
			{({ favorites, toggleFavorite }) => (
				<>
					<ToolPageHeader
						favorites={favorites}
						onToggleFavorite={toggleFavorite}
						toolId="redact"
					/>
					<SensitiveDataMaskerTool />
				</>
			)}
		</AuthenticatedApp>
	);
}
