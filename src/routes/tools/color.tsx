import { createFileRoute } from "@tanstack/react-router";
import {
	AuthenticatedApp,
	ToolPageHeader,
} from "#/components/dev-utils/app-shell";
import { ColorConverterTool } from "#/components/tools/utility-tools";

export const Route = createFileRoute("/tools/color")({
	component: ColorPage,
});

function ColorPage() {
	return (
		<AuthenticatedApp>
			{({ favorites, toggleFavorite }) => (
				<>
					<ToolPageHeader
						favorites={favorites}
						onToggleFavorite={toggleFavorite}
						toolId="color"
					/>
					<ColorConverterTool />
				</>
			)}
		</AuthenticatedApp>
	);
}
