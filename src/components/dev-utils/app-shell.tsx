import { Link, useNavigate } from "@tanstack/react-router";
import {
	ChevronDownIcon,
	LaptopIcon,
	LockKeyholeIcon,
	LogOutIcon,
	MoonIcon,
	StarIcon,
	SunIcon,
	TimerResetIcon,
	WrenchIcon,
	XIcon,
} from "lucide-react";
import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { Input } from "#/components/ui/input";
import { Separator } from "#/components/ui/separator";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/ui/tooltip";
import { authClient } from "#/lib/auth-client";
import {
	type DevUser,
	demoUserStorageKey,
	isMygateUser,
	type LoginMode,
	mygateDefaultFavoriteStorageKey,
	type ThemePreference,
	type ToolId,
	toolCatalog,
} from "#/lib/dev-utils-data";
import {
	readErrorMessage,
	useLocalStorageState,
	useThemePreference,
} from "#/lib/dev-utils-state";
import {
	getFavorites,
	setFavorites as persistFavorites,
} from "#/lib/server-user-data";
import { cn } from "#/lib/utils";

export type AuthenticatedContext = {
	favorites: Array<ToolId>;
	toggleFavorite: (toolId: ToolId) => void;
	user: DevUser;
};

export function AuthenticatedApp({
	children,
}: {
	children: (context: AuthenticatedContext) => React.ReactNode;
}) {
	const { data: session, isPending } = authClient.useSession();
	const [demoUser, setDemoUser] = useLocalStorageState<DevUser | null>(
		demoUserStorageKey,
		null,
	);
	const [theme, setTheme] = useThemePreference();
	const [favorites, setFavorites] = React.useState<Array<ToolId>>([]);
	const [mygateDefaultFavoriteApplied, setMygateDefaultFavoriteApplied] =
		useLocalStorageState(mygateDefaultFavoriteStorageKey, false);
	const [showGuestNotice, setShowGuestNotice] = React.useState(false);
	const currentUser = session?.user ?? demoUser;
	const [cachedUser, setCachedUser] = React.useState<DevUser | null>(null);
	const user = currentUser ?? (isPending ? cachedUser : null);
	const isGuest = user?.email === "guest@company.test";

	React.useEffect(() => {
		if (currentUser) {
			setCachedUser(currentUser);
		}
	}, [currentUser]);

	React.useEffect(() => {
		if (!user || isGuest) {
			setFavorites([]);
			return;
		}

		let isCurrent = true;
		void getFavorites()
			.then((nextFavorites) => {
				if (isCurrent) {
					const shouldApplyMygateDefault =
						isMygateUser(user.email) &&
						!mygateDefaultFavoriteApplied &&
						!nextFavorites.includes("beverage");
					const resolvedFavorites = shouldApplyMygateDefault
						? ["beverage", ...nextFavorites]
						: nextFavorites;

					setFavorites(resolvedFavorites);

					if (shouldApplyMygateDefault) {
						setMygateDefaultFavoriteApplied(true);
						void persistFavorites({ data: resolvedFavorites });
					}
				}
			})
			.catch(() => {
				if (isCurrent) {
					setFavorites([]);
				}
			});

		return () => {
			isCurrent = false;
		};
	}, [
		isGuest,
		mygateDefaultFavoriteApplied,
		setMygateDefaultFavoriteApplied,
		user,
	]);

	function toggleFavorite(toolId: ToolId) {
		setFavorites((current) => {
			const next = current.includes(toolId)
				? current.filter((id) => id !== toolId)
				: [...current, toolId];

			if (!isGuest) {
				void persistFavorites({ data: next });
			}

			return next;
		});
	}

	if (isPending && !user) {
		return <LoadingScreen />;
	}

	if (!user) {
		return (
			<LoginScreen
				onDemoAccess={() => {
					setDemoUser({
						name: "Guest",
						email: "guest@company.test",
						image: null,
					});
					setShowGuestNotice(true);
				}}
				theme={theme}
				onThemeChange={setTheme}
			/>
		);
	}

	return (
		<AppShell
			onSignOut={() => {
				setDemoUser(null);
				setCachedUser(null);
				setShowGuestNotice(false);
				void authClient.signOut();
			}}
			isGuest={isGuest}
			onDismissGuestNotice={() => setShowGuestNotice(false)}
			theme={theme}
			onThemeChange={setTheme}
			showGuestNotice={showGuestNotice}
			user={user}
		>
			{children({ favorites, toggleFavorite, user })}
		</AppShell>
	);
}

function LoadingScreen() {
	return (
		<main className="grid min-h-dvh place-items-center px-6">
			<div className="flex items-center gap-3 text-sm text-muted-foreground">
				<TimerResetIcon className="animate-spin" />
				Loading
			</div>
		</main>
	);
}

