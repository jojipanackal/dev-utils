import { createFileRoute } from "@tanstack/react-router";
import {
	AuthenticatedApp,
	ToolPageHeader,
} from "#/components/dev-utils/app-shell";
import { Base64Tool } from "#/components/tools/utility-tools";

export const Route = createFileRoute("/tools/base64")({
	component: Base64Page,
});

function Base64Page() {
	return (
		<AuthenticatedApp>
			{({ favorites, toggleFavorite }) => (
				<>
					<ToolPageHeader
						favorites={favorites}
						onToggleFavorite={toggleFavorite}
						toolId="base64"
					/>
					<Base64Tool />
				</>
			)}
		</AuthenticatedApp>
	);
}
