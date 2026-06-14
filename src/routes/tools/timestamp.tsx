import { createFileRoute } from "@tanstack/react-router";
import {
	AuthenticatedApp,
	ToolPageHeader,
} from "#/components/dev-utils/app-shell";
import { TimestampTool } from "#/components/tools/timestamp-tool";

export const Route = createFileRoute("/tools/timestamp")({
	component: TimestampToolPage,
});

function TimestampToolPage() {
	return (
		<AuthenticatedApp>
			{({ favorites, toggleFavorite }) => (
				<>
					<ToolPageHeader
						favorites={favorites}
						onToggleFavorite={toggleFavorite}
						toolId="timestamp"
					/>
					<TimestampTool />
				</>
			)}
		</AuthenticatedApp>
	);
}