function LoginScreen({
	onDemoAccess,
	theme,
	onThemeChange,
}: {
	onDemoAccess: () => void;
	theme: ThemePreference;
	onThemeChange: (theme: ThemePreference) => void;
}) {
	const [mode, setMode] = React.useState<LoginMode>("sign-in");
	const [name, setName] = React.useState("");
	const [email, setEmail] = React.useState("");
	const [password, setPassword] = React.useState("");
	const [message, setMessage] = React.useState("");
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	async function handleEmailAuth(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsSubmitting(true);
		setMessage("");

		try {
			const result =
				mode === "sign-up"
					? await authClient.signUp.email({
							email,
							password,
							name: name || email.split("@")[0] || "Dev Utils User",
						})
					: await authClient.signIn.email({ email, password });

			if ("error" in result && result.error) {
				setMessage(result.error.message ?? "Authentication failed.");
			}
		} catch (error) {
			setMessage(readErrorMessage(error));
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleGoogleAuth() {
		setMessage("");
		try {
			await authClient.signIn.social({
				provider: "google",
				callbackURL: "/",
			});
		} catch (error) {
			setMessage(readErrorMessage(error));
		}
	}

	return (
		<main className="grid min-h-dvh place-items-center px-4 py-8">
			<div className="grid w-full max-w-[420px] gap-4">
				<div className="flex items-start justify-between gap-4">
					<div className="flex min-w-0 items-start gap-3">
						<div className="grid size-10 shrink-0 place-items-center rounded-lg border bg-muted text-foreground">
							<WrenchIcon />
						</div>
						<div className="min-w-0">
							<div className="flex min-w-0 items-center gap-2">
								<h1 className="truncate text-xl font-semibold">Dev Utils</h1>
								<Badge variant="secondary">Beta</Badge>
							</div>
						</div>
					</div>
					<ThemeMenu theme={theme} onThemeChange={onThemeChange} />
				</div>

				<Card className="w-full max-w-[420px] shadow-sm">
					<CardHeader>
						<CardTitle>
							{mode === "sign-up" ? "Create account" : "Sign in"}
						</CardTitle>
						<CardDescription>
							{mode === "sign-up"
								? "Create an account."
								: "Sign in to continue."}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form className="grid gap-4" onSubmit={handleEmailAuth}>
							<div className="grid gap-2">
								<label className="text-sm font-medium" htmlFor="email">
									Email
								</label>
								<Input
									autoComplete="email"
									id="email"
									onChange={(event) => setEmail(event.target.value)}
									placeholder="you@company.com"
									required
									type="email"
									value={email}
								/>
							</div>
							{mode === "sign-up" ? (
								<div className="grid gap-2">
									<label className="text-sm font-medium" htmlFor="name">
										Name
									</label>
									<Input
										autoComplete="name"
										id="name"
										onChange={(event) => setName(event.target.value)}
										placeholder="Your name"
										value={name}
									/>
								</div>
							) : null}
							<div className="grid gap-2">
								<label className="text-sm font-medium" htmlFor="password">
									Password
								</label>
								<Input
									autoComplete={
										mode === "sign-up" ? "new-password" : "current-password"
									}
									id="password"
									minLength={8}
									onChange={(event) => setPassword(event.target.value)}
									placeholder="At least 8 characters"
									required
									type="password"
									value={password}
								/>
							</div>

							{message ? (
								<p className="rounded-lg border bg-muted px-3 py-2 text-sm text-muted-foreground">
									{message}
								</p>
							) : null}

							<Button disabled={isSubmitting} size="lg" type="submit">
								<LockKeyholeIcon data-icon="inline-start" />
								{isSubmitting
									? "Working"
									: mode === "sign-up"
										? "Create account"
										: "Sign in"}
							</Button>
						</form>

						<div className="my-4 flex items-center gap-3">
							<Separator className="flex-1" />
							<span className="text-xs text-muted-foreground">or</span>
							<Separator className="flex-1" />
						</div>

						<div className="grid gap-2">
							<Button onClick={handleGoogleAuth} size="lg" variant="outline">
								<GoogleIcon data-icon="inline-start" />
								Continue with Google
							</Button>
							<Button onClick={onDemoAccess} size="lg" variant="ghost">
								Continue as guest
							</Button>
						</div>
					</CardContent>
					<CardFooter className="justify-between gap-3">
						<span className="text-sm text-muted-foreground">
							{mode === "sign-in" ? "No account?" : "Already have one?"}
						</span>
						<Button
							onClick={() =>
								setMode((current) =>
									current === "sign-in" ? "sign-up" : "sign-in",
								)
							}
							type="button"
							variant="outline"
						>
							{mode === "sign-in" ? "Sign up" : "Sign in"}
						</Button>
					</CardFooter>
				</Card>
			</div>
		</main>
	);
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg aria-hidden="true" viewBox="0 0 24 24" {...props}>
			<path
				d="M21.6 12.23c0-.74-.07-1.45-.19-2.14H12v4.05h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.32 2.98-7.44z"
				fill="#4285F4"
			/>
			<path
				d="M12 22c2.7 0 4.97-.9 6.62-2.43l-3.24-2.51c-.9.6-2.04.96-3.38.96-2.6 0-4.81-1.76-5.6-4.13H3.05v2.59A10 10 0 0 0 12 22z"
				fill="#34A853"
			/>
			<path
				d="M6.4 13.89a6 6 0 0 1 0-3.78V7.52H3.05a10 10 0 0 0 0 8.96l3.35-2.59z"
				fill="#FBBC05"
			/>
			<path
				d="M12 5.98c1.47 0 2.79.5 3.82 1.5l2.87-2.87A9.63 9.63 0 0 0 12 2 10 10 0 0 0 3.05 7.52l3.35 2.59C7.19 7.74 9.4 5.98 12 5.98z"
				fill="#EA4335"
			/>
		</svg>
	);
}

function AppShell({
	children,
	isGuest,
	onDismissGuestNotice,
	onSignOut,
	showGuestNotice,
	theme,
	onThemeChange,
	user,
}: {
	children: React.ReactNode;
	isGuest: boolean;
	onDismissGuestNotice: () => void;
	onSignOut: () => void;
	showGuestNotice: boolean;
	theme: ThemePreference;
	onThemeChange: (theme: ThemePreference) => void;
	user: DevUser;
}) {
	return (
		<main className="min-h-dvh">
			<header className="sticky top-0 border-b bg-background/92 backdrop-blur">
				<div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3">
					<Link className="flex min-w-0 items-center gap-3" to="/">
						<div className="grid size-9 shrink-0 place-items-center rounded-lg border bg-muted text-foreground">
							<WrenchIcon />
						</div>
						<div className="min-w-0">
							<div className="flex min-w-0 items-center gap-2">
								<h1 className="truncate text-lg font-semibold text-foreground">
									Dev Utils
								</h1>
								<Badge variant="secondary">Beta</Badge>
							</div>
						</div>
					</Link>

					<div className="flex items-center justify-end gap-2">
						<ThemeMenu theme={theme} onThemeChange={onThemeChange} />
						<UserMenu onSignOut={onSignOut} user={user} />
					</div>
				</div>
			</header>
			<div className="mx-auto w-full max-w-7xl px-4 py-6">{children}</div>
			{isGuest && showGuestNotice ? (
				<GuestNotice onClose={onDismissGuestNotice} />
			) : null}
		</main>
	);
}

function GuestNotice({ onClose }: { onClose: () => void }) {
	return (
		<div className="fixed inset-0 grid place-items-center bg-background/80 px-4 backdrop-blur">
			<Card className="w-full max-w-md shadow-lg">
				<CardHeader>
					<div className="flex items-start justify-between gap-4">
						<div className="grid gap-1">
							<CardTitle>Guest mode</CardTitle>
							<CardDescription>
								Some features are only available when logged in.
							</CardDescription>
						</div>
						<Button onClick={onClose} size="icon-sm" variant="ghost">
							<XIcon data-icon="inline-start" />
							<span className="sr-only">Close</span>
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						You can still use the local tools, but account-backed features may
						be limited.
					</p>
				</CardContent>
				<CardFooter className="justify-end">
					<Button onClick={onClose}>Continue</Button>
				</CardFooter>
			</Card>
		</div>
	);
}

export function ToolCard({
	favorites,
	onToggleFavorite,
	tool,
}: {
	favorites: Array<ToolId>;
	onToggleFavorite: (toolId: ToolId) => void;
	tool: (typeof toolCatalog)[number];
}) {
	const Icon = tool.icon;
	const isFavorite = favorites.includes(tool.id);
	const navigate = useNavigate();

	return (
		<Card
			className="min-h-44 cursor-pointer shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
			onClick={() => void navigate({ to: tool.path })}
			onKeyDown={(event) => {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					void navigate({ to: tool.path });
				}
			}}
			role="button"
			tabIndex={0}
		>
			<CardHeader>
				<div className="flex items-start justify-between gap-3">
					<div
						className={cn(
							"grid size-10 place-items-center rounded-lg",
							tool.accent,
						)}
					>
						<Icon />
					</div>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								onClick={(event) => {
									event.stopPropagation();
									event.preventDefault();
									onToggleFavorite(tool.id);
								}}
								onKeyDown={(event) => event.stopPropagation()}
								size="icon-sm"
								type="button"
								variant="ghost"
							>
								<StarIcon
									className={cn(isFavorite && "fill-current text-primary")}
									data-icon="inline-start"
								/>
								<span className="sr-only">
									{isFavorite ? "Remove favorite" : "Favorite tool"}
								</span>
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							{isFavorite ? "Remove favorite" : "Favorite tool"}
						</TooltipContent>
					</Tooltip>
				</div>
				<CardTitle>{tool.title}</CardTitle>
				<CardDescription>{tool.description}</CardDescription>
			</CardHeader>
		</Card>
	);
}

