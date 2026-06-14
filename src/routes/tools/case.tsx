import { createFileRoute } from "@tanstack/react-router";
import {
	AuthenticatedApp,
	ToolPageHeader,
} from "#/components/dev-utils/app-shell";
import { TextCaseConverterTool } from "#/components/tools/utility-tools";

export const Route = createFileRoute("/tools/case")({
	component: CasePage,
});

function CasePage() {
	return (
		<AuthenticatedApp>
			{({ favorites, toggleFavorite }) => (
				<>
					<ToolPageHeader
						favorites={favorites}
						onToggleFavorite={toggleFavorite}
						toolId="case"
					/>
					<TextCaseConverterTool />
				</>
			)}
		</AuthenticatedApp>
	);
}
