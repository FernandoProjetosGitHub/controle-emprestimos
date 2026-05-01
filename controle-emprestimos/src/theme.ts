import { createTheme } from "@mui/material/styles";

export const colors = {
  petroleum: "#123047",
  petroleumDark: "#0b2538",
  petroleumLight: "#dcecf1",
  background: "#f7f2e8",
  surface: "#fffaf0",
  border: "#e6dccb",
  text: "#172033",
  muted: "#667985",
  success: "#1e7a5a",
  successLight: "#e3f3ec",
  warning: "#c9891f",
  warningLight: "#fff4dc",
  error: "#b83a3a",
  errorLight: "#fde8e8",
};

export const appTheme = createTheme({
  palette: {
    primary: {
      main: colors.petroleum,
      dark: colors.petroleumDark,
      light: colors.petroleumLight,
      contrastText: "#ffffff",
    },
    success: {
      main: colors.success,
      light: colors.successLight,
      contrastText: "#ffffff",
    },
    warning: {
      main: colors.warning,
      light: colors.warningLight,
      contrastText: colors.petroleumDark,
    },
    error: {
      main: colors.error,
      light: colors.errorLight,
      contrastText: "#ffffff",
    },
    background: {
      default: colors.background,
      paper: colors.surface,
    },
    text: {
      primary: colors.text,
      secondary: colors.muted,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
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
          boxShadow: "0 10px 30px rgba(18, 48, 71, 0.08)",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderLeft: `1px solid ${colors.border}`,
          boxShadow: "-12px 0 32px rgba(18, 48, 71, 0.16)",
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
          color: colors.petroleumDark,
          fontWeight: 700,
        },
      },
    },
  },
});
