import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import DashboardTwoToneIcon from "@mui/icons-material/DashboardTwoTone";
import GroupTwoToneIcon from "@mui/icons-material/GroupTwoTone";
import AccountBalanceWalletTwoToneIcon from "@mui/icons-material/AccountBalanceWalletTwoTone";
import { HashRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Clientes from "./pages/Clientes";
import Emprestimos from "./pages/Emprestimos";
import Resumo from "./pages/Resumo";
import { appTheme, colors } from "./theme";
import { AuthProvider } from "./contexts/AuthContext";
import AuthBar from "./components/AuthBar";

const menuItems = [
  { label: "Resumo", path: "/resumo", icon: <DashboardTwoToneIcon /> },
  { label: "Clientes", path: "/", icon: <GroupTwoToneIcon /> },
  {
    label: "Empréstimos",
    path: "/emprestimos",
    icon: <AccountBalanceWalletTwoToneIcon />,
  },
];

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = menuItems.some((item) => item.path === location.pathname)
    ? location.pathname
    : "/";

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
        <Typography
          variant="h6"
          sx={{
            px: 1,
            mb: 3,
            fontWeight: 700,
            lineHeight: 1.2,
          }}
        >
          Controle de Empréstimos
        </Typography>

        <List sx={{ display: "grid", gap: 1 }}>
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
      </Box>

      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          pb: { xs: 9, sm: 0 },
        }}
      >
        <AuthBar />
        <Routes>
          <Route path="/" element={<Clientes />} />
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