export function FavoriteToolItem({
	tool,
}: {
	tool: (typeof toolCatalog)[number];
}) {
	const Icon = tool.icon;
	const navigate = useNavigate();

	return (
		<button
			className="flex h-16 items-center gap-3 rounded-lg border bg-card px-3 text-left text-card-foreground shadow-sm transition hover:bg-muted"
			onClick={() => void navigate({ to: tool.path })}
			type="button"
		>
			<div
				className={cn(
					"grid size-9 shrink-0 place-items-center rounded-lg",
					tool.accent,
				)}
			>
				<Icon />
			</div>
			<span className="truncate text-sm font-medium">{tool.title}</span>
		</button>
	);
}

export function ToolPageHeader({
	favorites,
	onToggleFavorite,
	toolId,
}: {
	favorites: Array<ToolId>;
	onToggleFavorite: (toolId: ToolId) => void;
	toolId: ToolId;
}) {
	const tool = toolCatalog.find((item) => item.id === toolId) ?? toolCatalog[0];
	const Icon = tool.icon;
	const isFavorite = favorites.includes(toolId);

	return (
		<div className="mb-4 flex flex-col justify-between gap-4 rounded-xl border bg-card p-4 text-card-foreground sm:flex-row sm:items-start">
			<div className="flex gap-3">
				<div
					className={cn(
						"grid size-11 shrink-0 place-items-center rounded-lg",
						tool.accent,
					)}
				>
					<Icon />
				</div>
				<div className="grid gap-1">
					<h2 className="text-2xl font-semibold tracking-normal">
						{tool.title}
					</h2>
					<p className="max-w-2xl text-sm text-muted-foreground">
						{tool.description}
					</p>
				</div>
			</div>
			<Button onClick={() => onToggleFavorite(toolId)} variant="outline">
				<StarIcon
					className={cn(isFavorite && "fill-current text-primary")}
					data-icon="inline-start"
				/>
				{isFavorite ? "Favorited" : "Favorite"}
			</Button>
		</div>
	);
}

