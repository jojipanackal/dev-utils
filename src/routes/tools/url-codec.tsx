import { createFileRoute } from "@tanstack/react-router";
import {
	AuthenticatedApp,
	ToolPageHeader,
} from "#/components/dev-utils/app-shell";
import { UrlCodecTool } from "#/components/tools/utility-tools";

export const Route = createFileRoute("/tools/url-codec")({
	component: UrlCodecPage,
});

function UrlCodecPage() {
	return (
		<AuthenticatedApp>
			{({ favorites, toggleFavorite }) => (
				<>
					<ToolPageHeader
						favorites={favorites}
						onToggleFavorite={toggleFavorite}
						toolId="url-codec"
					/>
					<UrlCodecTool />
				</>
			)}
		</AuthenticatedApp>
	);
}
