import {
  useEffect,
} from "react";
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Button,
  Chip,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Typography,
} from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import DashboardTwoToneIcon from "@mui/icons-material/DashboardTwoTone";
import GroupTwoToneIcon from "@mui/icons-material/GroupTwoTone";
import AccountBalanceWalletTwoToneIcon from "@mui/icons-material/AccountBalanceWalletTwoTone";
import CloudDoneTwoToneIcon from "@mui/icons-material/CloudDoneTwoTone";
import CloudOffTwoToneIcon from "@mui/icons-material/CloudOffTwoTone";
import LogoutTwoToneIcon from "@mui/icons-material/LogoutTwoTone";
import { HashRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Acesso from "./pages/Acesso";
import Clientes from "./pages/Clientes";
import Emprestimos from "./pages/Emprestimos";
import Resumo from "./pages/Resumo";
import { appTheme, colors } from "./theme";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const menuItems = [
  { label: "Resumo", path: "/resumo", icon: <DashboardTwoToneIcon /> },
  { label: "Clientes", path: "/clientes", icon: <GroupTwoToneIcon /> },
  {
    label: "Empréstimos",
    path: "/emprestimos",
    icon: <AccountBalanceWalletTwoToneIcon />,
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

function Layout() {
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

  if (!user) return <Acesso />;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Box
        component="aside"
        sx={{
          width: 240,
          flexShrink: 0,
          bgcolor: colors.petroleum,
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
                  bgcolor: selected ? "white" : "transparent",
                  justifyContent: "flex-start",
                  "&:hover": {
                    bgcolor: selected ? "white" : "rgba(255,255,255,0.1)",
                  },
                  "&.Mui-selected": {
                    bgcolor: "white",
                  },
                  "&.Mui-selected:hover": {
                    bgcolor: "white",
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
                <CloudDoneTwoToneIcon />
              ) : (
                <CloudOffTwoToneIcon />
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
            startIcon={<LogoutTwoToneIcon />}
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
            startIcon={<LogoutTwoToneIcon />}
            onClick={() => void logout()}
          >
            Sair
          </Button>
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
          boxShadow: "0 -8px 24px rgba(18, 48, 71, 0.14)",
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
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <AuthProvider>
        <HashRouter>
          <Layout />
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
