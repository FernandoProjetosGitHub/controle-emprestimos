import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Button,
  Chip,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Tooltip,
  Typography,
} from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { BsMoonStarsFill, BsSunFill } from "react-icons/bs";
import { FiBarChart2, FiCheckCircle, FiCloudOff, FiCreditCard, FiLogOut, FiUsers } from "react-icons/fi";
import { HashRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Acesso from "./pages/Acesso";
import Clientes from "./pages/Clientes";
import Emprestimos from "./pages/Emprestimos";
import Resumo from "./pages/Resumo";
import { type AppColorMode, colors, createAppTheme } from "./theme";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const menuItems = [
  { label: "Resumo", path: "/resumo", icon: <FiBarChart2 size={21} /> },
  { label: "Clientes", path: "/clientes", icon: <FiUsers size={21} /> },
  {
    label: "Empréstimos",
    path: "/emprestimos",
    icon: <FiCreditCard size={21} />,
  },
];

const statusText = {
  local: "Modo local",
  carregando: "Conectando",
  sincronizado: "Sincronizado",
  salvando: "Salvando",
  erro: "Erro de sync",
};

const brandLogo = `${import.meta.env.BASE_URL}brand-jurista.png`;

const themeStorageKey = "controle-emprestimos-theme";

function getInitialColorMode(): AppColorMode {
  const savedMode = window.localStorage.getItem(themeStorageKey);

  if (savedMode === "light" || savedMode === "dark") {
    return savedMode;
  }

  return "light";
}

type ThemeToggleButtonProps = {
  colorMode: AppColorMode;
  onToggleTheme: () => void;
  compact?: boolean;
};

function ThemeToggleButton({ colorMode, onToggleTheme, compact }: ThemeToggleButtonProps) {
  const isDark = colorMode === "dark";

  return (
    <Tooltip title={isDark ? "Usar modo claro" : "Usar modo noturno"}>
      <IconButton
        aria-label={isDark ? "Ativar modo claro" : "Ativar modo noturno"}
        onClick={onToggleTheme}
        size={compact ? "small" : "medium"}
        sx={{
          width: compact ? 36 : 42,
          height: compact ? 36 : 42,
          color: isDark ? colors.warning : "#ffffff",
          bgcolor: isDark ? colors.warningLight : "rgba(255, 255, 255, 0.12)",
          border: `1px solid ${isDark ? colors.warningLight : "rgba(255, 255, 255, 0.22)"}`,
          "&:hover": {
            bgcolor: isDark ? colors.warningLight : "rgba(255, 255, 255, 0.18)",
          },
        }}
      >
        {isDark ? <BsSunFill size={compact ? 16 : 18} /> : <BsMoonStarsFill size={compact ? 15 : 17} />}
      </IconButton>
    </Tooltip>
  );
}

type LayoutProps = {
  colorMode: AppColorMode;
  onToggleTheme: () => void;
};

function Layout({ colorMode, onToggleTheme }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, syncStatus, logout } = useAuth();
  const currentPath = menuItems.some((item) => item.path === location.pathname)
    ? location.pathname
    : "/resumo";

  useEffect(() => {
    if (window.matchMedia("(max-width: 599px)").matches) {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  }, [location.pathname]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) return <Acesso colorMode={colorMode} onToggleTheme={onToggleTheme} />;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Box
        component="aside"
        sx={{
          width: 240,
          flexShrink: 0,
          background: `linear-gradient(180deg, ${colors.drawer} 0%, ${colors.drawerAccent} 100%)`,
          color: "white",
          display: { xs: "none", sm: "flex" },
          flexDirection: "column",
          px: 2,
          py: 3,
          boxShadow: "4px 0 18px rgba(15, 23, 42, 0.16)",
        }}
      >
        <Box
          sx={{
            px: 1,
            mb: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.25,
          }}
        >
          <Box
            component="img"
            src={brandLogo}
            alt="Jurista"
            sx={{
              width: 46,
              height: 46,
              borderRadius: "50%",
              flexShrink: 0,
              boxShadow: "0 8px 18px rgba(0,0,0,0.18)",
            }}
          />
          <ThemeToggleButton colorMode={colorMode} onToggleTheme={onToggleTheme} />
        </Box>

        <List sx={{ display: "grid", gap: 1, flex: 1 }}>
          {menuItems.map((item) => {
            const selected = location.pathname === item.path;

            return (
              <ListItemButton
                key={item.path}
                selected={selected}
                onClick={() => navigate(item.path)}
                sx={{
                  minHeight: 48,
                  borderRadius: 1,
                  color: selected ? colors.petroleum : "rgba(255,255,255,0.84)",
                  bgcolor: selected ? colors.surfaceElevated : "transparent",
                  justifyContent: "flex-start",
                  "&:hover": {
                    bgcolor: selected ? colors.surfaceElevated : "rgba(255,255,255,0.1)",
                  },
                  "&.Mui-selected": {
                    bgcolor: colors.surfaceElevated,
                  },
                  "&.Mui-selected:hover": {
                    bgcolor: colors.surfaceElevated,
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: "inherit",
                    minWidth: 40,
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography sx={{ fontWeight: selected ? 700 : 500 }}>
                      {item.label}
                    </Typography>
                  }
                />
              </ListItemButton>
            );
          })}
        </List>

        <Box
          sx={{
            mt: 3,
            pt: 2,
            borderTop: "1px solid rgba(255,255,255,0.16)",
            display: "grid",
            gap: 1,
          }}
        >
          <Chip
            icon={
              syncStatus === "sincronizado" ? (
                <FiCheckCircle />
              ) : (
                <FiCloudOff />
              )
            }
            label={statusText[syncStatus]}
            sx={{
              justifyContent: "flex-start",
              bgcolor:
                syncStatus === "sincronizado"
                  ? colors.successLight
                  : colors.warningLight,
              color:
                syncStatus === "sincronizado"
                  ? colors.success
                  : colors.warning,
              fontWeight: 700,
            }}
          />
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.72)" }} noWrap>
            {user.email}
          </Typography>
          <Button
            variant="contained"
            color="error"
            startIcon={<FiLogOut />}
            onClick={() => void logout()}
          >
            Sair
          </Button>
        </Box>
      </Box>

      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          pb: { xs: 9, sm: 0 },
        }}
      >
        <Box
          sx={{
            display: { xs: "flex", sm: "none" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            px: 1.5,
            pt: 1.5,
            bgcolor: "background.default",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              component="img"
              src={brandLogo}
              alt="Jurista"
              sx={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                boxShadow: "0 8px 18px rgba(0,0,0,0.16)",
              }}
            />
            <ThemeToggleButton colorMode={colorMode} onToggleTheme={onToggleTheme} compact />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
            <Chip
              label={statusText[syncStatus]}
              size="small"
              sx={{
                bgcolor:
                  syncStatus === "sincronizado"
                    ? colors.successLight
                    : colors.warningLight,
                color:
                  syncStatus === "sincronizado"
                    ? colors.success
                    : colors.warning,
                fontWeight: 700,
              }}
            />
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<FiLogOut />}
              onClick={() => void logout()}
            >
              Sair
            </Button>
          </Box>
        </Box>
        <Routes>
          <Route path="/" element={<Resumo />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/emprestimos" element={<Emprestimos />} />
          <Route path="/resumo" element={<Resumo />} />
        </Routes>
      </Box>

      <Box
        sx={{
          display: { xs: "block", sm: "none" },
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1200,
          borderTop: `1px solid ${colors.border}`,
          bgcolor: "background.paper",
          boxShadow:
            colorMode === "dark"
              ? "0 -10px 28px rgba(0, 0, 0, 0.36)"
              : "0 -8px 24px rgba(18, 48, 71, 0.14)",
        }}
      >
        <BottomNavigation
          showLabels
          value={currentPath}
          onChange={(_, value: string) => navigate(value)}
          sx={{
            bgcolor: "background.paper",
            height: 68,
            "& .MuiBottomNavigationAction-root": {
              color: colors.muted,
              minWidth: 0,
              px: 0.5,
            },
            "& .Mui-selected": {
              color: colors.petroleum,
            },
            "& .MuiBottomNavigationAction-label": {
              fontSize: 11,
              fontWeight: 700,
            },
          }}
        >
          {menuItems.map((item) => (
            <BottomNavigationAction
              key={item.path}
              label={item.label}
              value={item.path}
              icon={item.icon}
            />
          ))}
        </BottomNavigation>
      </Box>
    </Box>
  );
}

function App() {
  const [colorMode, setColorMode] = useState<AppColorMode>(() => getInitialColorMode());
  const appTheme = useMemo(() => createAppTheme(colorMode), [colorMode]);

  useEffect(() => {
    document.documentElement.dataset.theme = colorMode;
    window.localStorage.setItem(themeStorageKey, colorMode);
  }, [colorMode]);

  function handleToggleTheme() {
    setColorMode((current) => (current === "dark" ? "light" : "dark"));
  }

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <AuthProvider>
        <HashRouter>
          <Layout colorMode={colorMode} onToggleTheme={handleToggleTheme} />
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
