import { createTheme } from "@mui/material/styles";

export type AppColorMode = "light" | "dark";

const lightPalette = {
  petroleum: "#123047",
  petroleumDark: "#0b2538",
  petroleumLight: "#dcecf1",
  drawer: "#123047",
  drawerAccent: "#1f5b73",
  background: "#f7f2e8",
  surface: "#fffaf0",
  surfaceElevated: "#ffffff",
  border: "#e4d8c7",
  text: "#172033",
  muted: "#667985",
  success: "#1e7a5a",
  successLight: "#dff2e9",
  warning: "#c9891f",
  warningLight: "#fff1d3",
  error: "#b83a3a",
  errorLight: "#fae2e2",
};

const darkPalette = {
  petroleum: "#8cc7d8",
  petroleumDark: "#081923",
  petroleumLight: "#183847",
  drawer: "#07131d",
  drawerAccent: "#13475a",
  background: "#0b1418",
  surface: "#121f25",
  surfaceElevated: "#172a31",
  border: "#2b424b",
  text: "#eef6f4",
  muted: "#a8b7b6",
  success: "#77d9aa",
  successLight: "rgba(119, 217, 170, 0.18)",
  warning: "#f2c14e",
  warningLight: "rgba(242, 193, 78, 0.2)",
  error: "#f08a82",
  errorLight: "rgba(240, 138, 130, 0.18)",
};

export const paletteByMode = {
  light: lightPalette,
  dark: darkPalette,
};

type ColorKey = keyof typeof lightPalette;

function cssVarName(key: ColorKey) {
  return `--app-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
}

function cssVarsFor(mode: AppColorMode) {
  const palette = paletteByMode[mode];

  return Object.fromEntries(
    Object.entries(palette).map(([key, value]) => [cssVarName(key as ColorKey), value]),
  );
}

export const colors: Record<ColorKey, string> = {
  petroleum: "var(--app-petroleum)",
  petroleumDark: "var(--app-petroleum-dark)",
  petroleumLight: "var(--app-petroleum-light)",
  drawer: "var(--app-drawer)",
  drawerAccent: "var(--app-drawer-accent)",
  background: "var(--app-background)",
  surface: "var(--app-surface)",
  surfaceElevated: "var(--app-surface-elevated)",
  border: "var(--app-border)",
  text: "var(--app-text)",
  muted: "var(--app-muted)",
  success: "var(--app-success)",
  successLight: "var(--app-success-light)",
  warning: "var(--app-warning)",
  warningLight: "var(--app-warning-light)",
  error: "var(--app-error)",
  errorLight: "var(--app-error-light)",
};

export function createAppTheme(mode: AppColorMode) {
  const palette = paletteByMode[mode];

  return createTheme({
    palette: {
      mode,
      primary: {
        main: palette.petroleum,
        dark: palette.petroleumDark,
        light: palette.petroleumLight,
        contrastText: mode === "dark" ? palette.petroleumDark : "#ffffff",
      },
      success: {
        main: palette.success,
        light: palette.successLight,
        contrastText: mode === "dark" ? palette.petroleumDark : "#ffffff",
      },
      warning: {
        main: palette.warning,
        light: palette.warningLight,
        contrastText: palette.petroleumDark,
      },
      error: {
        main: palette.error,
        light: palette.errorLight,
        contrastText: mode === "dark" ? palette.petroleumDark : "#ffffff",
      },
      background: {
        default: palette.background,
        paper: palette.surface,
      },
      text: {
        primary: palette.text,
        secondary: palette.muted,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ":root": cssVarsFor(mode),
          body: {
            backgroundColor: palette.background,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 700,
            borderRadius: 8,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            border: `1px solid ${colors.border}`,
            boxShadow:
              mode === "dark"
                ? "0 14px 38px rgba(0, 0, 0, 0.34)"
                : "0 10px 30px rgba(18, 48, 71, 0.08)",
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderLeft: `1px solid ${colors.border}`,
            backgroundImage: "none",
            boxShadow:
              mode === "dark"
                ? "-12px 0 36px rgba(0, 0, 0, 0.42)"
                : "-12px 0 32px rgba(18, 48, 71, 0.16)",
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: colors.surfaceElevated,
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: colors.petroleumLight,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            color: mode === "dark" ? palette.text : palette.petroleumDark,
            fontWeight: 700,
          },
        },
      },
    },
  });
}