function ThemeMenu({
	theme,
	onThemeChange,
}: {
	theme: ThemePreference;
	onThemeChange: (theme: ThemePreference) => void;
}) {
	const themeLabels: Record<ThemePreference, string> = {
		system: "System",
		light: "Light",
		dark: "Dark",
	};

	const nextTheme: Record<ThemePreference, ThemePreference> = {
		system: "light",
		light: "dark",
		dark: "system",
	};

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					onClick={() => onThemeChange(nextTheme[theme])}
					size="icon"
					type="button"
					variant="outline"
				>
					{theme === "dark" ? (
						<MoonIcon data-icon="inline-start" />
					) : theme === "light" ? (
						<SunIcon data-icon="inline-start" />
					) : (
						<LaptopIcon data-icon="inline-start" />
					)}
					<span className="sr-only">Theme: {themeLabels[theme]}</span>
				</Button>
			</TooltipTrigger>
			<TooltipContent>Theme: {themeLabels[theme]}</TooltipContent>
		</Tooltip>
	);
}

function UserMenu({
	onSignOut,
	user,
}: {
	onSignOut: () => void;
	user: DevUser;
}) {
	const fallback = user.name?.charAt(0).toUpperCase() || "U";
	const isGuest = user.email === "guest@company.test";

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button className="gap-2" variant="ghost">
					<Avatar className="size-7">
						<AvatarImage alt="" src={user.image ?? undefined} />
						<AvatarFallback>{fallback}</AvatarFallback>
					</Avatar>
					<span className="hidden max-w-36 truncate sm:inline">
						{user.name}
					</span>
					<ChevronDownIcon data-icon="inline-end" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{isGuest ? null : (
					<>
						<DropdownMenuLabel>
							<span className="block">{user.name}</span>
							<span className="block truncate font-normal text-muted-foreground">
								{user.email}
							</span>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
					</>
				)}
				<DropdownMenuItem onClick={onSignOut}>
					<LogOutIcon />
					Sign out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
