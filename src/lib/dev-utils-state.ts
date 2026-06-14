import * as React from "react";
import { type ThemePreference, themeStorageKey } from "#/lib/dev-utils-data";

export function readErrorMessage(error: unknown) {
	return error instanceof Error ? error.message : "Something went wrong.";
}

export function useThemePreference() {
	const [theme, setTheme] = useLocalStorageState<ThemePreference>(
		themeStorageKey,
		"system",
	);

	React.useEffect(() => {
		const media = window.matchMedia("(prefers-color-scheme: dark)");

		function applyTheme() {
			const shouldUseDark =
				theme === "dark" || (theme === "system" && media.matches);
			document.documentElement.classList.toggle("dark", shouldUseDark);
			document.documentElement.style.colorScheme = shouldUseDark
				? "dark"
				: "light";
		}

		applyTheme();
		media.addEventListener("change", applyTheme);
		return () => media.removeEventListener("change", applyTheme);
	}, [theme]);

	return [theme, setTheme] as const;
}

export function useLocalStorageState<T>(
	key: string,
	initialValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
	const [value, setValue] = React.useState<T>(() => {
		if (typeof window === "undefined") {
			return initialValue;
		}

		const stored = window.localStorage.getItem(key);
		if (!stored) {
			return initialValue;
		}

		try {
			return JSON.parse(stored) as T;
		} catch {
			return initialValue;
		}
	});

	React.useEffect(() => {
		window.localStorage.setItem(key, JSON.stringify(value));
	}, [key, value]);

	return [value, setValue];
}
